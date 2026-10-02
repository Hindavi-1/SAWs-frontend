"use client";

import * as React from "react";
import type { OutreachMessage, EvidenceItem } from "@/lib/types";
import { RadialScore } from "@/components/ui/radial-score";
import { ConfidenceBadge } from "@/components/ui/badge";
import {
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  FileText,
} from "lucide-react";
import Link from "next/link";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface ContextRailProps {
  draft: OutreachMessage;
  evidence: EvidenceItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onInsertHook?: (text: string) => void;
}

export function ContextRail({
  draft,
  evidence,
  collapsed,
  onToggleCollapse,
  onInsertHook,
}: ContextRailProps) {
  if (collapsed) {
    return (
      <div className="h-full border-l border-border-subtle bg-raised flex flex-col items-center py-3 px-1 w-10 shrink-0">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 rounded text-text-tertiary hover:bg-sunken hover:text-text-primary"
          title="Expand Context Rail"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="[writing-mode:vertical-rl] rotate-180 mt-6 text-[11px] font-bold tracking-wider text-text-tertiary uppercase">
          Sales Context & Evidence
        </span>
      </div>
    );
  }

  return (
    <div className="h-full w-[340px] shrink-0 border-l border-border-subtle bg-raised flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-text-secondary" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Sales Intelligence Rail
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 rounded text-text-tertiary hover:bg-sunken hover:text-text-primary"
          title="Collapse Rail"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs scrollbar-thin">
        {/* Account Snapshot */}
        <div className="rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/40 p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/accounts/${draft.accountId}`}
                className="group flex items-center gap-1 text-sm font-bold text-text-primary hover:text-accent-500"
              >
                <span className="truncate">{draft.accountName}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <p className="text-[11px] text-text-tertiary truncate">
                {draft.accountDomain} · {draft.accountIndustry}
              </p>
            </div>
            {draft.accountFitScore !== undefined && (
              <RadialScore value={draft.accountFitScore} size={42} strokeWidth={4} label="fit" />
            )}
          </div>
        </div>

        {/* Why this Angle? (Dedicated Agent Highlight) */}
        <div className="rounded-[var(--radius-sm)] border border-[var(--agent-border)] bg-[var(--agent-surface)] p-3 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-[var(--agent-text)] font-bold text-xs">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Why this angle was chosen</span>
          </div>
          <p className="text-xs leading-relaxed text-text-primary font-medium">
            {draft.angleChosen || "Selected based on high-signal funding and hiring announcements."}
          </p>
          <div className="pt-1 flex items-center gap-2 text-[10px] text-text-tertiary">
            <span className="font-mono">Agent Confidence: 94%</span>
            <span>·</span>
            <span>Module 07 (Personalized Outreach)</span>
          </div>
        </div>

        {/* Personalization Hooks & Evidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Personalization Hooks ({draft.personalizationHooks?.length || 0})
            </span>
          </div>

          <div className="space-y-2">
            {draft.personalizationHooks && draft.personalizationHooks.length > 0 ? (
              draft.personalizationHooks.map((hook, i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/50 p-2.5 space-y-1 hover:border-border-strong transition-colors"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-xs text-text-primary font-medium leading-relaxed">
                      {hook}
                    </p>
                    {onInsertHook && (
                      <button
                        type="button"
                        onClick={() => onInsertHook(hook)}
                        className="shrink-0 rounded p-1 text-[10px] text-accent-500 hover:bg-accent-50 font-semibold"
                        title="Insert into draft body"
                      >
                        Insert
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-tertiary text-[11px] italic">No specific hooks recorded.</p>
            )}
          </div>
        </div>

        {/* Cited Evidence Sources */}
        {evidence.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-border-subtle">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Verified Evidence Sources
            </span>
            <div className="space-y-2">
              {evidence.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[var(--radius-sm)] border border-border-subtle p-2 space-y-1 bg-raised"
                >
                  <p className="text-xs text-text-primary leading-snug">{item.claim}</p>
                  <div className="flex items-center justify-between text-[10px] text-text-tertiary pt-0.5">
                    <span className="font-semibold">{item.sourceName}</span>
                    <ConfidenceBadge level={item.confidence} className="text-[9px] py-0 px-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buyer Dossier */}
        <div className="space-y-2 pt-1 border-t border-border-subtle">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Buyer Dossier
          </span>
          <div className="rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/40 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary">{draft.buyerName}</span>
              <span className="text-[10px] rounded px-1.5 py-0.5 bg-sunken border border-border-default font-semibold text-text-secondary">
                {draft.buyerSeniority || "Executive"}
              </span>
            </div>
            <p className="text-text-secondary text-[11px]">{draft.buyerTitle}</p>
            <div className="flex items-center gap-3 pt-1 text-[11px]">
              {draft.buyerLinkedinUrl && (
                <a
                  href={draft.buyerLinkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-accent-500 hover:underline font-medium"
                >
                  <LinkedinIcon className="h-3 w-3" /> Profile
                </a>
              )}
              <span className="text-text-tertiary">·</span>
              <span className="text-text-tertiary">Status: Not contacted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
