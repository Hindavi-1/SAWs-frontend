import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ApprovalCard } from "@/components/features/approval-card";
import { getApprovalQueue } from "@/lib/api";
import { Inbox, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ActionsPage() {
  const approvals = await getApprovalQueue();
  const outreachApprovals = approvals.filter((a) => a.kind === "outreach_email");
  const urgent = approvals.filter((a) => a.urgency === "high" && a.kind !== "outreach_email");
  const normal = approvals.filter((a) => a.urgency === "normal" && a.kind !== "outreach_email");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Action Queue"
        description="Operational decision center for qualification overrides, stage advancement gates, and compliance reviews."
      />

      {/* Showpiece Cross-Link Banner */}
      <div className="rounded-[var(--radius-lg)] border border-accent-500/20 bg-accent-50/60 dark:bg-accent-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-500 text-white shadow-xs">
            <Inbox className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                Module 07 · Human-in-the-Loop Showpiece
              </span>
              <span className="rounded-full bg-accent-500 text-white px-1.5 py-0.2 text-[10px] font-bold font-mono">
                {outreachApprovals.length || 3} Pending
              </span>
            </div>
            <p className="text-sm font-bold text-text-primary mt-0.5">
              Outreach Review & Sequence Approval Workspace
            </p>
            <p className="text-xs text-text-secondary">
              Inspect multi-channel email, LinkedIn and call scripts, edit inline, check agent reasoning, and approve.
            </p>
          </div>
        </div>
        <Link href="/outreach-review" className="shrink-0">
          <Button size="sm" className="w-full sm:w-auto font-bold gap-1.5">
            Open Outreach Review <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {urgent.length > 0 && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-risk-600 dark:text-risk-400">
                  Urgent Governance & Compliance
                </CardTitle>
                <CardDescription>
                  {urgent.length} items requiring immediate decision before pipeline accounts can advance
                </CardDescription>
              </div>
            </CardHeader>
            <div className="divide-y divide-border-subtle">
              {urgent.map((item) => (
                <ApprovalCard key={item.id} item={item} />
              ))}
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Standard Stage Advancement & Qualification Gates</CardTitle>
              <CardDescription>
                {normal.length} account verification and qualification checklist reviews
              </CardDescription>
            </div>
          </CardHeader>
          <div className="divide-y divide-border-subtle">
            {normal.map((item) => (
              <ApprovalCard key={item.id} item={item} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
