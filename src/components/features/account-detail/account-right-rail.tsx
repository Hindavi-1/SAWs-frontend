"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Account, FunnelStage } from "@/lib/types";
import { FUNNEL_STAGES, STAGE_LABELS } from "@/lib/types";
import { Sparkles, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";
import * as api from "@/lib/api";

interface AccountRightRailProps {
  account: Account;
  onAccountUpdated?: () => void;
}

export function AccountRightRail({ account, onAccountUpdated }: AccountRightRailProps) {
  const [advancing, setAdvancing] = React.useState(false);

  const getRecommendedAction = () => {
    if (account.stage === "discovered" || account.verificationStatus !== "verified") {
      return {
        title: "Verify Account (M03)",
        description: `Verify domain resolution, corporate identity, and operations for ${account.name}.`,
        cta: "Run Verification",
        step: "verify",
      };
    }
    if (account.stage === "verified") {
      return {
        title: "Evaluate ICP Fit (M04)",
        description: `Score ${account.name} across multi-dimensional criteria against the target ICP.`,
        cta: "Score ICP Fit",
        step: "fit",
      };
    }
    if (account.stage === "researched") {
      return {
        title: "Identify Buyers (M05)",
        description: `Find economic buyers, decision-makers, and verified work emails at ${account.name}.`,
        cta: "Identify Buyers",
        step: "buyers",
      };
    }
    if (account.stage === "buyer_identified") {
      return {
        title: "Deep Account Dossier (M06)",
        description: `Conduct deep qualitative research, pain point mapping, and news signal analysis.`,
        cta: "Build Dossier",
        step: "research",
      };
    }
    if (account.stage === "outreach_ready") {
      return {
        title: "Review Outreach Sequences",
        description: `Personalized sequence drafted for key buyers. Ready to review and send.`,
        cta: "Review Drafts",
        step: "outreach",
        link: "/outreach-review",
      };
    }
    if (account.health === "stalled") {
      return {
        title: "Send re-engagement",
        description: `${account.daysInStage} days stalled. Reference recent news or exec change at ${account.name} to revive interest.`,
        cta: "Re-engage Account",
        step: "research",
      };
    }
    return {
      title: `Advance to ${STAGE_LABELS[nextStage(account.stage) as FunnelStage] ?? "Next Stage"}`,
      description: `Run the next autonomous pipeline stage for ${account.name}.`,
      cta: "Advance Stage",
      step: "next",
    };
  };

  const recommendedAction = getRecommendedAction();

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      await api.advanceAccountWorkflow(account.id, recommendedAction.step);
      toast.success("Stage advanced", {
        description: `${account.name} successfully processed through ${recommendedAction.title}.`,
      });
      onAccountUpdated?.();
    } catch (err: any) {
      console.error("Advance failed:", err);
      toast.error("Advance failed", {
        description: err?.message || "Could not advance this account. Check backend logs.",
      });
    } finally {
      setAdvancing(false);
    }
  };

  const currentStageIdx = FUNNEL_STAGES.indexOf(account.stage);

  return (
    <div className="space-y-4">
      {/* Next Best Action */}
      <Card className="p-4 border-agent-border bg-agent-surface/30">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-agent-core" />
          <p className="text-xs font-semibold text-agent-core">Next Best Action</p>
        </div>
        <p className="text-sm font-bold text-text-primary mb-1">{recommendedAction.title}</p>
        <p className="text-xs text-text-secondary leading-relaxed mb-4">{recommendedAction.description}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAdvance} disabled={advancing} className="flex-1">
            {advancing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            {advancing ? "Running…" : recommendedAction.cta}
          </Button>
          <Button size="sm" variant="ghost">Skip</Button>
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

function nextStage(current: string): string {
  const idx = FUNNEL_STAGES.indexOf(current as FunnelStage);
  if (idx < 0 || idx >= FUNNEL_STAGES.length - 1) return current;
  return FUNNEL_STAGES[idx + 1];
}
