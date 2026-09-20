import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAccounts, getIcps } from "@/lib/api";

export default async function IntelligencePage() {
  const [accounts, icps] = await Promise.all([getAccounts(), getIcps()]);

  const byIcp = icps.map((icp) => {
    const inIcp = accounts.filter((a) => a.icpId === icp.id);
    const avgFit = inIcp.length ? Math.round(inIcp.reduce((s, a) => s + a.fitScore, 0) / inIcp.length) : 0;
    const engaged = inIcp.filter((a) => ["engaged", "nurture", "next_action"].includes(a.stage)).length;
    return { icp, count: inIcp.length, avgFit, engaged };
  });

  const maxCount = Math.max(...byIcp.map((b) => b.count), 1);

  return (
    <div>
      <PageHeader
        title="Sales Intelligence"
        description="Aggregated performance across accounts, segments, and ICPs — the strategic view above the day-to-day funnel."
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Performance by ICP segment</CardTitle>
            <CardDescription>Volume, average fit, and engagement rate per segment</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {byIcp.map(({ icp, count, avgFit, engaged }) => (
            <div key={icp.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-text-primary">{icp.name}</span>
                <span className="font-mono text-text-secondary">{count} accounts · avg fit {avgFit} · {engaged} engaged</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sunken">
                <div className="h-full rounded-full bg-accent-500" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top converting discovery signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { signal: "Recent funding round announced", rate: 82 },
              { signal: "Active compliance / audit hiring", rate: 74 },
              { signal: "New VP Sales or CRO hired", rate: 69 },
              { signal: "Legacy vendor lock-in detected", rate: 58 },
            ].map((s) => (
              <div key={s.signal} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{s.signal}</span>
                <span className="font-mono font-medium text-text-primary">{s.rate}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage conversion rates (30d)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { pair: "Discovered → Verified", rate: 70 },
              { pair: "Verified → Qualified", rate: 53 },
              { pair: "Qualified → Outreach Ready", rate: 61 },
              { pair: "Outreach Ready → Engaged", rate: 44 },
            ].map((s) => (
              <div key={s.pair} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{s.pair}</span>
                <span className="font-mono font-medium text-text-primary">{s.rate}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
