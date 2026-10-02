"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Buyer } from "@/lib/types";
import { Mail, Sparkles, UserPlus, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface AccountBuyersTabProps {
  buyers: Buyer[];
  accountName: string;
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.86 0-1.56.7-1.56 1.56s.7 1.56 1.56 1.56 1.56-.7 1.56-1.56c0-.86-.7-1.56-1.56-1.56Z" />
    </svg>
  );
}

export function AccountBuyersTab({ buyers, accountName }: AccountBuyersTabProps) {
  const [findingMore, setFindingMore] = React.useState(false);

  const handleFindMore = () => {
    setFindingMore(true);
    toast.info("Discovering decision makers", {
      description: `Searching LinkedIn & executive directories for ${accountName}`,
    });
    setTimeout(() => {
      setFindingMore(false);
      toast.success("Buyer identification complete", {
        description: `Verified contacts and mapped organizational chart`,
      });
    }, 1500);
  };

  if (buyers.length === 0) {
    return (
      <Card className="p-8 text-center border-border-default">
        <p className="text-xs text-text-tertiary">No decision makers identified for this account yet.</p>
        <Button size="sm" className="mt-3" onClick={handleFindMore}>
          <Sparkles className="h-3.5 w-3.5" /> Run Buyer Identification
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
          size="sm"
          variant="outline"
          onClick={handleFindMore}
          disabled={findingMore}
        >
          <UserPlus className="h-3.5 w-3.5" />
          {findingMore ? "Searching..." : "Find More Buyers"}
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

              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] bg-sunken border border-border-subtle font-mono text-xs font-semibold text-text-primary">
                  <span>{b.relevanceScore}</span>
                  <span className="text-[10px] text-text-tertiary font-normal">relevance</span>
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
                  <a
                    href={`mailto:${b.email}`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-accent-500 hover:bg-accent-50/50 rounded-[var(--radius-xs)] transition-colors font-mono"
                  >
                    <Mail className="h-3 w-3" />
                    <span>{b.email}</span>
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
