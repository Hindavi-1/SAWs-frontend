"use client";

import * as React from "react";
import * as api from "@/lib/api";
import type { OutreachMessage, OutreachStatus, EvidenceItem } from "@/lib/types";
import { DraftQueue } from "@/components/features/outreach-review/draft-queue";
import { DraftCanvas } from "@/components/features/outreach-review/draft-canvas";
import { ContextRail } from "@/components/features/outreach-review/context-rail";
import { RejectDialog } from "@/components/features/outreach-review/reject-dialog";
import { toast } from "@/components/ui/toaster";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OutreachReviewPage() {
  const [allDrafts, setAllDrafts] = React.useState<OutreachMessage[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<OutreachStatus | "all">("pending_approval");
  const [channelFilter, setChannelFilter] = React.useState<string>("all");
  const [evidence, setEvidence] = React.useState<EvidenceItem[]>([]);
  const [contextRailCollapsed, setContextRailCollapsed] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Load all drafts on mount
  React.useEffect(() => {
    api.getAllOutreachMessages().then((messages) => {
      setAllDrafts(messages);
      const firstPending = messages.find((m) => m.status === "pending_approval") || messages[0];
      if (firstPending) {
        setSelectedId(firstPending.id);
      }
      setLoading(false);
    });
  }, []);

  const selectedDraft = React.useMemo(() => {
    return allDrafts.find((d) => d.id === selectedId) || null;
  }, [allDrafts, selectedId]);

  // Load evidence for selected draft's account
  React.useEffect(() => {
    if (selectedDraft?.accountId) {
      api.getEvidenceForAccount(selectedDraft.accountId).then(setEvidence);
    }
  }, [selectedDraft?.accountId]);

  // Messages belonging to the same account & buyer for sequence context
  const accountSequenceMessages = React.useMemo(() => {
    if (!selectedDraft) return [];
    return allDrafts.filter(
      (d) => d.accountId === selectedDraft.accountId && d.buyerId === selectedDraft.buyerId
    );
  }, [allDrafts, selectedDraft]);

  // Advance to next draft
  const advanceToNext = React.useCallback(
    (currentId: string) => {
      const remainingPending = allDrafts.filter(
        (d) => d.id !== currentId && (statusFilter === "all" || d.status === statusFilter)
      );
      if (remainingPending.length > 0) {
        setSelectedId(remainingPending[0].id);
      }
    },
    [allDrafts, statusFilter]
  );

  // Approve action
  const handleApprove = React.useCallback(
    async (draftId: string, editedBody: string, editedSubject?: string) => {
      const target = allDrafts.find((d) => d.id === draftId);
      if (!target) return;

      await api.approveOutreachDraft(draftId, editedBody, editedSubject);

      setAllDrafts((prev) =>
        prev.map((d) =>
          d.id === draftId
            ? { ...d, status: "approved", body: editedBody, subject: editedSubject ?? d.subject }
            : d
        )
      );

      toast.success(`Draft approved for ${target.buyerName || "buyer"}`, {
        description: `Queued for multi-channel dispatch to ${target.accountName || "account"}.`,
      });

      advanceToNext(draftId);
      window.dispatchEvent(new Event("sawf_outreach_updated"));
    },
    [allDrafts, advanceToNext]
  );

  // Reject action
  const handleConfirmReject = React.useCallback(
    async (reason: string, category: string) => {
      if (!selectedDraft) return;
      const targetId = selectedDraft.id;
      const buyerName = selectedDraft.buyerName;

      await api.rejectOutreachDraft(targetId, reason);

      setAllDrafts((prev) =>
        prev.map((d) =>
          d.id === targetId ? { ...d, status: "rejected", rejectionReason: reason } : d
        )
      );

      toast.error(`Draft rejected for ${buyerName}`, {
        description: `Feedback logged (${category}) to retrain outreach agent.`,
      });

      advanceToNext(targetId);
      window.dispatchEvent(new Event("sawf_outreach_updated"));
    },
    [selectedDraft, advanceToNext]
  );

  // Keyboard Navigation: J/K, A, E, R
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Allow Cmd+Enter even inside textarea to approve
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && selectedDraft) {
          e.preventDefault();
          const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
          const input = document.querySelector<HTMLInputElement>("input[type='text']");
          handleApprove(selectedDraft.id, textarea?.value || selectedDraft.body, input?.value || selectedDraft.subject);
        }
        return;
      }

      if (e.key === "j" || e.key === "J" || e.key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = allDrafts.findIndex((d) => d.id === selectedId);
        if (currentIndex < allDrafts.length - 1) {
          setSelectedId(allDrafts[currentIndex + 1].id);
        }
      } else if (e.key === "k" || e.key === "K" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = allDrafts.findIndex((d) => d.id === selectedId);
        if (currentIndex > 0) {
          setSelectedId(allDrafts[currentIndex - 1].id);
        }
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (selectedDraft && selectedDraft.status !== "approved") {
          handleApprove(selectedDraft.id, selectedDraft.body, selectedDraft.subject);
        }
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (selectedDraft && selectedDraft.status !== "rejected") {
          setRejectOpen(true);
        }
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
        textarea?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allDrafts, selectedId, selectedDraft, handleApprove]);

  const handleInsertHook = (hookText: string) => {
    if (!selectedDraft) return;
    const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
    if (textarea) {
      const current = textarea.value;
      const updated = `${current}\n\n"${hookText}"`;
      textarea.value = updated;
      // trigger input event
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      toast("Inserted evidence hook into message body");
    }
  };

  const handleSelectSequenceStep = (stepNumber: number) => {
    const matching = accountSequenceMessages.find((m) => m.sequenceStep === stepNumber);
    if (matching) {
      setSelectedId(matching.id);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-xs text-text-tertiary">
        Loading outreach review workspace...
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-canvas">
      {/* Pane 1: Draft Queue (320px) */}
      <div className="w-[320px] shrink-0 h-full">
        <DraftQueue
          drafts={allDrafts}
          selectedId={selectedId}
          onSelect={(draft) => setSelectedId(draft.id)}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          channelFilter={channelFilter}
          onChannelFilterChange={setChannelFilter}
        />
      </div>

      {/* Pane 2: Draft Canvas & Editor (Flex 1) */}
      <div className="flex-1 min-w-0 h-full">
        {selectedDraft ? (
          <DraftCanvas
            draft={selectedDraft}
            allAccountMessages={accountSequenceMessages}
            onApprove={handleApprove}
            onReject={() => setRejectOpen(true)}
            onSelectSequenceStep={handleSelectSequenceStep}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-raised">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-positive-50 text-positive-600 dark:bg-positive-500/10 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-text-primary">All Caught Up!</h3>
            <p className="mt-1 text-xs text-text-secondary max-w-sm leading-relaxed">
              No pending outreach drafts require your review right now. New sequences will appear here when generated by Module 07.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Link href="/accounts">
                <Button variant="secondary" size="sm">
                  View Pipeline Accounts
                </Button>
              </Link>
              <Link href="/">
                <Button size="sm">
                  Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pane 3: Sales Context Rail (340px, Collapsible) */}
      {selectedDraft && (
        <ContextRail
          draft={selectedDraft}
          evidence={evidence}
          collapsed={contextRailCollapsed}
          onToggleCollapse={() => setContextRailCollapsed(!contextRailCollapsed)}
          onInsertHook={handleInsertHook}
        />
      )}

      {/* Rejection Feedback Dialog */}
      <RejectDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirmReject={handleConfirmReject}
        buyerName={selectedDraft?.buyerName}
        accountName={selectedDraft?.accountName}
      />
    </div>
  );
}
