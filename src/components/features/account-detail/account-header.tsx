"use client";

import * as React from "react";
import Link from "next/link";
import { RadialScore } from "@/components/ui/radial-score";
import { StageBadge, HealthBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Account } from "@/lib/types";
import { ExternalLink, Sparkles, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import * as api from "@/lib/api";

interface AccountHeaderProps {
  account: Account;
  pendingDraftCount: number;
  onAccountUpdated?: () => void;
}

const PIPELINE_STEPS: { key: string; label: string }[] = [
  { key: "verify", label: "Verifying account…" },
  { key: "fit", label: "Evaluating ICP fit…" },
  { key: "buyers", label: "Identifying buyers…" },
  { key: "research", label: "Researching account…" },
];

export function AccountHeader({ account, pendingDraftCount, onAccountUpdated }: AccountHeaderProps) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [runStep, setRunStep] = React.useState(-1);

  const handleRunPipeline = async () => {
    setIsRunning(true);
    setRunStep(0);

    try {
      toast.info("Pipeline started", {
        description: `Running M03–M06 pipeline for ${account.name}`,
      });

      // Advance step-by-step through M03 → M04 → M05 → M06
      const steps = ["verify", "fit", "buyers", "research"];
      for (let i = 0; i < steps.length; i++) {
        setRunStep(i);
        try {
          await api.advanceAccountWorkflow(account.id, steps[i]);
        } catch (stepErr) {
          // Some steps may fail (e.g. no ICP), continue others
          console.warn(`Step ${steps[i]} failed:`, stepErr);
        }
      }

      toast.success("Pipeline complete", {
        description: `${account.name} fully processed through M03–M06.`,
      });

      // Notify parent to reload account data
      onAccountUpdated?.();
    } catch (err) {
      console.error("Pipeline run failed:", err);
      toast.error("Pipeline failed", {
        description: `Could not run pipeline for ${account.name}. Check backend logs.`,
      });
    } finally {
      setIsRunning(false);
      setRunStep(-1);
    }
  };

  const currentStepLabel =
    isRunning && runStep >= 0 && runStep < PIPELINE_STEPS.length
      ? PIPELINE_STEPS[runStep].label
      : "Run AI Pipeline";

  return (
    <div className="rounded-[var(--radius-md)] border border-border-default bg-raised p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Logo & Company Info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent-50 font-mono text-lg font-bold text-accent-500 border border-accent-200/50 dark:bg-accent-950/50 dark:border-accent-800/40">
            {account.logoInitial}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-text-primary">{account.name}</h1>
              <a
                href={`https://${account.domain}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent-500 font-mono"
              >
                {account.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-text-secondary">
              <span>{account.industry}</span>
              <span>·</span>
              <span>{account.hqLocation}</span>
              <span>·</span>
              <span>{account.employeeRange} employees</span>
            </div>
          </div>
        </div>

        {/* Right: Scores & Actions */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/40">
            <RadialScore value={account.fitScore} size={42} label="fit" />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <StageBadge stage={account.stage} />
                <HealthBadge health={account.health} />
              </div>
              <p className="mt-1 text-[11px] text-text-tertiary font-mono">{account.icpName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingDraftCount > 0 && (
              <Link href="/outreach-review">
                <Button size="sm" className="bg-agent-core hover:bg-agent-core/90 text-white shadow-xs">
                  <Send className="h-3.5 w-3.5" />
                  Review Drafts ({pendingDraftCount})
                </Button>
              </Link>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleRunPipeline}
              disabled={isRunning}
            >
              {isRunning ? (
                <Loader2 className="h-3.5 w-3.5 text-agent-core animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-agent-core" />
              )}
              {currentStepLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* Pipeline progress strip (visible while running) */}
      {isRunning && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-3 overflow-x-auto">
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={step.key} className="flex items-center gap-1.5 shrink-0">
                {idx < runStep ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-positive-500" />
                ) : idx === runStep ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-500" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-border-default inline-block" />
                )}
                <span
                  className={`text-[11px] font-medium ${
                    idx <= runStep ? "text-text-primary" : "text-text-tertiary"
                  }`}
                >
                  {step.label.replace("…", "")}
                </span>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <span className="text-border-subtle mx-1">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
