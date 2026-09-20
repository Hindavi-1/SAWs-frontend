import { cn } from "@/lib/utils";
import { STAGE_GATED, STAGE_LABELS, FUNNEL_STAGES, type FunnelStage } from "@/lib/types";
import { Check, Lock, LockOpen } from "lucide-react";

export function Stepper({ currentStage, className }: { currentStage: FunnelStage; className?: string }) {
  const currentIndex = FUNNEL_STAGES.indexOf(currentStage);

  return (
    <ol className={cn("space-y-0.5", className)}>
      {FUNNEL_STAGES.map((stage, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
        const gated = STAGE_GATED[stage];
        return (
          <li key={stage} className="relative flex items-start gap-3 pb-4 last:pb-0">
            {i < FUNNEL_STAGES.length - 1 && (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-full w-px",
                  state === "done" ? "bg-accent-500" : "bg-border-default"
                )}
              />
            )}
            <span
              className={cn(
                "z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                state === "done" && "border-accent-500 bg-accent-500 text-accent-contrast",
                state === "current" && "border-accent-500 bg-raised text-accent-500",
                state === "upcoming" && "border-border-default bg-raised text-text-tertiary"
              )}
            >
              {state === "done" ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2 pt-0.5">
              <span
                className={cn(
                  "text-sm",
                  state === "current" ? "font-semibold text-text-primary" : state === "done" ? "text-text-secondary" : "text-text-tertiary"
                )}
              >
                {STAGE_LABELS[stage]}
              </span>
              {gated && (
                <span title={state === "done" ? "Passed human approval" : "Requires human approval"}>
                  {state === "done" ? (
                    <LockOpen className="h-3 w-3 text-text-tertiary" />
                  ) : (
                    <Lock className="h-3 w-3 text-text-tertiary" />
                  )}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
