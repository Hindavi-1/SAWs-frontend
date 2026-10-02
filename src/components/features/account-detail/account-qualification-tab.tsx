"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QualificationCriterion } from "@/lib/types";
import { CheckCircle2, AlertCircle, HelpCircle, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface AccountQualificationTabProps {
  criteria: QualificationCriterion[];
}

const STATUS_META = {
  met: {
    icon: CheckCircle2,
    color: "text-positive-500",
    bg: "bg-positive-50 dark:bg-positive-950/30 border-positive-200/50 dark:border-positive-800/30",
    label: "Met",
  },
  unmet: {
    icon: AlertCircle,
    color: "text-risk-500",
    bg: "bg-risk-50 dark:bg-risk-950/30 border-risk-200/50 dark:border-risk-800/30",
    label: "Unmet",
  },
  unclear: {
    icon: HelpCircle,
    color: "text-caution-500",
    bg: "bg-caution-50 dark:bg-caution-950/30 border-caution-200/50 dark:border-caution-800/30",
    label: "Unclear",
  },
} as const;

export function AccountQualificationTab({ criteria }: AccountQualificationTabProps) {
  const [overrides, setOverrides] = React.useState<Record<string, QualificationCriterion["status"]>>({});

  const handleOverride = (id: string, status: QualificationCriterion["status"]) => {
    setOverrides((prev) => ({ ...prev, [id]: status }));
    toast.success("Override applied", {
      description: `Criterion marked as "${status}" — will inform future qualification runs.`,
    });
  };

  if (criteria.length === 0) {
    return (
      <Card className="p-8 text-center border-border-default">
        <p className="text-xs text-text-tertiary">
          Qualification has not run for this account yet.
        </p>
        <Button size="sm" className="mt-3">
          <Sparkles className="h-3.5 w-3.5" /> Run Qualification
        </Button>
      </Card>
    );
  }

  const metCount = criteria.filter((c) => (overrides[c.id] ?? c.status) === "met").length;
  const unmetCount = criteria.filter((c) => (overrides[c.id] ?? c.status) === "unmet").length;
  const unclearCount = criteria.filter((c) => (overrides[c.id] ?? c.status) === "unclear").length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-positive-200/50 bg-positive-50/70 dark:bg-positive-950/30">
          <CheckCircle2 className="h-3.5 w-3.5 text-positive-500" />
          <span className="text-xs font-medium text-positive-700 dark:text-positive-400">{metCount} met</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-caution-200/50 bg-caution-50/70 dark:bg-caution-950/30">
          <HelpCircle className="h-3.5 w-3.5 text-caution-500" />
          <span className="text-xs font-medium text-caution-700 dark:text-caution-400">{unclearCount} unclear</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-risk-200/50 bg-risk-50/70 dark:bg-risk-950/30">
          <AlertCircle className="h-3.5 w-3.5 text-risk-500" />
          <span className="text-xs font-medium text-risk-700 dark:text-risk-400">{unmetCount} unmet</span>
        </div>
      </div>

      <Card className="divide-y divide-border-subtle border-border-default overflow-hidden">
        {criteria.map((c) => {
          const effectiveStatus = overrides[c.id] ?? c.status;
          const meta = STATUS_META[effectiveStatus];
          const Icon = meta.icon;

          return (
            <div key={c.id} className="p-4 hover:bg-sunken/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className={cn("p-1.5 rounded-[var(--radius-xs)] border shrink-0 mt-0.5", meta.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", meta.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-text-primary">{c.label}</p>
                    <span
                      className={cn(
                        "text-[11px] font-mono font-medium px-1.5 py-0.2 rounded shrink-0",
                        effectiveStatus === "met" && "text-positive-600 bg-positive-50 dark:bg-positive-950/30",
                        effectiveStatus === "unmet" && "text-risk-600 bg-risk-50 dark:bg-risk-950/30",
                        effectiveStatus === "unclear" && "text-caution-600 bg-caution-50 dark:bg-caution-950/30"
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-1.5 p-2.5 rounded-[var(--radius-xs)] bg-agent-surface border border-agent-border/50">
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="h-3 w-3 text-agent-core" />
                      <span className="text-[11px] font-semibold text-agent-core">Agent Rationale</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{c.agentRationale}</p>
                  </div>

                  {/* Override buttons for unclear items */}
                  {effectiveStatus === "unclear" && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[11px] text-text-tertiary">Rep override:</span>
                      <button
                        onClick={() => handleOverride(c.id, "met")}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-positive-300 text-positive-600 hover:bg-positive-50 dark:hover:bg-positive-950/40 transition-colors"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Mark as Met
                      </button>
                      <button
                        onClick={() => handleOverride(c.id, "unmet")}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-risk-300 text-risk-600 hover:bg-risk-50 dark:hover:bg-risk-950/40 transition-colors"
                      >
                        <AlertCircle className="h-3 w-3" /> Mark as Unmet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
