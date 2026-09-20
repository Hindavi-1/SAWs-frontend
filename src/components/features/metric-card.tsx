import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TONE_STYLES: Record<string, { iconBg: string; iconColor: string; accentBar: string }> = {
  indigo: {
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    accentBar: "from-indigo-500 to-indigo-400",
  },
  violet: {
    iconBg: "bg-violet-50 dark:bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    accentBar: "from-violet-500 to-violet-400",
  },
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    accentBar: "from-emerald-500 to-emerald-400",
  },
  cyan: {
    iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    accentBar: "from-cyan-500 to-cyan-400",
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    accentBar: "from-amber-500 to-amber-400",
  },
  rose: {
    iconBg: "bg-rose-50 dark:bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    accentBar: "from-rose-500 to-rose-400",
  },
};

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  suffix,
  tone = "indigo",
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive: boolean };
  icon: LucideIcon;
  suffix?: string;
  tone?: keyof typeof TONE_STYLES;
}) {
  const tones = TONE_STYLES[tone] ?? TONE_STYLES.indigo;

  return (
    <Card className="group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className={cn("absolute left-0 top-0 h-1 w-full bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100", tones.accentBar)} />
      
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-text-tertiary tracking-tight">{label}</p>
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110", tones.iconBg)}>
          <Icon className={cn("h-4 w-4", tones.iconColor)} />
        </div>
      </div>
      
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold tracking-tight text-text-primary tabular-nums">{value}</span>
        {suffix && <span className="text-sm font-medium text-text-tertiary">{suffix}</span>}
      </div>
      
      {delta && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
            delta.positive
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
          )}>
            <svg
              className={cn("h-3 w-3", !delta.positive && "rotate-180")}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {delta.value}
          </span>
          <span className="text-[11px] text-text-tertiary">this week</span>
        </div>
      )}
    </Card>
  );
}
