"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Account, FunnelStage } from "@/lib/types";
import { FUNNEL_STAGES, STAGE_LABELS } from "@/lib/types";
import { Sparkles, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";
import * as api from "@/lib/api";

interface AccountRightRailProps {
  account: Account;
  onAccountUpdated?: () => void;
}

// Stages where the M03 -> M06 pipeline runs with zero human input.
const AUTOMATED_STAGES: FunnelStage[] = [
  "discovered",
  "verified",
  "fit_evaluated",
  "buyer_identified",
];

export function AccountRightRail({ account, onAccountUpdated }: AccountRightRailProps) {
  const [advancing, setAdvancing] = React.useState(false);

  const isAutomated = AUTOMATED_STAGES.includes(account.stage);

  const handleRerunPipeline = async () => {
    setAdvancing(true);
    try {
      await api.advanceAccountWorkflow(account.id, "all");
      toast.success("Pipeline re-run", {
        description: `${account.name} re-processed through M03–M06.`,
      });
      onAccountUpdated?.();
    } catch (err: any) {
      console.error("Pipeline re-run failed:", err);
      toast.error("Pipeline re-run failed", {
        description: err?.message || "Could not re-run the pipeline. Check backend logs.",
      });
    } finally {
      setAdvancing(false);
    }
  };

  const currentStageIdx = FUNNEL_STAGES.indexOf(account.stage);

  return (
    <div className="space-y-4">
      {/* Agent pipeline status */}
      <Card className="p-4 border-agent-border bg-agent-surface/30">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-agent-core" />
          <p className="text-xs font-semibold text-agent-core">Agent Pipeline</p>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          {isAutomated
            ? `${account.name} is being processed automatically. Verification, ICP fit, buyer identification, and account research run without intervention once discovery finds the account.`
            : `Automation is complete through Account Research. Outreach (M07) requires human approval before any message is sent.`}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            M03–M06 · automatic
          </span>
          <Button
            size="xs"
            variant="ghost"
            onClick={handleRerunPipeline}
            disabled={advancing}
            className="text-text-tertiary hover:text-text-primary"
            title="Only needed if the generated results look wrong"
          >
            {advancing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {advancing ? "Running…" : "Re-run"}
          </Button>
        </div>
      </Card>

      {/* Funnel stage stepper */}
      <Card className="p-4 border-border-default">
        <p className="text-xs font-semibold text-text-tertiary mb-3">Funnel Progress</p>
        <div className="flex flex-col gap-1.5">
          {FUNNEL_STAGES.map((stage, idx) => {
            const isActive = stage === account.stage;
            const isDone = idx < currentStageIdx;

            return (
              <div key={stage} className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center border text-[10px] font-bold transition-colors ${
                      isDone
                        ? "bg-positive-500 border-positive-500 text-white"
                        : isActive
                        ? "bg-accent-500 border-accent-500 text-white"
                        : "bg-sunken border-border-default text-text-tertiary"
                    }`}
                  >
                    {isDone ? "✓" : idx + 1}
                  </div>
                  {idx < FUNNEL_STAGES.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 -translate-x-1/2 w-px h-3 ${
                        isDone ? "bg-positive-500" : "bg-border-subtle"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-accent-500 font-semibold" : isDone ? "text-text-secondary" : "text-text-tertiary"
                  }`}
                >
                  {STAGE_LABELS[stage]}
                </span>
                {isActive && (
                  <span className="ml-auto text-[10px] font-mono text-text-tertiary">{account.daysInStage}d</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick links */}
      <Card className="p-4 border-border-default">
        <p className="text-xs font-semibold text-text-tertiary mb-3">Quick Access</p>
        <div className="space-y-1.5">
          <Link
            href="/outreach-review"
            className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] hover:bg-sunken border border-transparent hover:border-border-subtle transition-colors text-xs text-text-secondary hover:text-text-primary group"
          >
            <span>Review Outreach Drafts</span>
            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/accounts"
            className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] hover:bg-sunken border border-transparent hover:border-border-subtle transition-colors text-xs text-text-secondary hover:text-text-primary group"
          >
            <span>Back to Accounts</span>
            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
