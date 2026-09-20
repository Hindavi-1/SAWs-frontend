"use client";

import { FUNNEL_STAGES } from "@/lib/types";
import type { FunnelStage, FunnelStageCount } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { AlertTriangle, ArrowDownRight } from "lucide-react";
import Link from "next/link";

const FULL_LABELS: Record<FunnelStage, string> = {
  discovered: "Discovered",
  verified: "Verified",
  qualified: "Qualified",
  buyer_identified: "Buyer Identified",
  researched: "Researched",
  outreach_ready: "Outreach Ready",
  engaged: "Engaged",
  nurture: "Nurture / Follow-up",
  next_action: "Next Best Action",
};

const SHORT_LABELS: Record<FunnelStage, string> = {
  discovered: "Discovered",
  verified: "Verified",
  qualified: "Qualified",
  buyer_identified: "Buyer ID",
  researched: "Researched",
  outreach_ready: "Outreach",
  engaged: "Engaged",
  nurture: "Nurture / FU",
  next_action: "Next Action",
};

const RAMP_VAR = [
  "var(--ramp-1)",
  "var(--ramp-2)",
  "var(--ramp-3)",
  "var(--ramp-4)",
  "var(--ramp-5)",
  "var(--ramp-6)",
  "var(--ramp-7)",
  "var(--ramp-8)",
  "var(--ramp-8)",
];

const UNUSUAL_DROP_PCT = 35;
const SEVERE_DROP_PCT = 60;

type DropSeverity = "normal" | "warning" | "critical";

function dropSeverity(dropPct: number): DropSeverity {
  if (dropPct >= SEVERE_DROP_PCT) return "critical";
  if (dropPct >= UNUSUAL_DROP_PCT) return "warning";
  return "normal";
}

