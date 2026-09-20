import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TONE_STYLES: Record<
  string,
  {
    iconBg: string;
    iconColor: string;
    topBar: string;
    cornerGlow: string;
    ringHover: string;
  }
> = {
  indigo: {
    iconBg:
      "bg-[linear-gradient(135deg,var(--accent-50),var(--accent-100))] dark:bg-[linear-gradient(135deg,rgba(74,95,220,0.2),rgba(138,155,237,0.08))]",
    iconColor: "text-indigo-600 dark:text-indigo-300",
    topBar: "from-indigo-500 via-accent-500 to-violet-500",
    cornerGlow: "shadow-[var(--shadow-glow-accent)]",
    ringHover: "hover:ring-indigo-500/25",
  },
  violet: {
    iconBg:
      "bg-[linear-gradient(135deg,rgba(139,92,246,0.08),rgba(167,139,250,0.18))] dark:bg-[linear-gradient(135deg,rgba(139,92,246,0.22),rgba(167,139,250,0.10))]",
    iconColor: "text-violet-600 dark:text-violet-300",
    topBar: "from-violet-500 via-fuchsia-500 to-indigo-500",
    cornerGlow: "shadow-[0_0_30px_-6px_rgba(139,92,246,0.35)]",
    ringHover: "hover:ring-violet-500/25",
  },
  emerald: {
    iconBg:
      "bg-[linear-gradient(135deg,rgba(16,185,129,0.08),rgba(52,211,153,0.18))] dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(52,211,153,0.10))]",
    iconColor: "text-emerald-600 dark:text-emerald-300",
    topBar: "from-emerald-500 via-teal-500 to-cyan-500",
    cornerGlow: "shadow-[var(--shadow-glow-success)]",
    ringHover: "hover:ring-emerald-500/25",
  },
  cyan: {
    iconBg:
      "bg-[linear-gradient(135deg,rgba(6,182,212,0.08),rgba(34,211,238,0.18))] dark:bg-[linear-gradient(135deg,rgba(6,182,212,0.22),rgba(34,211,238,0.10))]",
    iconColor: "text-cyan-600 dark:text-cyan-300",
    topBar: "from-cyan-500 via-sky-500 to-blue-500",
    cornerGlow: "shadow-[var(--shadow-glow-progress)]",
    ringHover: "hover:ring-cyan-500/25",
  },
  amber: {
    iconBg:
      "bg-[linear-gradient(135deg,rgba(245,158,11,0.08),rgba(251,191,36,0.20))] dark:bg-[linear-gradient(135deg,rgba(245,158,11,0.22),rgba(251,191,36,0.10))]",
    iconColor: "text-amber-600 dark:text-amber-300",
    topBar: "from-amber-500 via-orange-500 to-yellow-500",
    cornerGlow: "shadow-[var(--shadow-glow-warm)]",
    ringHover: "hover:ring-amber-500/25",
  },
  rose: {
    iconBg:
      "bg-[linear-gradient(135deg,rgba(244,63,94,0.08),rgba(251,113,133,0.18))] dark:bg-[linear-gradient(135deg,rgba(244,63,94,0.22),rgba(251,113,133,0.10))]",
    iconColor: "text-rose-600 dark:text-rose-300",
    topBar: "from-rose-500 via-pink-500 to-red-500",
    cornerGlow: "shadow-[var(--shadow-glow-risk)]",
    ringHover: "hover:ring-rose-500/25",
  },
};

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  suffix,
  tone = "indigo",
  accentPct,
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive: boolean };
  icon: LucideIcon;
  suffix?: string;
  tone?: keyof typeof TONE_STYLES;
  accentPct?: number;
}) {
  const tones = TONE_STYLES[tone] ?? TONE_STYLES.indigo;

  return (
    <Card
      className={cn(
        "group/card relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1",
        `ring-1 ring-transparent hover:ring-1 ${tones.ringHover}`
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-all duration-500",
          tones.cornerGlow,
          "group-hover/card:opacity-60"
        )}
      />

      <div
        className={cn(
          "absolute left-0 top-0 h-1 w-full bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover/card:opacity-100",
          tones.topBar
        )}
      />
      <div
        className={cn(
          "absolute left-0 top-0 h-1 w-[62%] bg-gradient-to-r opacity-100 animate-shimmer",
          tones.topBar
        )}
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent), linear-gradient(90deg, var(--tw-gradient-stops))",
        }}
      />

      {accentPct !== undefined && (
        <div
          className="absolute left-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-70"
          style={{
            width: `${Math.max(5, Math.min(100, accentPct))}%`,
            background: `linear-gradient(90deg, var(--accent-500), var(--ramp-6))`,
          }}
        />
      )}

      <div className="relative flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
          {label}
        </p>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/50 dark:border-white/5 transition-all duration-300 group-hover/card:-rotate-3 group-hover/card:scale-110",
            tones.iconBg
          )}
        >
          <Icon className={cn("h-[18px] w-[18px] transition-colors", tones.iconColor)} />
        </div>
      </div>

      <div className="relative mt-3.5 flex items-baseline gap-1.5">
        <span className="font-mono text-[26px] leading-none font-bold tracking-tight text-text-primary tabular-nums sm:text-[28px]">
          {value}
        </span>
        {suffix && (
          <span className="text-xs font-semibold text-text-tertiary tracking-tight">
            {suffix}
          </span>
        )}
      </div>

      {delta && (
        <div className="relative mt-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1",
              delta.positive
                ? "bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(52,211,153,0.22))] text-emerald-700 ring-emerald-500/15 dark:text-emerald-300"
                : "bg-[linear-gradient(135deg,rgba(244,63,94,0.10),rgba(251,113,133,0.22))] text-rose-700 ring-rose-500/15 dark:text-rose-300"
            )}
          >
            <svg
              className={cn("h-3 w-3", !delta.positive && "rotate-180")}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {delta.value}%
          </span>
          <span className="text-[11px] font-medium text-text-tertiary">vs last week</span>
        </div>
      )}
    </Card>
  );
}
