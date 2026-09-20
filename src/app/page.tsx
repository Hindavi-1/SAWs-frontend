import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FunnelBar } from "@/components/features/funnel-bar";
import { MetricCard } from "@/components/features/metric-card";
import { AgentActivityFeed } from "@/components/features/agent-activity-feed";
import { ApprovalCard } from "@/components/features/approval-card";
import { RadialScore } from "@/components/ui/radial-score";
import { StageBadge } from "@/components/ui/badge";
import { getAccounts, getAgentTasks, getApprovalQueue, getDashboardMetrics } from "@/lib/api";
import { Building2, CheckCircle2, Clock, Sparkles, TrendingUp } from "lucide-react";
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
    <div>
      <PageHeader
        title="Dashboard"
        description="Everything moving through the funnel, what needs you, and what the agents are doing right now."
      />

      {/* Funnel health */}
      <Card className="mb-6 overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-md)]">
        <CardHeader className="bg-gradient-to-r from-transparent via-accent-50/40 to-transparent dark:via-accent-50/10">
          <div>
            <CardTitle className="text-[15px]">Funnel health</CardTitle>
            <CardDescription>Accounts by stage — click a stage to filter the account list</CardDescription>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-border-subtle bg-raised px-2.5 py-1 text-[11px] font-medium text-text-secondary sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-positive-500 animate-pulse" />
            Live
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <FunnelBar data={metrics.funnel} />
        </CardContent>
      </Card>

      {/* Metrics strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total accounts" value={metrics.totalAccounts.toLocaleString()} icon={Building2} tone="indigo" />
        <MetricCard label="Discovery runs active" value={metrics.activeDiscoveryRuns} icon={Sparkles} tone="violet" />
        <MetricCard label="Qualified this week" value={metrics.qualifiedThisWeek} icon={TrendingUp} delta={{ value: "18", positive: true }} tone="emerald" />
        <MetricCard label="Avg. time in stage" value={metrics.avgTimeInStageDays} suffix="days" icon={Clock} tone="cyan" />
        <MetricCard label="Agent success rate" value={`${metrics.agentSuccessRate}%`} icon={CheckCircle2} tone="amber" />
      </div>

      {/* Attention + Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-2 overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-md)]">
          <CardHeader className="bg-gradient-to-r from-transparent via-risk-50/50 to-transparent dark:via-risk-50/10">
            <div>
              <CardTitle className="text-[15px]">Needs your attention</CardTitle>
              <CardDescription>{approvals.length} items pending a decision</CardDescription>
            </div>
            <Link href="/actions" className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-raised px-2.5 py-1.5 text-xs font-semibold text-accent-500 transition-all hover:border-accent-500/30 hover:bg-accent-50 dark:hover:bg-accent-50/20">
              View all
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </CardHeader>
          <div className="divide-y divide-border-subtle">
            {approvals.slice(0, 4).map((item) => (
              <ApprovalCard key={item.id} item={item} />
            ))}
          </div>
        </Card>

        <Card id="agent-activity" className="lg:col-span-3 overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-md)]">
          <CardHeader className="bg-gradient-to-r from-transparent via-progress-50/50 to-transparent dark:via-progress-50/10">
            <div>
              <CardTitle className="text-[15px]">Agent activity</CardTitle>
              <CardDescription>Live and recent runs across all modules</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-progress-500/20 bg-progress-50 px-2.5 py-1 text-[11px] font-semibold text-progress-500 dark:bg-progress-50/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-progress-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-progress-500" />
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
        <Card className="mt-6 overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-md)]">
          <CardHeader className="bg-gradient-to-r from-transparent via-caution-50/40 to-transparent dark:via-caution-50/10">
            <div>
              <CardTitle className="text-[15px]">Watchlist</CardTitle>
              <CardDescription>Priority accounts to keep an eye on</CardDescription>
            </div>
          </CardHeader>
          <div className="flex gap-3 overflow-x-auto px-5 py-4 scrollbar-thin">
            {watchlist.map((a, i) => (
              <Link
                key={a.id}
                href={`/accounts/${a.id}`}
                className="group flex w-64 shrink-0 items-center gap-3 rounded-xl border border-border-subtle bg-gradient-to-br from-raised to-sunken/50 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-[var(--shadow-md)]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="relative">
                  <RadialScore value={a.fitScore} size={44} strokeWidth={4} />
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
    </div>
  );
}
