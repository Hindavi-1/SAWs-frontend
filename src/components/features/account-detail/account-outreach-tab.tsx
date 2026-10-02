"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OutreachMessage, Objection } from "@/lib/types";
import { Mail, CheckCheck, Clock, Send, ArrowRight, Sparkles, MessageSquare } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.86 0-1.56.7-1.56 1.56s.7 1.56 1.56 1.56 1.56-.7 1.56-1.56c0-.86-.7-1.56-1.56-1.56Z" />
    </svg>
  );
}

interface AccountOutreachTabProps {
  outreach: OutreachMessage[];
  objections: Objection[];
  accountId: string;
}

export function AccountOutreachTab({ outreach, objections, accountId }: AccountOutreachTabProps) {
  const pendingDrafts = outreach.filter((m) => m.status === "pending_approval");

  const handleApproveObjection = (id: string) => {
    toast.success("Response approved", {
      description: "Agent response will be sent to the buyer within 24h.",
    });
  };

  if (outreach.length === 0 && objections.length === 0) {
    return (
      <Card className="p-8 text-center border-border-default">
        <p className="text-xs text-text-tertiary">No outreach has been generated for this account yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Pending drafts banner */}
      {pendingDrafts.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-[var(--radius-md)] border border-agent-border bg-agent-surface">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-[var(--radius-xs)] bg-agent-surface border border-agent-border">
              <Sparkles className="h-3.5 w-3.5 text-agent-core" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {pendingDrafts.length} draft{pendingDrafts.length > 1 ? "s" : ""} awaiting your review
              </p>
              <p className="text-xs text-text-tertiary">
                Agent-crafted messages ready to approve and send
              </p>
            </div>
          </div>
          <Link href="/outreach-review">
            <Button size="sm" className="bg-agent-core hover:bg-agent-core/90 text-white">
              Review in Workspace <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Outreach messages */}
      {outreach.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
            Sequence Messages ({outreach.length})
          </p>
          <div className="space-y-2.5">
            {outreach.map((m) => {
              const isPending = m.status === "pending_approval";
              const isSent = m.status === "sent";

              return (
                <Card
                  key={m.id}
                  className={`p-4 border-border-default ${isPending ? "border-agent-border bg-agent-surface/30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {/* Channel icon */}
                      <div className="mt-0.5 p-1.5 rounded-[var(--radius-xs)] bg-sunken border border-border-subtle">
                        {m.channel === "email" ? (
                          <Mail className="h-3.5 w-3.5 text-text-tertiary" />
                        ) : m.channel === "linkedin" ? (
                          <LinkedinIcon className="h-3.5 w-3.5 text-text-tertiary" />
                        ) : (
                          <MessageSquare className="h-3.5 w-3.5 text-text-tertiary" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {m.subject && (
                          <p className="text-sm font-semibold text-text-primary leading-tight">{m.subject}</p>
                        )}
                        {m.stepTitle && (
                          <p className="text-[11px] text-text-tertiary font-mono mb-1.5">
                            Step {m.sequenceStep} · Day {m.dayOffset} · {m.stepTitle}
                          </p>
                        )}
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{m.body}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge
                        signal={
                          isPending ? "caution" : isSent ? "positive" : "neutral"
                        }
                      >
                        {isPending ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            Pending Review
                          </span>
                        ) : isSent ? (
                          <span className="flex items-center gap-1">
                            <CheckCheck className="h-2.5 w-2.5" />
                            Sent
                          </span>
                        ) : (
                          m.status.replace("_", " ")
                        )}
                      </Badge>
                      {m.sentAt && (
                        <span className="text-[11px] font-mono text-text-tertiary">{timeAgo(m.sentAt)}</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Objections */}
      {objections.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
            Buyer Objections ({objections.length})
          </p>
          <div className="space-y-2.5">
            {objections.map((o) => (
              <Card key={o.id} className="p-4 border-caution-500/40 bg-caution-50/20 dark:bg-caution-950/10">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-caution-600">
                    Objection · {o.category}
                  </span>
                  <span className="text-[11px] font-mono text-text-tertiary">{timeAgo(o.raisedAt)}</span>
                </div>
                <blockquote className="border-l-2 border-caution-400 pl-3 mb-3">
                  <p className="text-sm italic text-text-primary">&ldquo;{o.text}&rdquo;</p>
                  <p className="mt-1 text-xs text-text-tertiary">— {o.raisedBy}</p>
                </blockquote>
                <div className="p-3 rounded-[var(--radius-sm)] bg-agent-surface border border-agent-border">
                  <div className="flex items-center gap-1 mb-1.5">
                    <Sparkles className="h-3 w-3 text-agent-core" />
                    <span className="text-[11px] font-semibold text-agent-core">Agent-drafted response</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{o.agentResponse}</p>
                </div>
                {o.status === "pending_approval" && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="success" onClick={() => handleApproveObjection(o.id)}>
                      <Send className="h-3 w-3" /> Approve & Send Response
                    </Button>
                    <Button size="sm" variant="secondary">Edit First</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
