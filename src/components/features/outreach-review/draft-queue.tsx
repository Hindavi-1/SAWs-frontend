"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { OutreachMessage, OutreachStatus } from "@/lib/types";
import { Search, Mail, Phone, CheckCircle2, XCircle } from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface DraftQueueProps {
  drafts: OutreachMessage[];
  selectedId: string | null;
  onSelect: (draft: OutreachMessage) => void;
  statusFilter: OutreachStatus | "all";
  onStatusFilterChange: (status: OutreachStatus | "all") => void;
  channelFilter: string;
  onChannelFilterChange: (channel: string) => void;
}

const CHANNEL_ICONS = {
  email: Mail,
  linkedin: LinkedinIcon,
  call_script: Phone,
};

export function DraftQueue({
  drafts,
  selectedId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
  channelFilter,
  onChannelFilterChange,
}: DraftQueueProps) {
  const [search, setSearch] = React.useState("");

  const filteredDrafts = React.useMemo(() => {
    return drafts.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (channelFilter !== "all" && d.channel !== channelFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesBuyer = d.buyerName?.toLowerCase().includes(q);
        const matchesAccount = d.accountName?.toLowerCase().includes(q);
        const matchesSubject = d.subject?.toLowerCase().includes(q);
        const matchesBody = d.body.toLowerCase().includes(q);
        if (!matchesBuyer && !matchesAccount && !matchesSubject && !matchesBody) return false;
      }
      return true;
    });
  }, [drafts, statusFilter, channelFilter, search]);

  const pendingCount = drafts.filter((d) => d.status === "pending_approval").length;

  return (
    <div className="flex h-full flex-col border-r border-border-subtle bg-raised">
      {/* Header & Counts */}
      <div className="p-3 border-b border-border-subtle space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Review Queue
            </span>
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white font-mono">
              {pendingCount}
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            {filteredDrafts.length} shown
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts or buyers..."
            className="h-7 w-full rounded-[var(--radius-sm)] border border-border-default bg-sunken pl-8 pr-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1 rounded bg-sunken p-0.5 border border-border-default">
            {(["pending_approval", "all", "approved"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusFilterChange(s)}
                className={cn(
                  "rounded px-2 py-0.5 font-medium transition-colors capitalize",
                  statusFilter === s
                    ? "bg-raised text-text-primary shadow-xs font-semibold"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                {s === "pending_approval" ? "Pending" : s}
              </button>
            ))}
          </div>

          <select
            value={channelFilter}
            onChange={(e) => onChannelFilterChange(e.target.value)}
            className="h-6 rounded border border-border-default bg-sunken px-1.5 text-[11px] text-text-secondary focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="linkedin">LinkedIn</option>
            <option value="call_script">Call</option>
          </select>
        </div>
      </div>

      {/* Draft List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle scrollbar-thin">
        {filteredDrafts.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-tertiary">
            No drafts match the selected filters.
          </div>
        ) : (
          filteredDrafts.map((draft) => {
            const isSelected = draft.id === selectedId;
            const Icon = CHANNEL_ICONS[draft.channel] || Mail;

            return (
              <button
                key={draft.id}
                type="button"
                onClick={() => onSelect(draft)}
                className={cn(
                  "w-full p-3 text-left transition-colors cursor-pointer select-none flex flex-col gap-1.5 relative",
                  isSelected
                    ? "bg-accent-50/70 dark:bg-accent-500/10 border-l-2 border-l-accent-500"
                    : "hover:bg-sunken/60"
                )}
              >
                {/* Account & Buyer Line */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {draft.accountName || "Account"}
                    </p>
                    <p className="text-[11px] text-text-secondary truncate">
                      {draft.buyerName} {draft.buyerTitle ? `· ${draft.buyerTitle}` : ""}
                    </p>
                  </div>
                  {draft.accountFitScore !== undefined && (
                    <span className="shrink-0 font-mono text-[10px] font-bold rounded px-1.5 py-0.5 bg-sunken border border-border-subtle text-text-primary">
                      {draft.accountFitScore}
                    </span>
                  )}
                </div>

                {/* Channel & Subject Preview */}
                <div className="flex items-center gap-1.5 text-xs text-text-secondary truncate">
                  <Icon className="h-3 w-3 shrink-0 text-text-tertiary" />
                  <span className="truncate text-[11px]">
                    {draft.subject || draft.stepTitle || "Outreach Note"}
                  </span>
                </div>

                {/* Bottom Metadata & Status */}
                <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    {draft.urgency === "high" && (
                      <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.2 bg-risk-50 text-risk-600 font-bold dark:bg-risk-500/10 dark:text-risk-400">
                        Urgent
                      </span>
                    )}
                    {draft.sequenceStep && (
                      <span className="font-mono text-text-tertiary">
                        Step {draft.sequenceStep}/{draft.sequenceTotalSteps || 4}
                      </span>
                    )}
                  </div>
                  <DraftStatusBadge status={draft.status} />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Keyboard Shortcuts Footer */}
      <div className="p-2 border-t border-border-subtle bg-sunken/60 text-[10px] text-text-tertiary flex items-center justify-between shrink-0">
        <span>[J/K] Navigate</span>
        <span>[A] Approve</span>
        <span>[R] Reject</span>
      </div>
    </div>
  );
}

function DraftStatusBadge({ status }: { status: OutreachStatus }) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-positive-600 dark:text-positive-400">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-risk-600 dark:text-risk-400">
          <XCircle className="h-3 w-3" /> Rejected
        </span>
      );
    case "pending_approval":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-accent-500/10 px-1.5 py-0.2 text-[10px] font-bold text-accent-500 border border-accent-500/20">
          Pending
        </span>
      );
    case "sent":
      return (
        <span className="text-[10px] font-medium text-positive-600">
          Sent
        </span>
      );
    default:
      return (
        <span className="text-[10px] text-text-tertiary">
          Draft
        </span>
      );
  }
}
