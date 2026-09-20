import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getComplianceFlags } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function CompliancePage() {
  const flags = await getComplianceFlags();
  const blocking = flags.filter((f) => f.severity === "blocking" && f.status === "open");
  const warnings = flags.filter((f) => f.severity === "warning" && f.status === "open");

  return (
    <div>
      <PageHeader
        title="Compliance & Quality"
        description="Consent, data-freshness, and quality checks that gate outreach — applied automatically across every stage, not tied to a single funnel step."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-text-tertiary">Open blocking flags</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-risk-600">{blocking.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-text-tertiary">Open warnings</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-caution-600">{warnings.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-text-tertiary">Checks run this week</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-text-primary">1,204</p>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="divide-y divide-border-subtle">
          {flags.map((f) => (
            <div key={f.id} className="flex items-start gap-3 px-5 py-4">
              <ShieldAlert className={`mt-0.5 h-4 w-4 shrink-0 ${f.severity === "blocking" ? "text-risk-500" : "text-caution-500"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{f.rule}</p>
                  <Badge signal={f.severity === "blocking" ? "risk" : "caution"}>{f.severity}</Badge>
                </div>
                <p className="mt-1 text-xs text-text-secondary">{f.detail}</p>
                <p className="mt-1 text-[11px] text-text-tertiary">
                  <Link href={`/accounts/${f.accountId}`} className="font-medium hover:text-accent-500">{f.accountName}</Link> · {timeAgo(f.createdAt)}
                </p>
              </div>
              <Button size="sm" variant="secondary" className="shrink-0">Resolve</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
