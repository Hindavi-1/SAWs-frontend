"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MODULE_SHORT } from "@/lib/stage-meta";
import type { ApprovalItem } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Check, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function ApprovalCard({ item }: { item: ApprovalItem }) {
  const [resolved, setResolved] = React.useState<"approved" | "rejected" | null>(null);

  if (resolved) {
    return (
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={
              resolved === "approved"
                ? "flex h-8 w-8 items-center justify-center rounded-lg bg-positive-50 text-positive-500 ring-1 ring-positive-500/20 dark:bg-positive-500/10"
                : "flex h-8 w-8 items-center justify-center rounded-lg bg-risk-50 text-risk-500 ring-1 ring-risk-500/20 dark:bg-risk-500/10"
            }
          >
            {resolved === "approved" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary line-through decoration-border-strong/60">
              {item.title}
            </p>
            <p className="text-[11px] text-text-tertiary">{timeAgo(item.createdAt)}</p>
          </div>
        </div>
        <span
          className={
            resolved === "approved"
              ? "inline-flex items-center gap-1 rounded-lg bg-positive-50 px-2.5 py-1 text-xs font-bold text-positive-600 ring-1 ring-positive-500/20 dark:bg-positive-500/10 dark:text-positive-400"
              : "inline-flex items-center gap-1 rounded-lg bg-risk-50 px-2.5 py-1 text-xs font-bold text-risk-600 ring-1 ring-risk-500/20 dark:bg-risk-500/10 dark:text-risk-400"
          }
        >
          {resolved === "approved" ? "Approved" : "Rejected"}
        </span>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 transition-colors hover:bg-sunken/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/accounts/${item.accountId}`}
              className="group inline-flex items-center gap-1 text-sm font-bold text-text-primary transition-colors hover:text-accent-500"
            >
              {item.title}
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-tertiary transition-all group-hover:translate-x-0.5 group-hover:text-accent-500" />
            </Link>
            {item.urgency === "high" && (
              <Badge signal="risk" dot>
                Urgent
              </Badge>
            )}
            <span className="inline-flex items-center rounded-full border border-border-subtle bg-gradient-to-r from-sunken to-sunken/50 px-2 py-0.5 text-[10px] font-bold text-text-secondary">
              {MODULE_SHORT[item.moduleId]}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{item.description}</p>
          {item.payloadPreview && (
            <p className="mt-3 rounded-xl border border-border-subtle bg-gradient-to-br from-sunken/70 via-sunken/40 to-transparent px-4 py-3 text-xs italic leading-relaxed text-text-secondary ring-1 ring-border-subtle/50">
              &ldquo;{item.payloadPreview}&rdquo;
            </p>
          )}
          <p className="mt-2 text-[11px] font-medium text-text-tertiary">
            {item.accountName} · {timeAgo(item.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
          <Button
            size="sm"
            variant="success"
            onClick={() => setResolved("approved")}
            className="shadow-[0_2px_8px_-2px_rgba(20,160,108,0.45)] hover:shadow-[0_4px_12px_-2px_rgba(20,160,108,0.55)]"
          >
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setResolved("rejected")}
            className="border border-border-default"
          >
            <X className="h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
