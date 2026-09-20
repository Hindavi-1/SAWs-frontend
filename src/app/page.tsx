import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FunnelBar } from "@/components/features/funnel-bar";
import { MetricCard } from "@/components/features/metric-card";
import { AgentActivityFeed } from "@/components/features/agent-activity-feed";
import { ApprovalCard } from "@/components/features/approval-card";
import { RadialScore } from "@/components/ui/radial-score";
import { StageBadge } from "@/components/ui/badge";
import { getAccounts, getAgentTasks, getApprovalQueue, getDashboardMetrics } from "@/lib/api";
import { Building2, CheckCircle2, Clock, Sparkles, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [metrics, approvals, tasks, accounts] = await Promise.all([
    getDashboardMetrics(),
    getApprovalQueue(),
    getAgentTasks(),
    getAccounts(),
  ]);

  const watchlist = accounts.filter((a) => a.tags.includes("hot") || a.tags.includes("warm-signal") || a.tags.includes("engaged"));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Command Center"
        title="Dashboard"
        description="Everything moving through the funnel, what needs you, and what the agents are doing right now."
      />

      {/* Funnel health */}
      <Card className="overflow-hidden animate-fade-in-up stagger-1">
        <CardHeader className="relative bg-gradient-to-r from-transparent via-accent-50/40 to-transparent dark:via-accent-50/10 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-gradient-to-br from-accent-500/15 via-violet-500/10 to-transparent blur-3xl" />
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-accent-500" />
              Funnel health
            </CardTitle>
            <CardDescription>Accounts by stage — click a stage to filter the account list</CardDescription>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-positive-500/20 bg-gradient-to-r from-positive-50 to-emerald-50 px-2.5 py-1 text-[11px] font-bold text-positive-600 sm:flex dark:from-positive-500/15 dark:to-emerald-500/10 dark:text-positive-500">
            <span className="relative h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive-500" />
            </span>
            Live
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <FunnelBar data={metrics.funnel} />
        </CardContent>
      </Card>

      {/* Attention + Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 animate-fade-in-up stagger-2">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="relative bg-gradient-to-r from-transparent via-risk-50/50 to-transparent dark:via-risk-50/10 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-10 h-56 w-56 rounded-full bg-gradient-to-br from-risk-500/14 via-rose-500/8 to-transparent blur-3xl" />
            <div>
              <CardTitle>Needs your attention</CardTitle>
              <CardDescription>{approvals.length} items pending a decision</CardDescription>
            </div>
            <Link href="/actions" className="group inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-raised px-2.5 py-1.5 text-xs font-bold text-accent-500 transition-all hover:border-accent-500/30 hover:bg-accent-50 hover:shadow-[var(--shadow-glow-accent)] dark:hover:bg-accent-500/20">
              View all
              <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </CardHeader>
          <div className="divide-y divide-border-subtle">
            {approvals.slice(0, 4).map((item, idx) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 60 + 60}ms` }}>
                <ApprovalCard item={item} />
              </div>
            ))}
          </div>
        </Card>

        <Card id="agent-activity" className="lg:col-span-3 overflow-hidden">
          <CardHeader className="relative bg-gradient-to-r from-transparent via-progress-50/50 to-transparent dark:via-progress-50/10 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-10 h-56 w-56 rounded-full bg-gradient-to-br from-progress-500/14 via-cyan-500/8 to-transparent blur-3xl" />
            <div>
              <CardTitle>Agent activity</CardTitle>
              <CardDescription>Live and recent runs across all modules</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-progress-500/25 bg-gradient-to-r from-progress-50 to-cyan-400/5 px-2.5 py-1 text-[11px] font-bold text-progress-600 dark:from-progress-500/20 dark:via-progress-500/10 dark:to-progress-500/20 dark:text-progress-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-progress-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-progress-500 animate-pulse-glow" />
              </span>
              Running
            </div>
          </CardHeader>
          <div className="max-h-[420px] overflow-y-auto">
            <AgentActivityFeed tasks={tasks} />
          </div>
        </Card>
      </div>

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <Card className="overflow-hidden animate-fade-in-up stagger-3">
          <CardHeader className="relative bg-gradient-to-r from-transparent via-caution-50/40 to-transparent dark:via-caution-50/10 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 right-1/4 h-56 w-56 rounded-full bg-gradient-to-br from-caution-500/14 via-amber-500/8 to-transparent blur-3xl" />
            <div>
              <CardTitle>Watchlist</CardTitle>
              <CardDescription>Priority accounts to keep an eye on</CardDescription>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border-subtle bg-raised px-2 py-0.5 text-[10px] font-bold text-text-tertiary">
              <span className="h-1.5 w-1.5 rounded-full bg-caution-500" />
              {watchlist.length} accounts
            </div>
          </CardHeader>
          <div className="flex gap-3 overflow-x-auto px-5 py-4 scrollbar-thin">
            {watchlist.map((a, i) => (
              <Link
                key={a.id}
                href={`/accounts/${a.id}`}
                className="group flex w-64 shrink-0 items-center gap-3 rounded-xl border border-border-subtle bg-gradient-to-br from-raised to-sunken/50 p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-accent-500/40 hover:shadow-[var(--shadow-md),var(--shadow-glow-accent)] animate-fade-in-up"
                style={{ animationDelay: `${240 + i * 55}ms` }}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute -inset-1 rounded-full bg-accent-500/15 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <RadialScore value={a.fitScore} size={44} strokeWidth={4} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-500">{a.name}</p>
                  <div className="mt-1.5"><StageBadge stage={a.stage} /></div>
                </div>
                <svg className="h-4 w-4 shrink-0 text-text-tertiary transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Metrics strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 animate-fade-in-up stagger-4">
        <MetricCard label="Total accounts" value={metrics.totalAccounts.toLocaleString()} icon={Building2} tone="indigo" accentPct={Math.min(92, (metrics.totalAccounts / 5000) * 100)} />
        <MetricCard label="Discovery runs active" value={metrics.activeDiscoveryRuns} icon={Sparkles} tone="violet" accentPct={84} />
        <MetricCard label="Qualified this week" value={metrics.qualifiedThisWeek} icon={TrendingUp} delta={{ value: "18", positive: true }} tone="emerald" accentPct={72} />
        <MetricCard label="Avg. time in stage" value={metrics.avgTimeInStageDays} suffix="days" icon={Clock} tone="cyan" accentPct={60} />
        <MetricCard label="Agent success rate" value={`${metrics.agentSuccessRate}%`} icon={CheckCircle2} tone="amber" accentPct={metrics.agentSuccessRate} />
      </div>
    </div>
  );
}
