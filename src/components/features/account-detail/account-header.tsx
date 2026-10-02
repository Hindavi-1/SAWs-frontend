"use client";

import * as React from "react";
import Link from "next/link";
import { RadialScore } from "@/components/ui/radial-score";
import { StageBadge, HealthBadge, ConfidenceBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Account, OutreachMessage } from "@/lib/types";
import { ExternalLink, Sparkles, Send, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface AccountHeaderProps {
  account: Account;
  pendingDraftCount: number;
}

export function AccountHeader({ account, pendingDraftCount }: AccountHeaderProps) {
  const [isRunning, setIsRunning] = React.useState(false);

  const handleRunDiscovery = () => {
    setIsRunning(true);
    toast.info("Agent task queued", {
      description: `Deep research & buyer discovery started for ${account.name}`,
    });
    setTimeout(() => {
      setIsRunning(false);
      toast.success("Intelligence updated", {
        description: `Refreshed 4 signals and 2 buyer contacts for ${account.name}`,
      });
    }, 1800);
  };

  return (
    <div className="rounded-[var(--radius-md)] border border-border-default bg-raised p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Logo & Company Info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent-50 font-mono text-lg font-bold text-accent-500 border border-accent-200/50 dark:bg-accent-950/50 dark:border-accent-800/40">
            {account.logoInitial}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-text-primary">{account.name}</h1>
              <a
                href={`https://${account.domain}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent-500 font-mono"
              >
                {account.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-text-secondary">
              <span>{account.industry}</span>
              <span>·</span>
              <span>{account.hqLocation}</span>
              <span>·</span>
              <span>{account.employeeRange} employees</span>
            </div>
          </div>
        </div>

        {/* Right: Scores & Actions */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/40">
            <RadialScore value={account.fitScore} size={42} label="fit" />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <StageBadge stage={account.stage} />
                <HealthBadge health={account.health} />
              </div>
              <p className="mt-1 text-[11px] text-text-tertiary font-mono">{account.icpName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingDraftCount > 0 && (
              <Link href="/outreach-review">
                <Button size="sm" className="bg-agent-core hover:bg-agent-core/90 text-white shadow-xs">
                  <Send className="h-3.5 w-3.5" />
                  Review Drafts ({pendingDraftCount})
                </Button>
              </Link>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleRunDiscovery}
              disabled={isRunning}
            >
              <Sparkles className="h-3.5 w-3.5 text-agent-core" />
              {isRunning ? "Running Research..." : "Run AI Research"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
