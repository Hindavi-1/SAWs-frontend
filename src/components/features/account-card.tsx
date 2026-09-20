"use client";

import { ConfidenceBadge } from "@/components/ui/badge";
import { RadialScore } from "@/components/ui/radial-score";
import type { Account } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AccountCard({ account, onOpen }: { account: Account; onOpen: (account: Account) => void }) {
  return (
    <button
      onClick={() => onOpen(account)}
      className="flex flex-col rounded-[var(--radius-md)] border border-border-subtle bg-raised p-4 text-left transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-50 font-mono text-sm font-bold text-accent-500">
            {account.logoInitial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">{account.name}</p>
            <p className="truncate text-xs text-text-tertiary">{account.industry} · {account.employeeRange}</p>
          </div>
        </div>
        <RadialScore value={account.fitScore} size={44} strokeWidth={4} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {account.discoveryReasons.slice(0, 2).map((reason) => (
          <span
            key={reason}
            className="rounded-full border border-border-default bg-sunken px-2 py-0.5 text-[11px] text-text-secondary"
          >
            {reason}
          </span>
        ))}
        {account.discoveryReasons.length > 2 && (
          <span className="rounded-full border border-border-default bg-sunken px-2 py-0.5 text-[11px] text-text-tertiary">
            +{account.discoveryReasons.length - 2} more
          </span>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-border-subtle pt-3">
        <ConfidenceBadge level={account.confidence} />
        <span
          className={cn(
            "text-xs font-medium",
            account.stage === "discovered" ? "text-text-tertiary" : "text-accent-500"
          )}
        >
          {STAGE_LABELS[account.stage]}
        </span>
      </div>
    </button>
  );
}
