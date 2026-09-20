import { cn } from "@/lib/utils";
import { CONFIDENCE_META, HEALTH_META, SIGNAL_CLASSES } from "@/lib/stage-meta";
import type { AccountHealth, ConfidenceLevel, FunnelStage } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/types";

interface BadgeProps {
  children: React.ReactNode;
  signal?: keyof typeof SIGNAL_CLASSES;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, signal = "neutral", className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 whitespace-nowrap transition-colors",
        SIGNAL_CLASSES[signal],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColorClass(signal))} />}
      {children}
    </span>
  );
}

function dotColorClass(signal: keyof typeof SIGNAL_CLASSES) {
  switch (signal) {
    case "positive":
      return "bg-positive-500";
    case "caution":
      return "bg-caution-500";
    case "risk":
      return "bg-risk-500";
    case "progress":
      return "bg-progress-500";
    default:
      return "bg-text-tertiary";
  }
}

export function ConfidenceBadge({ level, className }: { level: ConfidenceLevel; className?: string }) {
  const meta = CONFIDENCE_META[level];
  return (
    <Badge signal={meta.signal} dot className={className}>
      {meta.label}
    </Badge>
  );
}

export function HealthBadge({ health, className }: { health: AccountHealth; className?: string }) {
  const meta = HEALTH_META[health];
  return (
    <Badge signal={meta.signal} dot className={className}>
      {meta.label}
    </Badge>
  );
}

export function StageBadge({ stage, className }: { stage: FunnelStage; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border-strong bg-gradient-to-b from-raised to-sunken/70 px-2 py-0.5 text-[10px] font-bold tracking-wide text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}
