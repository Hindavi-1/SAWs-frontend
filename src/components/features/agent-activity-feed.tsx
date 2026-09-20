"use client";

import { ConfidenceBadge } from "@/components/ui/badge";
import { MODULE_SHORT } from "@/lib/stage-meta";
import type { AgentTask } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, CircleDashed, Eye, Loader2 } from "lucide-react";
import Link from "next/link";

const STATUS_META: Record<AgentTask["status"], { icon: typeof CheckCircle2; className: string; ring: string; label: string }> = {
  done: {
    icon: CheckCircle2,
    className: "text-positive-500",
    ring: "bg-positive-50 ring-positive-500/20",
    label: "Completed",
  },
  running: {
    icon: Loader2,
    className: "text-progress-500 animate-spin",
    ring: "bg-progress-50 ring-progress-500/20",
    label: "Running",
  },
  queued: {
    icon: CircleDashed,
    className: "text-text-tertiary",
    ring: "bg-sunken ring-border-default",
    label: "Queued",
  },
  needs_review: {
    icon: Eye,
    className: "text-caution-500",
    ring: "bg-caution-50 ring-caution-500/20",
    label: "Needs review",
  },
  error: {
    icon: AlertTriangle,
    className: "text-risk-500",
    ring: "bg-risk-50 ring-risk-500/20",
    label: "Error",
  },
};

export function AgentActivityFeed({ tasks }: { tasks: AgentTask[] }) {
  if (tasks.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sunken text-text-tertiary">
          <CircleDashed className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-text-secondary">No agent activity yet</p>
        <p className="mt-1 text-xs text-text-tertiary">Start a discovery run to see live activity here.</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border-subtle">
      {tasks.map((task) => (
        <AgentActivityRow key={task.id} task={task} />
      ))}
    </ul>
  );
}

function AgentActivityRow({ task }: { task: AgentTask }) {
  const meta = STATUS_META[task.status];
  const Icon = meta.icon;
  return (
    <li className="group flex gap-3 px-5 py-4 transition-colors hover:bg-sunken/50">
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1", meta.ring)}>
        <Icon className={cn("h-4 w-4", meta.className)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-text-primary">{task.title}</span>
          <span className="inline-flex items-center rounded-full border border-border-subtle bg-gradient-to-r from-sunken to-sunken/50 px-2 py-0.5 text-[10px] font-bold text-text-secondary">
            {MODULE_SHORT[task.moduleId]}
          </span>
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            meta.ring,
            meta.className.replace("text-", "text-").replace(" animate-spin", "")
          )}>
            {meta.label}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-tertiary">
          {task.accountName && task.accountId && (
            <>
              <Link
                href={`/accounts/${task.accountId}`}
                className="font-semibold text-text-secondary transition-colors hover:text-accent-500"
              >
                {task.accountName}
              </Link>
              <span className="h-1 w-1 rounded-full bg-border-strong" />
            </>
          )}
          <span className="font-medium">{timeAgo(task.startedAt)}</span>
          {task.sourcesConsulted !== undefined && (
            <>
              <span className="h-1 w-1 rounded-full bg-border-strong" />
              <span className="font-medium">{task.sourcesConsulted} sources</span>
            </>
          )}
          {task.confidence && <ConfidenceBadge level={task.confidence} />}
        </div>
        {task.reasoning && (
          <p className="mt-2 rounded-lg border border-border-subtle bg-gradient-to-br from-sunken/60 to-transparent px-3 py-2.5 text-xs leading-relaxed text-text-secondary">
            {task.reasoning}
          </p>
        )}
      </div>
    </li>
  );
}
