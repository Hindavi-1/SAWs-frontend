"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Buyer } from "@/lib/types";
import { Mail, Sparkles, UserPlus, Loader2, Info } from "lucide-react";
import * as api from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

interface AccountBuyersTabProps {
  buyers: Buyer[];
  accountName: string;
  accountId?: string;
  onBuyersUpdated?: () => void;
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.86 0-1.56.7-1.56 1.56s.7 1.56 1.56 1.56 1.56-.7 1.56-1.56c0-.86-.7-1.56-1.56-1.56Z" />
    </svg>
  );
}

export function AccountBuyersTab({ buyers, accountName, accountId, onBuyersUpdated }: AccountBuyersTabProps) {
  const [findingMore, setFindingMore] = React.useState(false);

  const handleFindMore = async () => {
    if (!accountId) return;
    setFindingMore(true);
    toast.info("Discovering decision makers", {
      description: `Searching LinkedIn & executive directories for ${accountName} (M05)...`,
    });
    try {
      await api.identifyBuyers(accountId);
      toast.success("Buyer identification complete", {
        description: `Verified contacts and mapped organizational chart for ${accountName}`,
      });
      onBuyersUpdated?.();
    } catch (err: any) {
      console.error("Buyer identification failed:", err);
      toast.error("Buyer identification failed", {
        description: err?.message || "Could not identify buyers. Check backend logs.",
      });
    } finally {
      setFindingMore(false);
    }
  };

  if (buyers.length === 0) {
    return (
      <Card className="p-8 text-center border-border-default">
        <p className="text-xs text-text-tertiary">No decision makers identified for this account yet.</p>
        <p className="mt-1 text-[11px] text-text-tertiary">
          Buyers and their work emails are discovered automatically once discovery runs through M05.
        </p>
        <Button
          size="xs"
          variant="ghost"
          className="mt-3 text-text-tertiary hover:text-text-primary"
          onClick={handleFindMore}
          disabled={findingMore}
          title="Only needed if the identified buyers look wrong"
        >
          {findingMore ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {findingMore ? "Identifying buyers…" : "Re-run buyer identification"}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Identified Decision Makers & Champions ({buyers.length})
        </p>
        <Button
          size="xs"
          variant="ghost"
          onClick={handleFindMore}
          disabled={findingMore}
          className="text-text-tertiary hover:text-text-primary"
          title="Only needed if the identified buyers look wrong"
        >
          {findingMore ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <UserPlus className="h-3 w-3" />
          )}
          {findingMore ? "Searching…" : "Re-run"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {buyers.map((b) => (
          <Card key={b.id} className="p-4 border-border-default hover:border-border-strong transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-50 font-semibold text-xs text-accent-500 border border-accent-200/50">
                  {b.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">{b.name}</p>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-sunken border border-border-subtle text-text-tertiary">
                      {b.seniority}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary">{b.title}</p>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
              <Badge
                signal={
                  b.engagementState === "replied" || b.engagementState === "meeting_booked"
                    ? "positive"
                    : b.engagementState === "contacted"
                    ? "caution"
                    : "neutral"
                }
              >
                {b.engagementState.replace("_", " ")}
              </Badge>

              <div className="flex items-center gap-2">
                {b.linkedinUrl && (
                  <a
                    href={b.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-sunken rounded-[var(--radius-xs)] transition-colors"
                    title="View LinkedIn Profile"
                  >
                    <LinkedinIcon className="h-3.5 w-3.5" />
                  </a>
                )}
                {b.email && (
                  <span
                    className="inline-flex items-center gap-1"
                    title={
                      b.emailStatus === "pattern_deduced"
                        ? "Derived email — generated from the company's email naming pattern, not found publicly. Verify before sending."
                        : undefined
                    }
                  >
                    <a
                      href={`mailto:${b.email}`}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-accent-500 hover:bg-accent-50/50 rounded-[var(--radius-xs)] transition-colors font-mono"
                    >
                      <Mail className="h-3 w-3" />
                      <span
                        className={cn(
                          b.emailStatus === "pattern_deduced" &&
                            "underline decoration-dotted underline-offset-2"
                        )}
                      >
                        {b.email}
                      </span>
                    </a>
                    {b.emailStatus === "pattern_deduced" && (
                      <span
                        className="inline-flex items-center gap-0.5 rounded-full border border-caution-500/25 bg-caution-500/10 px-1.5 py-0.2 text-[10px] font-medium text-caution-600 dark:text-caution-400"
                        title="Derived email — generated from the company's email naming pattern, not found publicly. Verify before sending."
                      >
                        <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
                        Unverified
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
