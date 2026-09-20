"use client";

import { Badge, ConfidenceBadge, HealthBadge, StageBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadialScore } from "@/components/ui/radial-score";
import { Stepper } from "@/components/ui/stepper";
import { Tabs } from "@/components/ui/tabs";
import { AgentActivityFeed } from "@/components/features/agent-activity-feed";
import { EvidenceList } from "@/components/features/evidence-list";
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
import { formatDate, timeAgo } from "@/lib/utils";
import { AlertCircle, ArrowRight, CircleCheck, Circle, HelpCircle, Mail, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "icp_fit", label: "ICP Fit" },
  { id: "research", label: "Research" },
  { id: "buyers", label: "Buyers" },
  { id: "qualification", label: "Qualification" },
  { id: "outreach", label: "Outreach & Engagement" },
  { id: "activity", label: "Activity / Agent Trace" },
  { id: "next_action", label: "Next Best Action" },
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
    return <p className="p-8 text-center text-sm text-text-tertiary">Account not found.</p>;
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      {/* Identity panel */}
      <div className="w-full shrink-0 lg:w-[280px]">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-accent-50 font-mono text-base font-bold text-accent-500">
              {account.logoInitial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{account.name}</p>
              <p className="truncate text-xs text-text-tertiary">{account.domain}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <StageBadge stage={account.stage} />
            <HealthBadge health={account.health} />
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[var(--radius-sm)] bg-sunken p-3">
            <RadialScore value={account.fitScore} size={48} label="fit" />
            <div>
              <ConfidenceBadge level={account.confidence} />
              <p className="mt-1 text-xs text-text-tertiary">{account.icpName}</p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-xs">
            <Row label="Industry" value={account.industry} />
            <Row label="Employees" value={account.employeeRange} />
            <Row label="HQ" value={account.hqLocation} />
            <Row label="Owner" value={account.ownerName ?? "Unassigned"} />
            <Row label="Days in stage" value={`${account.daysInStage}d`} />
            <Row label="Discovered" value={formatDate(account.discoveredAt)} />
            <Row label="Last activity" value={timeAgo(account.lastActivityAt)} />
          </dl>

          <Button className="mt-5 w-full">
            <Sparkles className="h-3.5 w-3.5" /> Run Buyer Identification
          </Button>

          <div className="mt-5 border-t border-border-subtle pt-4">
            <p className="mb-2 text-xs font-semibold text-text-secondary">Funnel progress</p>
            <Stepper currentStage={account.stage} />
          </div>
        </Card>
      </div>

      {/* Tabbed workspace */}
      <div className="min-w-0 flex-1">
        <Tabs items={TABS} value={tab} onChange={setTab} className="mb-4" />

        {tab === "overview" && <OverviewTab account={account} evidence={evidence} buyers={buyers} qualification={qualification} outreach={outreach} />}
        {tab === "icp_fit" && <IcpFitTab scores={icpFit} />}
        {tab === "research" && <EvidenceList items={evidence} />}
        {tab === "buyers" && <BuyersTab buyers={buyers} />}
        {tab === "qualification" && <QualificationTab criteria={qualification} />}
        {tab === "outreach" && <OutreachTab outreach={outreach} objections={objections} />}
        {tab === "activity" && (
          <Card>
            <AgentActivityFeed tasks={tasks} />
          </Card>
        )}
        {tab === "next_action" && <NextActionTab account={account} />}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="font-medium text-text-primary">{value}</dd>
    </div>
  );
}

