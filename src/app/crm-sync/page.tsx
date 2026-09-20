import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCrmSyncStatus } from "@/lib/api";
import { formatNumber, timeAgo } from "@/lib/utils";
import { CheckCircle2, RefreshCw } from "lucide-react";

export default async function CrmSyncPage() {
  const status = await getCrmSyncStatus();

  return (
    <div>
      <PageHeader
        title="CRM Integration"
        description="Bi-directional sync status with your CRM. This is not a funnel stage — it runs continuously alongside every stage."
        actions={<Button size="sm" variant="secondary"><RefreshCw className="h-3.5 w-3.5" /> Sync now</Button>}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-sunken font-mono text-xs font-bold text-text-secondary">
              SF
            </div>
            <div>
              <CardTitle>{status.provider}</CardTitle>
              <CardDescription>Last synced {timeAgo(status.lastSyncAt)}</CardDescription>
            </div>
          </div>
          <Badge signal={status.connected ? "positive" : "risk"} dot>
            {status.connected ? "Connected" : "Disconnected"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Records synced" value={formatNumber(status.recordsSynced)} />
            <Stat label="Sync errors" value={status.errors} tone={status.errors > 0 ? "risk" : "positive"} />
            <Stat label="Field mappings" value="24 active" />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <div>
            <CardTitle>Recent sync events</CardTitle>
          </div>
        </CardHeader>
        <div className="divide-y divide-border-subtle">
          {[
            { text: "42 account records updated from Salesforce", time: "6 minutes ago", ok: true },
            { text: "Field mapping conflict on \"Industry\" for 3 records", time: "2 hours ago", ok: false },
            { text: "18 qualification verdicts pushed to Salesforce", time: "8 hours ago", ok: true },
          ].map((e) => (
            <div key={e.text} className="flex items-center gap-3 px-5 py-3.5">
              <CheckCircle2 className={`h-4 w-4 shrink-0 ${e.ok ? "text-positive-500" : "text-risk-500"}`} />
              <p className="flex-1 text-sm text-text-primary">{e.text}</p>
              <p className="text-xs text-text-tertiary">{e.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "positive" | "risk" }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-sunken p-3 text-center">
      <p className={`font-mono text-xl font-semibold ${tone === "risk" ? "text-risk-600" : tone === "positive" ? "text-positive-600" : "text-text-primary"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-text-tertiary">{label}</p>
    </div>
  );
}
