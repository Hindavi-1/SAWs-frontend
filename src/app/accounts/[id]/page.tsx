"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AgentActivityFeed } from "@/components/features/agent-activity-feed";
import { EvidenceList } from "@/components/features/evidence-list";
import { AccountHeader } from "@/components/features/account-detail/account-header";
import { AccountOverviewTab } from "@/components/features/account-detail/account-overview-tab";
import { AccountBuyersTab } from "@/components/features/account-detail/account-buyers-tab";
import { AccountQualificationTab } from "@/components/features/account-detail/account-qualification-tab";
import { AccountOutreachTab } from "@/components/features/account-detail/account-outreach-tab";
import { AccountRightRail } from "@/components/features/account-detail/account-right-rail";
import { AccountResearchTab } from "@/components/features/account-detail/account-research-tab";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/badge";
import * as api from "@/lib/api";
import type {
  Account,
  AgentTask,
  Buyer,
  EvidenceItem,
  IcpCriterionScore,
  Objection,
  OutreachMessage,
  QualificationCriterion,
} from "@/lib/types";
import { useParams } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "icp_fit", label: "ICP Fit" },
  { id: "buyers", label: "Buyers" },
  { id: "research", label: "Research" },
  { id: "outreach", label: "Outreach" },
  { id: "qualification", label: "Qualification" },
  { id: "activity", label: "Agent Trace" },
];

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const [account, setAccount] = React.useState<Account | null | undefined>(undefined);
  const [tab, setTab] = React.useState("overview");
  const [evidence, setEvidence] = React.useState<EvidenceItem[]>([]);
  const [icpFit, setIcpFit] = React.useState<IcpCriterionScore[]>([]);
  const [buyers, setBuyers] = React.useState<Buyer[]>([]);
  const [qualification, setQualification] = React.useState<QualificationCriterion[]>([]);
  const [outreach, setOutreach] = React.useState<OutreachMessage[]>([]);
  const [objections, setObjections] = React.useState<Objection[]>([]);
  const [tasks, setTasks] = React.useState<AgentTask[]>([]);

  const loadAccountData = React.useCallback(async (id: string) => {
    const [a, ev, fit, buys, qual, out, obj, tsk] = await Promise.allSettled([
      api.getAccount(id),
      api.getEvidenceForAccount(id),
      api.getIcpFitForAccount(id),
      api.getBuyersForAccount(id),
      api.getQualificationForAccount(id),
      api.getOutreachForAccount(id),
      api.getObjectionsForAccount(id),
      api.getAgentTasksForAccount(id),
    ]);

    if (a.status === "fulfilled") setAccount(a.value ?? null);
    if (ev.status === "fulfilled") setEvidence(ev.value);
    if (fit.status === "fulfilled") setIcpFit(fit.value);
    if (buys.status === "fulfilled") setBuyers(buys.value);
    if (qual.status === "fulfilled") setQualification(qual.value);
    if (out.status === "fulfilled") setOutreach(out.value);
    if (obj.status === "fulfilled") setObjections(obj.value);
    if (tsk.status === "fulfilled") setTasks(tsk.value);
  }, []);

  React.useEffect(() => {
    const id = params.id;
    loadAccountData(id);
  }, [params.id, loadAccountData]);

  const handleAccountUpdated = React.useCallback(() => {
    loadAccountData(params.id);
  }, [params.id, loadAccountData]);

  if (account === undefined) return null;
  if (account === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-sm text-text-tertiary">Account not found.</p>
        <Link href="/accounts" className="text-xs text-accent-500 hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to Accounts
        </Link>
      </div>
    );
  }

  const pendingDraftCount = outreach.filter((m) => m.status === "pending_approval").length;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <Link href="/accounts" className="hover:text-text-secondary transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Accounts
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">{account.name}</span>
      </div>

      {/* Sticky Account Header — wired to backend */}
      <AccountHeader
        account={account}
        pendingDraftCount={pendingDraftCount}
        onAccountUpdated={handleAccountUpdated}
      />

      {/* 3-column layout: Tabs+Content | Right Rail */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Main content – tabs */}
        <div className="min-w-0 flex-1">
          <Tabs items={TABS} value={tab} onChange={setTab} className="mb-4" />

          {tab === "overview" && (
            <AccountOverviewTab
              account={account}
              evidence={evidence}
              buyers={buyers}
              qualification={qualification}
              outreach={outreach}
            />
          )}

          {tab === "research" && (
            <AccountResearchTab
              accountId={account.id}
              accountName={account.name}
              evidence={evidence}
              onResearchUpdated={handleAccountUpdated}
            />
          )}

          {tab === "buyers" && (
            <AccountBuyersTab
              buyers={buyers}
              accountName={account.name}
              accountId={account.id}
              onBuyersUpdated={handleAccountUpdated}
            />
          )}

          {tab === "qualification" && (
            <AccountQualificationTab criteria={qualification} />
          )}

          {tab === "outreach" && (
            <AccountOutreachTab
              outreach={outreach}
              objections={objections}
              accountId={account.id}
            />
          )}

          {tab === "icp_fit" && (
            <IcpFitTab
              scores={icpFit}
              accountId={account.id}
              accountName={account.name}
              onUpdated={handleAccountUpdated}
            />
          )}

          {tab === "activity" && (
            <Card className="border-border-default">
              <AgentActivityFeed tasks={tasks} />
            </Card>
          )}
        </div>

        {/* Right Rail */}
        <div className="w-full lg:w-[260px] shrink-0">
          <AccountRightRail account={account} onAccountUpdated={handleAccountUpdated} />
        </div>
      </div>
    </div>
  );
}

