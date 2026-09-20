import { Card } from "@/components/ui/card";
import { MODULE_LABELS } from "@/lib/types";
import type { ModuleStatus } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

const STATUS_META: Record<ModuleStatus["status"], { label: string; className: string; dot: string }> = {
  active: { label: "Active", className: "text-positive-600", dot: "bg-positive-500" },
  idle: { label: "Idle", className: "text-text-tertiary", dot: "bg-text-tertiary" },
  degraded: { label: "Degraded", className: "text-caution-600", dot: "bg-caution-500" },
  error: { label: "Error", className: "text-risk-600", dot: "bg-risk-500" },
};

export function ModuleStatusCard({ module }: { module: ModuleStatus }) {
  const meta = STATUS_META[module.status];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-text-primary">{MODULE_LABELS[module.id]}</p>
        <span className={cn("flex shrink-0 items-center gap-1.5 text-xs font-medium", meta.className)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Runs today" value={module.runsToday} />
        <Stat label="Success" value={`${module.successRate}%`} />
        <Stat label="Avg time" value={`${module.avgDurationSec}s`} />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-text-tertiary">
        <span>Last run {timeAgo(module.lastRunAt)}</span>
        {module.dependsOn.length > 0 && <span>{module.dependsOn.length} dependenc{module.dependsOn.length > 1 ? "ies" : "y"}</span>}
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-sunken py-1.5">
      <p className="font-mono text-sm font-semibold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-tertiary">{label}</p>
    </div>
  );
}
