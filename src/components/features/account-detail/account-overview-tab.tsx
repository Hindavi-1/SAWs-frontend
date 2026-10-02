"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import type { Account, EvidenceItem, Buyer, QualificationCriterion, OutreachMessage } from "@/lib/types";
import { CircleCheck, Circle, Sparkles, Database, FileText, CheckCircle2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface AccountOverviewTabProps {
  account: Account;
  evidence: EvidenceItem[];
  buyers: Buyer[];
  qualification: QualificationCriterion[];
  outreach: OutreachMessage[];
}

export function AccountOverviewTab({
  account,
  evidence,
  buyers,
  qualification,
  outreach,
}: AccountOverviewTabProps) {
  const moduleChips = [
    { label: "Deep Research", done: evidence.length > 0, count: evidence.length, desc: "claims gathered" },
    { label: "Buyer Identification", done: buyers.length > 0, count: buyers.length, desc: "personas verified" },
    { label: "Qualification", done: qualification.length > 0, count: qualification.filter(q => q.status === "met").length, desc: "criteria met" },
    { label: "Outreach & Engagement", done: outreach.length > 0, count: outreach.length, desc: "sequence touches" },
  ];

  return (
    <div className="space-y-4">
      {/* Module coverage progress strip */}
      <Card className="p-4 border-border-default">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Autonomous Pipeline Coverage
          </p>
          <span className="text-xs font-mono text-text-tertiary">
            {moduleChips.filter((m) => m.done).length} / 4 stages active
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {moduleChips.map((m) => (
            <div
              key={m.label}
              className={`flex items-start gap-2 p-2.5 rounded-[var(--radius-sm)] border transition-colors ${
                m.done
                  ? "bg-sunken/40 border-border-subtle"
                  : "bg-sunken/10 border-dashed border-border-subtle opacity-70"
              }`}
            >
              {m.done ? (
                <CheckCircle2 className="h-4 w-4 text-positive-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{m.label}</p>
                <p className="text-[11px] text-text-tertiary font-mono">
                  {m.count} {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Why this account is a fit */}
      <Card className="p-4 border-border-default">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 rounded-[var(--radius-xs)] bg-agent-surface border border-agent-border text-agent-core">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs font-semibold text-text-primary">
            Agent Fit Justification & Buying Signals
          </p>
        </div>
        <ul className="space-y-2">
          {account.discoveryReasons.map((reason, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed p-2 rounded-[var(--radius-xs)] bg-sunken/30 border border-border-subtle/40"
            >
              <span className="font-mono text-accent-500 font-bold">0{idx + 1}</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Tech Stack & Infrastructure */}
      {account.tags.length > 0 && (
        <Card className="p-4 border-border-default">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-3.5 w-3.5 text-text-tertiary" />
            <p className="text-xs font-semibold text-text-primary">Account Tags</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {account.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-[var(--radius-sm)] border border-border-subtle bg-sunken font-mono text-[11px] text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Latest Research Highlight */}
      {evidence.length > 0 && (
        <Card className="p-4 border-border-default">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-text-tertiary" />
              <p className="text-xs font-semibold text-text-primary">Top Verified Intelligence Claim</p>
            </div>
            <span className="text-[11px] font-mono text-text-tertiary">
              {timeAgo(evidence[0].collectedAt)}
            </span>
          </div>
          <p className="text-xs text-text-primary leading-relaxed bg-sunken/40 p-3 rounded-[var(--radius-sm)] border border-border-subtle">
            &ldquo;{evidence[0].claim}&rdquo;
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-text-tertiary">
            <span>Source: <strong className="text-text-secondary">{evidence[0].sourceName}</strong></span>
            <span className="font-mono capitalize">{evidence[0].confidence} confidence</span>
          </div>
        </Card>
      )}
    </div>
  );
}
