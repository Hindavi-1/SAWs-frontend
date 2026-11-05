"use client";

import * as React from "react";
import * as api from "@/lib/api";
import type { EmailAddress, OutreachMessage, OutreachStatus } from "@/lib/types";
import { DraftQueue } from "@/components/features/outreach-review/draft-queue";
import { DraftCanvas } from "@/components/features/outreach-review/draft-canvas";
import { RejectDialog } from "@/components/features/outreach-review/reject-dialog";
import { toast } from "@/components/ui/toaster";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OutreachReviewPage() {
  const [allDrafts, setAllDrafts] = React.useState<OutreachMessage[]>([]);
  const [senderAddresses, setSenderAddresses] = React.useState<EmailAddress[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<OutreachStatus | "all">("pending_approval");
  const [channelFilter, setChannelFilter] = React.useState<string>("all");
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
    api.getEmailAddresses().then(setSenderAddresses);
  }, []);

  const handleAddSenderAddress = React.useCallback(async (email: string) => {
    const saved = await api.addEmailAddress(email);
    setSenderAddresses((prev) =>
      prev.some((a) => a.email === saved.email) ? prev : [...prev, saved]
    );
    toast.success(`Added ${saved.email} to your sending addresses`);
  }, []);

  const selectedDraft = React.useMemo(() => {
    return allDrafts.find((d) => d.id === selectedId) || null;
  }, [allDrafts, selectedId]);

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

  // Approve action — for email drafts this performs the real send.
  const handleApprove = React.useCallback(
    async (
      draftId: string,
      editedBody: string,
      editedSubject?: string,
      sendOptions?: { recipientEmail?: string; senderEmail?: string; confirmUnverifiedRecipient?: boolean }
    ) => {
      const target = allDrafts.find((d) => d.id === draftId);
      if (!target) return;

      // Non-email channels (LinkedIn, call script) have no mailbox to hit: approving
      // them only records the decision, exactly as before.
      if (target.channel !== "email") {
        try {
          await api.approveOutreachDraft(draftId, editedBody, editedSubject);
        } catch (e) {
          toast.error("Could not approve the draft", {
            description: e instanceof Error ? e.message : undefined,
          });
          return;
        }
        setAllDrafts((prev) =>
          prev.map((d) =>
            d.id === draftId
              ? { ...d, status: "approved", body: editedBody, subject: editedSubject ?? d.subject }
              : d
          )
        );
        toast.success(`Draft approved for ${target.buyerName || "buyer"}`, {
          description: `Dispatch to ${target.accountName || "account"} via ${target.channel.replace("_", " ")}.`,
        });
        advanceToNext(draftId);
        window.dispatchEvent(new Event("sawf_outreach_updated"));
        return;
      }

      try {
        const sent = await api.sendOutreachDraft(draftId, {
          body: editedBody,
          subject: editedSubject,
          recipientEmail: sendOptions?.recipientEmail,
          senderEmail: sendOptions?.senderEmail,
          confirmUnverifiedRecipient: sendOptions?.confirmUnverifiedRecipient,
        });
        setAllDrafts((prev) => prev.map((d) => (d.id === draftId ? { ...d, ...sent } : d)));
        toast.success(`Email sent to ${sent.recipientEmail || target.buyerName || "buyer"}`, {
          description: `Delivered from ${sent.senderEmail || "your sending address"}.`,
        });
        advanceToNext(draftId);
        window.dispatchEvent(new Event("sawf_outreach_updated"));
      } catch (e) {
        // Nothing was sent: keep the draft in place and say so plainly.
        const message = e instanceof Error ? e.message : "The email could not be sent.";
        setAllDrafts((prev) =>
          prev.map((d) =>
            d.id === draftId
              ? {
                  ...d,
                  status: "pending_approval",
                  body: editedBody,
                  subject: editedSubject ?? d.subject,
                  sendError: message,
                }
              : d
          )
        );
        toast.error("Email was not sent", { description: message });
      }
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
          const recipient =
            document.querySelector<HTMLInputElement>("[data-draft-field='recipient']")?.value;
          const sender =
            document.querySelector<HTMLSelectElement>("[data-draft-field='sender']")?.value;
          handleApprove(
            selectedDraft.id,
            textarea?.value || selectedDraft.body,
            input?.value || selectedDraft.subject,
            { recipientEmail: recipient, senderEmail: sender }
          );
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
          const recipient =
            document.querySelector<HTMLInputElement>("[data-draft-field='recipient']")?.value;
          const sender =
            document.querySelector<HTMLSelectElement>("[data-draft-field='sender']")?.value;
          handleApprove(selectedDraft.id, selectedDraft.body, selectedDraft.subject, {
            recipientEmail: recipient,
            senderEmail: sender,
          });
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
            key={selectedDraft.id}
            draft={selectedDraft}
            allAccountMessages={accountSequenceMessages}
            senderAddresses={senderAddresses}
            onApprove={handleApprove}
            onReject={() => setRejectOpen(true)}
            onAddSenderAddress={handleAddSenderAddress}
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
