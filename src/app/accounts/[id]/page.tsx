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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "research", label: "Research" },
  { id: "buyers", label: "Buyers" },
  { id: "qualification", label: "Qualification" },
  { id: "outreach", label: "Outreach" },
  { id: "icp_fit", label: "ICP Fit" },
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

  React.useEffect(() => {
    const id = params.id;
    api.getAccount(id).then((a) => setAccount(a ?? null));
    api.getEvidenceForAccount(id).then(setEvidence);
    api.getIcpFitForAccount(id).then(setIcpFit);
    api.getBuyersForAccount(id).then(setBuyers);
    api.getQualificationForAccount(id).then(setQualification);
    api.getOutreachForAccount(id).then(setOutreach);
    api.getObjectionsForAccount(id).then(setObjections);
    api.getAgentTasksForAccount(id).then(setTasks);
  }, [params.id]);

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

      {/* Sticky Account Header */}
      <AccountHeader account={account} pendingDraftCount={pendingDraftCount} />

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

          {tab === "research" && <EvidenceList items={evidence} />}

          {tab === "buyers" && (
            <AccountBuyersTab buyers={buyers} accountName={account.name} />
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

          {tab === "icp_fit" && <IcpFitTab scores={icpFit} />}

          {tab === "activity" && (
            <Card className="border-border-default">
              <AgentActivityFeed tasks={tasks} />
            </Card>
          )}
        </div>

        {/* Right Rail */}
        <div className="w-full lg:w-[260px] shrink-0">
          <AccountRightRail account={account} />
        </div>
      </div>
    </div>
  );
}

// ICP Fit stays inline (small enough)
function IcpFitTab({ scores }: { scores: IcpCriterionScore[] }) {
  if (scores.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-text-tertiary border-border-default">
        ICP fit has not been scored for this account yet.
      </Card>
    );
  }
  return (
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
  );
}