export function FunnelBar({ data }: { data: FunnelStageCount[] }) {
  const ordered = FUNNEL_STAGES.map(
    (stage) => data.find((d) => d.stage === stage) ?? { stage, count: 0, deltaThisWeek: 0 }
  );
  const total = Math.max(ordered.reduce((sum, d) => sum + d.count, 0), 1);
  const maxCount = Math.max(...ordered.map((d) => d.count), 1);

  const conversions = ordered.map((d, i) => {
    if (i === 0) {
      return { convPct: 100, dropCount: 0, dropPct: 0, severity: "normal" as DropSeverity };
    }
    const prev = ordered[i - 1].count || 1;
    const convPct = (d.count / prev) * 100;
    const dropCount = ordered[i - 1].count - d.count;
    const dropPct = 100 - convPct;
    return {
      convPct,
      dropCount,
      dropPct,
      severity: dropSeverity(dropPct),
    };
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left: Stage info list — precise numbers, delta, % of total */}
      <div className="lg:col-span-6 divide-y divide-border-subtle rounded-xl border border-border-subtle overflow-hidden">
        {ordered.map((d, i) => {
          const pct = (d.count / total) * 100;
          const isNegative = d.deltaThisWeek < 0;
          return (
            <Link
              key={d.stage}
              href={`/accounts?stage=${d.stage}`}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-2.5 transition-all duration-200 hover:bg-sunken/60",
                isNegative && "bg-rose-50/40 dark:bg-rose-500/5 hover:bg-rose-50/70 dark:hover:bg-rose-500/10"
              )}
            >
              {isNegative && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-risk-500 to-risk-400" />
              )}
              <div
                className={cn(
                  "h-7 w-1.5 shrink-0 border border-black/5 dark:border-white/10",
                  isNegative && "ring-2 ring-risk-500/20"
                )}
                style={{ backgroundColor: RAMP_VAR[i] }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-semibold text-text-primary group-hover:text-accent-500 transition-colors">
                    {FULL_LABELS[d.stage]}
                  </span>
                  {isNegative && (
                    <AlertTriangle className="h-3 w-3 shrink-0 text-risk-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-mono text-sm font-bold tracking-tight text-text-primary tabular-nums">
                  {formatNumber(d.count)}
                </span>
                <span className="w-14 text-right font-mono text-[11px] font-semibold text-text-tertiary tabular-nums">
                  {pct.toFixed(1)}%
                </span>
                <div
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1",
                    isNegative
                      ? "bg-rose-100 text-rose-700 ring-risk-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:ring-risk-500/30"
                      : "bg-emerald-50 text-emerald-600 ring-emerald-500/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                  )}
                >
                  <svg
                    className={cn("h-2.5 w-2.5", isNegative && "rotate-180")}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isNegative ? "" : "+"}
                  {d.deltaThisWeek}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right: Compact funnel — stage shape, conversion rate, and visible drop-offs */}
      <div className="lg:col-span-6 flex flex-col rounded-xl border border-border-subtle bg-gradient-to-br from-raised to-sunken/60 px-4 sm:px-5 py-5">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex flex-col">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
              Funnel shape &amp; drop-off
            </p>
            <p className="mt-0.5 text-[10px] text-text-tertiary font-medium">
              Width = volume · arrows show conversion to next stage
            </p>
          </div>
          <p className="text-[11px] font-semibold text-text-tertiary">
            {formatNumber(total)} total
          </p>
        </div>

        <div className="flex flex-col gap-1">
          {ordered.map((d, i) => {
            const conv = conversions[i];
            const widthPct = 18 + ((d.count / maxCount) * 82);
            return (
              <div key={d.stage} className="flex flex-col">
                <Link
                  href={`/accounts?stage=${d.stage}`}
                  className="group flex justify-center w-full"
                >
                  <div
                    className="relative flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 border border-black/5 dark:border-white/10 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: RAMP_VAR[i],
                      minWidth: "180px",
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {conv.severity !== "normal" && i > 0 && (
                        <AlertTriangle
                          className={cn(
                            "h-3 w-3 shrink-0 text-white drop-shadow-sm",
                            conv.severity === "critical" && "animate-pulse"
                          )}
                        />
                      )}
                      <span className="text-[11px] sm:text-xs font-bold text-white drop-shadow-sm truncate">
                        {SHORT_LABELS[d.stage]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      <span className="font-mono text-[11px] sm:text-xs font-bold text-white/95 drop-shadow-sm tabular-nums whitespace-nowrap">
                        {formatNumber(d.count)}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[10px] sm:text-[11px] font-bold tabular-nums whitespace-nowrap px-1.5 py-0.5 rounded",
                          i === 0
                            ? "bg-white/20 text-white/95"
                            : conv.severity === "critical"
                              ? "bg-black/25 text-white ring-1 ring-white/30"
                              : conv.severity === "warning"
                                ? "bg-black/15 text-white/95"
                                : "bg-white/15 text-white/90"
                        )}
                      >
                        {conv.convPct.toFixed(0)}%
                      </span>
                    </div>
                    <div
                      className="absolute inset-0 opacity-60 pointer-events-none"
                      style={{
                        backgroundImage:
                          "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 45%, rgba(0,0,0,0.05) 100%)",
                      }}
                    />
                  </div>
                </Link>

                {/* Connector arrow with drop-off between this stage and next */}
                {i < ordered.length - 1 && (() => {
                  const nextConv = conversions[i + 1];
                  const sev = nextConv.severity;
                  return (
                    <div className="flex justify-center items-center my-0.5">
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1",
                          sev === "critical"
                            ? "bg-risk-50 text-risk-700 ring-risk-500/20 dark:bg-risk-500/15 dark:text-risk-400 dark:ring-risk-500/30"
                            : sev === "warning"
                              ? "bg-caution-50 text-caution-700 ring-caution-500/20 dark:bg-caution-500/15 dark:text-caution-500 dark:ring-caution-500/30"
                              : "bg-sunken text-text-tertiary ring-border-subtle dark:bg-raised"
                        )}
                      >
                        <ArrowDownRight className="h-3 w-3" />
                        <span>
                          {nextConv.dropCount > 0
                            ? `−${formatNumber(nextConv.dropCount)}  (${nextConv.dropPct.toFixed(0)}% drop)`
                            : `+${formatNumber(Math.abs(nextConv.dropCount))}`}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-text-tertiary">Healthy</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-caution-500" />
              <span className="text-[10px] font-medium text-text-tertiary">
                {`≥${UNUSUAL_DROP_PCT}% drop`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-risk-500" />
              <span className="text-[10px] font-medium text-text-tertiary">
                {`≥${SEVERE_DROP_PCT}% drop`}
              </span>
            </div>
          </div>
          <Link
            href="/accounts"
            className="text-[10px] font-bold text-accent-500 hover:underline transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>
    </div>
  );
}