function OverviewTab({
  account,
  evidence,
  buyers,
  qualification,
  outreach,
}: {
  account: Account;
  evidence: EvidenceItem[];
  buyers: Buyer[];
  qualification: QualificationCriterion[];
  outreach: OutreachMessage[];
}) {
  const moduleChips: { label: string; done: boolean }[] = [
    { label: "Research", done: evidence.length > 0 },
    { label: "Buyers", done: buyers.length > 0 },
    { label: "Qualification", done: qualification.length > 0 },
    { label: "Outreach", done: outreach.length > 0 },
  ];
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="mb-2.5 text-xs font-semibold text-text-secondary">Module coverage for this account</p>
        <div className="flex flex-wrap gap-2">
          {moduleChips.map((m) => (
            <span
              key={m.label}
              className="flex items-center gap-1.5 rounded-full border border-border-default bg-sunken px-2.5 py-1 text-xs text-text-secondary"
            >
              {m.done ? <CircleCheck className="h-3.5 w-3.5 text-positive-500" /> : <Circle className="h-3.5 w-3.5 text-text-tertiary" />}
              {m.label}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-2 text-xs font-semibold text-text-secondary">Why this account is a fit</p>
        <ul className="space-y-1.5">
          {account.discoveryReasons.map((r) => (
            <li key={r} className="text-sm text-text-primary">· {r}</li>
          ))}
        </ul>
      </Card>

      {evidence.length > 0 && (
        <Card className="p-4">
          <p className="mb-2 text-xs font-semibold text-text-secondary">Latest research highlight</p>
          <p className="text-sm text-text-primary">{evidence[0].claim}</p>
          <p className="mt-1 text-xs text-text-tertiary">{evidence[0].sourceName} · {timeAgo(evidence[0].collectedAt)}</p>
        </Card>
      )}
    </div>
  );
}

function IcpFitTab({ scores }: { scores: IcpCriterionScore[] }) {
  if (scores.length === 0) return <EmptyNote text="ICP fit has not been scored for this account yet." />;
  return (
    <Card className="divide-y divide-border-subtle">
      {scores.map((c) => (
        <div key={c.criterion} className="flex items-center gap-4 p-4">
          <div className="w-48 shrink-0 text-sm text-text-primary">{c.criterion}</div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-sunken">
            <div
              className="h-full rounded-full bg-accent-500"
              style={{ width: `${c.score}%` }}
            />
          </div>
          <span className="w-9 shrink-0 text-right font-mono text-sm text-text-primary">{c.score}</span>
          <ConfidenceBadge level={c.confidence} />
        </div>
      ))}
    </Card>
  );
}

function BuyersTab({ buyers }: { buyers: Buyer[] }) {
  if (buyers.length === 0) return <EmptyNote text="No buyers identified yet. Run Buyer Identification to populate this list." />;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {buyers.map((b) => (
        <Card key={b.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">{b.name}</p>
              <p className="text-xs text-text-tertiary">{b.title} · {b.seniority}</p>
            </div>
            <span className="font-mono text-sm text-text-secondary">{b.relevanceScore}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge signal="neutral">{b.engagementState.replace("_", " ")}</Badge>
            {b.email && (
              <a href={`mailto:${b.email}`} className="flex items-center gap-1 text-xs font-medium text-accent-500 hover:underline">
                <Mail className="h-3 w-3" /> {b.email}
              </a>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

const QUAL_ICON = { met: CircleCheck, unmet: AlertCircle, unclear: HelpCircle } as const;
const QUAL_COLOR = { met: "text-positive-500", unmet: "text-risk-500", unclear: "text-caution-500" } as const;

function QualificationTab({ criteria }: { criteria: QualificationCriterion[] }) {
  if (criteria.length === 0) return <EmptyNote text="Qualification has not run for this account yet." />;
  return (
    <Card className="divide-y divide-border-subtle">
      {criteria.map((c) => {
        const Icon = QUAL_ICON[c.status];
        return (
          <div key={c.id} className="p-4">
            <div className="flex items-start gap-2.5">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${QUAL_COLOR[c.status]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{c.label}</p>
                <p className="mt-1 text-xs text-text-secondary">{c.agentRationale}</p>
              </div>
              {c.status === "unclear" && (
                <div className="flex shrink-0 gap-1.5">
                  <Button size="sm" variant="secondary">Met</Button>
                  <Button size="sm" variant="secondary">Unmet</Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function OutreachTab({ outreach, objections }: { outreach: OutreachMessage[]; objections: Objection[] }) {
  if (outreach.length === 0 && objections.length === 0) {
    return <EmptyNote text="No outreach has been sent for this account yet." />;
  }
  return (
    <div className="space-y-4">
      {outreach.map((m) => (
        <Card key={m.id} className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">{m.subject ?? m.channel}</p>
            <Badge signal={m.status === "sent" ? "positive" : m.status === "pending_approval" ? "caution" : "neutral"}>
              {m.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-text-secondary">{m.body}</p>
          {m.sentAt && <p className="mt-2 text-xs text-text-tertiary">Sent {timeAgo(m.sentAt)}</p>}
        </Card>
      ))}
      {objections.map((o) => (
        <Card key={o.id} className="border-caution-500/40 p-4">
          <p className="text-xs font-semibold text-caution-600">Objection raised · {o.category}</p>
          <p className="mt-1.5 text-sm text-text-primary">&ldquo;{o.text}&rdquo;</p>
          <p className="mt-1 text-xs text-text-tertiary">— {o.raisedBy}, {timeAgo(o.raisedAt)}</p>
          <div className="mt-3 rounded-[var(--radius-sm)] bg-sunken p-3">
            <p className="text-xs font-semibold text-text-secondary">Agent-drafted response</p>
            <p className="mt-1 text-sm text-text-primary">{o.agentResponse}</p>
          </div>
          {o.status === "pending_approval" && (
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="success">Approve response</Button>
              <Button size="sm" variant="secondary">Edit</Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function NextActionTab({ account }: { account: Account }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs font-semibold text-accent-500">
        <Sparkles className="h-3.5 w-3.5" /> Recommended next action
      </div>
      <p className="mt-2 text-base font-medium text-text-primary">
        {account.health === "stalled"
          ? `Send a re-engagement message referencing recent activity at ${account.name}.`
          : account.stage === "engaged"
          ? `Schedule a follow-up call with the primary buyer at ${account.name}.`
          : `Advance ${account.name} to the next funnel stage — evidence supports it.`}
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        Confidence is based on {account.daysInStage} days of inactivity at this stage combined with prior engagement signals.
      </p>
      <div className="mt-4 flex gap-2">
        <Button>
          Accept <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button variant="secondary">Modify</Button>
        <Button variant="ghost">Dismiss</Button>
      </div>
    </Card>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <Card className="p-8 text-center text-sm text-text-tertiary">{text}</Card>
  );
}
