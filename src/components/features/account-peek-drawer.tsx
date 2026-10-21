"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { RadialScore } from "@/components/ui/radial-score";
import { StageBadge, HealthBadge, ConfidenceBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Account, Buyer, OutreachMessage } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import * as api from "@/lib/api";
import Link from "next/link";
import { ExternalLink, Send, ArrowRight, X } from "lucide-react";

interface AccountPeekModalProps {
  account: Account | null;
  open: boolean;
  onClose: () => void;
}

export function AccountPeekDrawer({ account, open, onClose }: AccountPeekModalProps) {
  const [buyers, setBuyers] = React.useState<Buyer[]>([]);
  const [outreach, setOutreach] = React.useState<OutreachMessage[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (account?.id) {
      api.getBuyersForAccount(account.id).then(setBuyers);
      api.getOutreachForAccount(account.id).then(setOutreach);
    }
  }, [account?.id]);

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!account || !mounted) return null;

  const pendingDrafts = outreach.filter((m) => m.status === "pending_approval");

  return createPortal(
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-[visibility]",
        open ? "visible" : "invisible delay-200"
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-peek-title"
        className={cn(
          "relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-raised shadow-xl transition-all duration-200",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3.5 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 id="account-peek-title" className="text-sm font-semibold text-text-primary truncate">
              {account.name}
            </h2>
            <p className="mt-0.5 text-xs text-text-tertiary truncate">
              {account.industry} · {account.hqLocation}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-[var(--radius-sm)] p-1 text-text-tertiary hover:bg-sunken hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5 text-xs">
            {/* Header Summary */}
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/40 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-50 font-mono text-sm font-bold text-accent-500">
                  {account.logoInitial}
                </div>
                <div>
                  <p className="font-bold text-sm text-text-primary">{account.name}</p>
                  <a
                    href={`https://${account.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-tertiary hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    {account.domain} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <RadialScore value={account.fitScore} size={48} strokeWidth={4} label="fit" />
            </div>

            {/* Status & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge stage={account.stage} />
              <HealthBadge health={account.health} />
              <ConfidenceBadge level={account.confidence} />
            </div>

            {/* Pending Outreach Callout (if any) */}
            {pendingDrafts.length > 0 && (
              <div className="rounded-[var(--radius-sm)] border border-accent-500/20 bg-accent-50/70 dark:bg-accent-500/10 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-accent-600 dark:text-accent-400 text-xs flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" /> {pendingDrafts.length} Outreach Draft Awaiting Approval
                  </span>
                  <Link href="/outreach-review">
                    <Button size="xs" variant="primary">
                      Review Draft
                    </Button>
                  </Link>
                </div>
                <p className="text-[11px] text-text-secondary">
                  AI drafted a personalized sequence for {pendingDrafts[0].buyerName || "key buyer"}.
                </p>
              </div>
            )}

            {/* Discovery Reasons */}
            <div className="space-y-1.5">
              <p className="font-bold uppercase tracking-wider text-text-tertiary text-[10px]">
                Why This Account Matched ICP
              </p>
              <ul className="space-y-1 rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/30 p-2.5">
                {account.discoveryReasons.map((r, i) => (
                  <li key={i} className="text-text-primary text-xs flex items-start gap-1.5">
                    <span className="text-accent-500 font-bold">·</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Buyers Identified */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-bold uppercase tracking-wider text-text-tertiary text-[10px]">
                  Key Buyers ({buyers.length})
                </p>
              </div>
              {buyers.length > 0 ? (
                <div className="space-y-1.5">
                  {buyers.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border-subtle p-2 bg-raised"
                    >
                      <div>
                        <p className="font-semibold text-text-primary text-xs">{b.name}</p>
                        <p className="text-[11px] text-text-tertiary">{b.title} · {b.seniority}</p>
                      </div>
                      {b.email && (
                        <span
                          className="font-mono text-[10px] text-text-tertiary"
                          title={b.emailStatus === "pattern_deduced" ? "Derived email — not found publicly" : undefined}
                        >
                          {b.email}
                          {b.emailStatus === "pattern_deduced" && " *"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-tertiary text-xs italic">No buyers enriched yet.</p>
              )}
            </div>

            {/* Metadata Grid */}
            <dl className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border-subtle">
              <div>
                <dt className="text-text-tertiary text-[10px]">Employees</dt>
                <dd className="font-semibold text-text-primary mt-0.5">{account.employeeRange}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-[10px]">Days in Stage</dt>
                <dd className="font-semibold text-text-primary mt-0.5 font-mono">{account.daysInStage} days</dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-[10px]">Discovered Date</dt>
                <dd className="font-semibold text-text-primary mt-0.5">{formatDate(account.discoveredAt)}</dd>
              </div>
            </dl>

            {/* Bottom Full Action */}
            <div className="pt-2 border-t border-border-subtle flex flex-col gap-2">
              <div className="flex gap-2">
                <Link href={`/accounts/${account.id}`} className="flex-1">
                  <Button className="w-full gap-1.5 font-bold" size="sm">
                    Open Full View <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
              <Button variant="ghost" size="xs" onClick={onClose} className="text-text-tertiary">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
