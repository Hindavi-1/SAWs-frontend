import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FunnelBar } from "@/components/features/funnel-bar";
import { MetricCard } from "@/components/features/metric-card";
import { AgentActivityFeed } from "@/components/features/agent-activity-feed";
import { ApprovalCard } from "@/components/features/approval-card";
import { RadialScore } from "@/components/ui/radial-score";
import { StageBadge, HealthBadge } from "@/components/ui/badge";
import { getAccounts, getAgentTasks, getApprovalQueue, getDashboardMetrics } from "@/lib/api";
import {
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Send,
  ArrowRight,
  AlertCircle,
  MailCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [metrics, approvals, tasks, accounts] = await Promise.all([
    getDashboardMetrics(),
    getApprovalQueue(),
    getAgentTasks(),
    getAccounts(),
  ]);

  const pendingDrafts = approvals.filter((a) => a.kind === "outreach_email");
  const atRiskAccounts = accounts.filter((a) => a.health === "stalled" || a.daysInStage >= 10).slice(0, 4);
  const hotAccounts = accounts.filter((a) => a.tags.includes("hot") || a.tags.includes("warm-signal")).slice(0, 6);
  const runningTasks = tasks.filter((t) => t.status === "running").length;

  return (
    <div className="space-y-6">

      {/* ── TODAY STRIP ─────────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text-primary">Good morning, Rep</h1>
            <p className="text-xs text-text-tertiary mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              &nbsp;·&nbsp;Agents have been working overnight
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-agent-core bg-agent-surface border border-agent-border rounded-full px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-agent-core opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-agent-core" />
            </span>
            {runningTasks} agents active
          </div>
        </div>

        {/* Today callout cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Drafts to review */}
          <Link href="/outreach-review" className="group">
            <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-agent-border bg-agent-surface/40 p-4 hover:bg-agent-surface/60 hover:border-agent-core/40 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-[var(--radius-sm)] bg-agent-surface border border-agent-border">
                  <Send className="h-4 w-4 text-agent-core" />
                </div>
                <span className="font-mono text-2xl font-bold text-text-primary">{pendingDrafts.length}</span>
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-agent-core transition-colors">Outreach drafts to review</p>
              <p className="text-xs text-text-tertiary mt-0.5">Agent-authored, waiting your approval</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-agent-core">
                Review in workspace <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Accounts needing attention */}
          <Link href="/accounts?stage=stalled" className="group">
            <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-caution-500/25 bg-caution-50/30 dark:bg-caution-950/10 p-4 hover:border-caution-500/50 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-[var(--radius-sm)] bg-caution-50 dark:bg-caution-950/30 border border-caution-200/50 dark:border-caution-800/30">
                  <AlertCircle className="h-4 w-4 text-caution-500" />
                </div>
                <span className="font-mono text-2xl font-bold text-text-primary">{atRiskAccounts.length}</span>
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-caution-600 dark:group-hover:text-caution-400 transition-colors">Accounts need attention</p>
              <p className="text-xs text-text-tertiary mt-0.5">At-risk or stalled 10+ days in stage</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-caution-600 dark:text-caution-400">
                View accounts <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Agent success */}
          <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-positive-500/25 bg-positive-50/30 dark:bg-positive-950/10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-[var(--radius-sm)] bg-positive-50 dark:bg-positive-950/30 border border-positive-200/50 dark:border-positive-800/30">
                <MailCheck className="h-4 w-4 text-positive-500" />
              </div>
              <span className="font-mono text-2xl font-bold text-text-primary">{metrics.agentSuccessRate}%</span>
            </div>
            <p className="text-sm font-semibold text-text-primary">Agent success rate</p>
            <p className="text-xs text-text-tertiary mt-0.5">{metrics.qualifiedThisWeek} accounts qualified this week</p>
            <div className="mt-3 h-1 w-full bg-sunken rounded-full overflow-hidden">
              <div
                className="h-full bg-positive-500 rounded-full"
                style={{ width: `${metrics.agentSuccessRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total accounts" value={metrics.totalAccounts.toLocaleString()} icon={Building2} tone="indigo" accentPct={Math.min(92, (metrics.totalAccounts / 5000) * 100)} />
        <MetricCard label="Active discovery" value={metrics.activeDiscoveryRuns} icon={Sparkles} tone="violet" accentPct={84} />
        <MetricCard label="Qualified / week" value={metrics.qualifiedThisWeek} icon={TrendingUp} delta={{ value: "18", positive: true }} tone="emerald" accentPct={72} />
        <MetricCard label="Avg. days in stage" value={metrics.avgTimeInStageDays} suffix="days" icon={Clock} tone="cyan" accentPct={60} />
        <MetricCard label="Agent success" value={`${metrics.agentSuccessRate}%`} icon={CheckCircle2} tone="amber" accentPct={metrics.agentSuccessRate} />
      </div>

      {/* ── FUNNEL ──────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden border-border-default">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Zap className="h-4 w-4 text-accent-500" />
              Funnel Velocity
            </CardTitle>
            <CardDescription>Accounts by stage — click a stage to filter</CardDescription>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-positive-500/20 bg-positive-50/60 dark:bg-positive-950/20 px-2.5 py-1 text-[11px] font-semibold text-positive-600 dark:text-positive-400">
            <span className="relative h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive-500" />
            </span>
            Live
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <FunnelBar data={metrics.funnel} />
        </CardContent>
      </Card>

      {/* ── ATTENTION + ACTIVITY ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Left: approvals */}
        <Card className="lg:col-span-2 overflow-hidden border-border-default">
          <CardHeader>
            <div>
              <CardTitle className="text-sm font-semibold">Needs your review</CardTitle>
              <CardDescription>{approvals.length} decisions waiting</CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <Link
                href="/outreach-review"
                className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-agent-border bg-agent-surface px-2 py-1 text-xs font-semibold text-agent-core hover:bg-agent-surface/80 transition-colors"
              >
                <Send className="h-3 w-3" />
                Review Outreach
              </Link>
              <Link
                href="/actions"
                className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-border-default bg-raised px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-sunken hover:text-text-primary transition-colors"
              >
                All Actions
              </Link>
            </div>
          </CardHeader>
          <div className="divide-y divide-border-subtle">
            {approvals.slice(0, 4).map((item) => (
              <ApprovalCard key={item.id} item={item} />
            ))}
          </div>
        </Card>

        {/* Right: agent activity feed */}
        <Card id="agent-activity" className="lg:col-span-3 overflow-hidden border-border-default">
          <CardHeader>
            <div>
              <CardTitle className="text-sm font-semibold">Agent Activity</CardTitle>
              <CardDescription>Live and recent module runs</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-agent-border bg-agent-surface px-2.5 py-1 text-[11px] font-semibold text-agent-core">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-agent-core opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-agent-core" />
              </span>
              Running
            </div>
          </CardHeader>
          <div className="max-h-[420px] overflow-y-auto">
            <AgentActivityFeed tasks={tasks} />
          </div>
        </Card>
      </div>

      {/* ── WATCHLIST ────────────────────────────────────────────────────── */}
      {hotAccounts.length > 0 && (
        <Card className="overflow-hidden border-border-default">
          <CardHeader>
            <div>
              <CardTitle className="text-sm font-semibold">Hot Accounts</CardTitle>
              <CardDescription>Active buying signals detected</CardDescription>
            </div>
            <Link
              href="/accounts"
              className="text-xs text-text-tertiary hover:text-text-secondary font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="flex gap-3 overflow-x-auto px-5 pb-5 pt-1">
            {hotAccounts.map((a) => (
              <Link
                key={a.id}
                href={`/accounts/${a.id}`}
                className="group flex w-56 shrink-0 items-center gap-3 rounded-[var(--radius-md)] border border-border-subtle bg-raised p-3 hover:border-border-strong hover:bg-sunken/40 transition-colors"
              >
                <div className="shrink-0">
                  <RadialScore value={a.fitScore} size={40} strokeWidth={3.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-text-primary group-hover:text-accent-500 transition-colors">{a.name}</p>
                  <p className="text-[11px] text-text-tertiary truncate mt-0.5">{a.industry}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <StageBadge stage={a.stage} />
                    <HealthBadge health={a.health} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
