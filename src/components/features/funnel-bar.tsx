"use client";

import { STAGE_LABELS } from "@/lib/types";
import type { FunnelStageCount } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import Link from "next/link";

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

export function FunnelBar({ data }: { data: FunnelStageCount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-9 gap-1.5 sm:gap-3">
      {data.map((d, i) => {
        const heightPct = Math.max((d.count / max) * 100, 8);
        const barColor = RAMP_VAR[i];
        return (
          <Link
            key={d.stage}
            href={`/accounts?stage=${d.stage}`}
            className="group flex flex-col items-center gap-2 rounded-lg px-1 py-2.5 transition-all duration-200 hover:bg-sunken/70"
          >
            <div className="relative flex h-32 w-full items-end justify-center sm:h-36">
              <div
                className="relative w-full max-w-[36px] min-w-[20px] border border-black/5 dark:border-white/10 transition-all duration-300 group-hover:scale-[1.06] group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.25)]"
                style={{
                  minHeight: "28px",
                  height: `${heightPct}%`,
                  backgroundColor: barColor,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0) 60%, rgba(0,0,0,0.06) 100%)",
                  }}
                />
                <div
                  className="absolute left-1 top-1 bottom-1 w-1"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0))",
                  }}
                />
              </div>
            </div>
            <div className="w-full text-center">
              <p className="font-mono text-sm font-bold tracking-tight text-text-primary tabular-nums sm:text-base">
                {formatNumber(d.count)}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight font-semibold text-text-secondary sm:text-[11px]">
                {STAGE_LABELS[d.stage]}
              </p>
              <div
                className={cn(
                  "mt-1 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                  d.deltaThisWeek >= 0
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                )}
              >
                <svg
                  className={cn("h-2.5 w-2.5", d.deltaThisWeek < 0 && "rotate-180")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {d.deltaThisWeek >= 0 ? "+" : ""}
                {d.deltaThisWeek}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
