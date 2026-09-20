import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOutcomeRecords } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";

export default async function IcpOutcomesPage() {
  const outcomes = await getOutcomeRecords();
  const won = outcomes.filter((o) => o.outcome === "won");
  const lost = outcomes.filter((o) => o.outcome === "lost");

  return (
    <div>
      <PageHeader
        title="Customer Outcomes & ICP Optimization"
        description="How closed deals map back to your ICP criteria — where the system learns and suggests refinements."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-text-tertiary">Win rate (90d)</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-positive-600">{Math.round((won.length / outcomes.length) * 100)}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-text-tertiary">Deals won</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-text-primary">{won.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-text-tertiary">Deals lost</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-text-primary">{lost.length}</p>
        </Card>
      </div>

      <Card className="mt-5 border-accent-300/50 bg-accent-50/40">
        <CardContent className="flex gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Suggested ICP refinement</p>
            <p className="mt-1 text-sm text-text-secondary">
              Deals matching &ldquo;Funding: Series B+&rdquo; and &ldquo;Signal: legacy payment stack&rdquo; closed at a
              markedly higher rate than deals missing either criterion. Consider raising the weight of these two
              criteria in <span className="font-medium text-text-primary">Mid-market fintech, US, Series B+</span>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <div>
            <CardTitle>Recent outcomes</CardTitle>
            <CardDescription>Matched vs. missed ICP criteria for each closed deal</CardDescription>
          </div>
        </CardHeader>
        <div className="divide-y divide-border-subtle">
          {outcomes.map((o) => (
            <div key={o.id} className="flex items-start gap-3 px-5 py-4">
              {o.outcome === "won" ? (
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-positive-500" />
              ) : (
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-risk-500" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{o.accountName}</p>
                  <Badge signal={o.outcome === "won" ? "positive" : "risk"}>{o.outcome}</Badge>
                  <span className="text-xs text-text-tertiary">{formatDate(o.closedAt)}</span>
                  {o.dealValue && <span className="font-mono text-xs text-text-tertiary">${o.dealValue.toLocaleString()}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {o.icpCriteriaMatched.map((c) => (
                    <span key={c} className="rounded-full bg-positive-50 px-2 py-0.5 text-[11px] text-positive-600">✓ {c}</span>
                  ))}
                  {o.icpCriteriaMissed.map((c) => (
                    <span key={c} className="rounded-full bg-risk-50 px-2 py-0.5 text-[11px] text-risk-600">✕ {c}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
