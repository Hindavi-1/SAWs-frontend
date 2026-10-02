"use client";

import { cn } from "@/lib/utils";
import type { OutreachMessage } from "@/lib/types";
import { Mail, Phone, CheckCircle2, XCircle } from "lucide-react";
import * as React from "react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export interface StepItem {
  id: string;
  stepNumber: number;
  dayOffset: number;
  channel: "email" | "linkedin" | "call_script";
  title: string;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "sent" | "replied" | "bounced";
}

interface SequenceTimelineProps {
  steps?: StepItem[];
  messages?: OutreachMessage[];
  activeStepNumber?: number;
  onSelectStep?: (stepNumber: number) => void;
  className?: string;
  compact?: boolean;
}

const CHANNEL_ICONS = {
  email: Mail,
  linkedin: LinkedinIcon,
  call_script: Phone,
};

const CHANNEL_NAMES = {
  email: "Email",
  linkedin: "LinkedIn",
  call_script: "Call",
};

export function SequenceTimeline({
  steps,
  messages,
  activeStepNumber,
  onSelectStep,
  className,
  compact = false,
}: SequenceTimelineProps) {
  // Normalize items from either explicit StepItem list or OutreachMessage list
  const normalizedSteps: StepItem[] = React.useMemo(() => {
    if (steps && steps.length > 0) return steps;
    if (messages && messages.length > 0) {
      return messages.map((m, idx) => ({
        id: m.id,
        stepNumber: m.sequenceStep ?? idx + 1,
        dayOffset: m.dayOffset ?? idx * 3,
        channel: m.channel,
        title: m.stepTitle ?? `${CHANNEL_NAMES[m.channel]} Touch`,
        status: m.status,
      }));
    }
    // Fallback default cadence if nothing provided
    return [
      { id: "s1", stepNumber: 1, dayOffset: 0, channel: "email", title: "Pain & Scaling Hook", status: "pending_approval" },
      { id: "s2", stepNumber: 2, dayOffset: 3, channel: "linkedin", title: "Connection & Soft Touch", status: "draft" },
      { id: "s3", stepNumber: 3, dayOffset: 6, channel: "email", title: "Peer Proof & Architecture", status: "draft" },
      { id: "s4", stepNumber: 4, dayOffset: 9, channel: "call_script", title: "Direct Call & Voicemail", status: "draft" },
    ];
  }, [steps, messages]);

  return (
    <div className={cn("w-full overflow-x-auto py-2", className)}>
      <div className="flex items-center gap-1 min-w-max">
        {normalizedSteps.map((step, idx) => {
          const Icon = CHANNEL_ICONS[step.channel] || Mail;
          const isActive = activeStepNumber ? step.stepNumber === activeStepNumber : idx === 0;
          const isLast = idx === normalizedSteps.length - 1;

          return (
            <React.Fragment key={step.id || step.stepNumber}>
              <button
                type="button"
                onClick={() => onSelectStep?.(step.stepNumber)}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--radius-sm)] border px-2.5 py-1.5 text-xs text-left transition-all cursor-pointer select-none",
                  isActive
                    ? "border-accent-500 bg-accent-50/70 text-text-primary shadow-[var(--shadow-xs)] dark:bg-accent-500/10 dark:border-accent-500"
                    : "border-border-subtle bg-raised text-text-secondary hover:border-border-strong hover:bg-sunken/60",
                  compact && "py-1 px-2"
                )}
              >
                {/* Step indicator circle */}
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    step.status === "approved" || step.status === "sent"
                      ? "bg-positive-500 text-white"
                      : step.status === "pending_approval"
                      ? "bg-accent-500 text-white"
                      : step.status === "rejected"
                      ? "bg-risk-500 text-white"
                      : "bg-sunken text-text-tertiary border border-border-default"
                  )}
                >
                  {step.status === "approved" || step.status === "sent" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : step.status === "rejected" ? (
                    <XCircle className="h-3 w-3" />
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                {/* Step details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3 w-3 shrink-0 text-text-tertiary" />
                    <span className="font-semibold text-text-primary text-[11px] truncate">
                      {CHANNEL_NAMES[step.channel]}
                    </span>
                    <span className="text-[10px] font-mono text-text-tertiary">
                      Day {step.dayOffset}
                    </span>
                  </div>
                  {!compact && (
                    <p className="text-[10px] text-text-tertiary truncate max-w-[140px]">
                      {step.title}
                    </p>
                  )}
                </div>

                {/* Status chip */}
                <StatusChip status={step.status} />
              </button>

              {/* Connecting line */}
              {!isLast && (
                <div className="h-px w-3 bg-border-default shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: StepItem["status"] }) {
  switch (status) {
    case "approved":
    case "sent":
      return (
        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-positive-50 text-positive-600 dark:bg-positive-500/10 dark:text-positive-400">
          Ready
        </span>
      );
    case "pending_approval":
      return (
        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400 border border-accent-500/20">
          Review
        </span>
      );
    case "rejected":
      return (
        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-risk-50 text-risk-600 dark:bg-risk-500/10 dark:text-risk-400">
          Rejected
        </span>
      );
    default:
      return (
        <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold text-text-tertiary bg-sunken">
          Cadence
        </span>
      );
  }
}