// ICP Fit Tab with live M04 evaluation trigger
function IcpFitTab({
  scores,
  accountId,
  accountName,
  onUpdated,
}: {
  scores: IcpCriterionScore[];
  accountId: string;
  accountName: string;
  onUpdated?: () => void;
}) {
  const [evaluating, setEvaluating] = React.useState(false);

  const handleEvaluate = async () => {
    setEvaluating(true);
    toast.info("Evaluating ICP fit", {
      description: `Scoring ${accountName} against target ICP criteria (M04)...`,
    });
    try {
      await api.evaluateAccountFit(accountId);
      toast.success("ICP fit evaluated", {
        description: `Successfully scored ${accountName} across ICP dimensions.`,
      });
      onUpdated?.();
    } catch (err: any) {
      console.error("Fit evaluation failed:", err);
      toast.error("Fit evaluation failed", {
        description: err?.message || "Could not evaluate ICP fit. Check backend logs.",
      });
    } finally {
      setEvaluating(false);
    }
  };

  if (scores.length === 0) {
    return (
      <Card className="p-8 text-center text-sm border-border-default space-y-3">
        <p className="text-text-tertiary">ICP fit has not been scored for this account yet.</p>
        <Button size="sm" onClick={handleEvaluate} disabled={evaluating}>
          {evaluating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {evaluating ? "Evaluating Fit…" : "Run ICP Fit Evaluation (M04)"}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          ICP Fit Breakdown ({scores.length} Dimensions)
        </p>
        <Button
          size="xs"
          variant="outline"
          onClick={handleEvaluate}
          disabled={evaluating}
        >
          {evaluating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {evaluating ? "Scoring…" : "Re-evaluate Fit"}
        </Button>
      </div>

      <Card className="divide-y divide-border-subtle border-border-default overflow-hidden">
        {scores.map((c) => (
          <div key={c.criterion} className="flex items-center gap-4 px-4 py-3.5 hover:bg-sunken/20 transition-colors">
            <div className="w-44 shrink-0 text-xs font-medium text-text-primary">{c.criterion}</div>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full bg-accent-500 transition-all"
                style={{ width: `${c.score}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-mono text-xs font-semibold text-text-primary">{c.score}</span>
            <ConfidenceBadge level={c.confidence} />
          </div>
        ))}
      </Card>
    </div>
  );
}
