"use client";

import { ConfidenceBadge, HealthBadge } from "@/components/ui/badge";
import type { Account } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export function AccountTable({ accounts }: { accounts: Account[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left text-xs text-text-tertiary">
            <th className="px-5 py-2.5 font-medium">Account</th>
            <th className="px-3 py-2.5 font-medium">Stage</th>
            <th className="px-3 py-2.5 font-medium">Health</th>
            <th className="px-3 py-2.5 font-medium">Fit score</th>
            <th className="px-3 py-2.5 font-medium">Confidence</th>
            <th className="px-3 py-2.5 font-medium">ICP</th>
            <th className="px-3 py-2.5 font-medium">Days in stage</th>
            <th className="px-3 py-2.5 font-medium">Owner</th>
            <th className="px-5 py-2.5 font-medium">Discovered</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id} className="border-b border-border-subtle last:border-0 hover:bg-sunken">
              <td className="px-5 py-3">
                <Link href={`/accounts/${a.id}`} className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-accent-50 font-mono text-xs font-bold text-accent-500">
                    {a.logoInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary hover:text-accent-500">{a.name}</p>
                    <p className="truncate text-xs text-text-tertiary">{a.domain}</p>
                  </div>
                </Link>
              </td>
              <td className="px-3 py-3 text-text-secondary">{STAGE_LABELS[a.stage]}</td>
              <td className="px-3 py-3"><HealthBadge health={a.health} /></td>
              <td className="px-3 py-3 font-mono font-medium text-text-primary">{a.fitScore}</td>
              <td className="px-3 py-3"><ConfidenceBadge level={a.confidence} /></td>
              <td className="max-w-[160px] truncate px-3 py-3 text-text-secondary">{a.icpName}</td>
              <td className="px-3 py-3 font-mono text-text-secondary">{a.daysInStage}d</td>
              <td className="px-3 py-3 text-text-secondary">{a.ownerName ?? "Unassigned"}</td>
              <td className="px-5 py-3 text-text-tertiary">{formatDate(a.discoveredAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
