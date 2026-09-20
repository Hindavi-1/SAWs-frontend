import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, HealthBadge } from "@/components/ui/badge";
import { getAccounts } from "@/lib/api";
import { objectionsByAccount, outreachByAccount } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";
import { Mail, MessageSquareWarning } from "lucide-react";
import Link from "next/link";

export default async function EngagementPage() {
  const accounts = await getAccounts();
  const engaged = accounts.filter((a) => ["engaged", "outreach_ready", "nurture", "next_action"].includes(a.stage));

  const outreachEntries = Object.entries(outreachByAccount);
  const objectionEntries = Object.entries(objectionsByAccount);

  return (
    <div>
      <PageHeader
        title="Engagement"
        description="Active conversations, sent outreach, and objections across every account currently in market."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Outreach activity</CardTitle>
              <CardDescription>Drafts, sends, and replies</CardDescription>
            </div>
          </CardHeader>
          <div className="divide-y divide-border-subtle">
            {outreachEntries.map(([accountId, messages]) =>
              messages.map((m) => {
                const account = accounts.find((a) => a.id === accountId);
                return (
                  <div key={m.id} className="flex items-start gap-3 px-5 py-3.5">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/accounts/${accountId}`} className="text-sm font-medium text-text-primary hover:text-accent-500">
                          {account?.name}
                        </Link>
                        <Badge signal={m.status === "sent" ? "positive" : "caution"}>{m.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-text-secondary">{m.subject}</p>
                    </div>
                  </div>
                );
              })
            )}

            {objectionEntries.map(([accountId, objections]) =>
              objections.map((o) => {
                const account = accounts.find((a) => a.id === accountId);
                return (
                  <div key={o.id} className="flex items-start gap-3 px-5 py-3.5">
                    <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0 text-caution-500" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/accounts/${accountId}`} className="text-sm font-medium text-text-primary hover:text-accent-500">
                          {account?.name}
                        </Link>
                        <Badge signal="caution">{o.category}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">&ldquo;{o.text}&rdquo; — {timeAgo(o.raisedAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>In engagement or nurture</CardTitle>
              <CardDescription>{engaged.length} accounts</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {engaged.map((a) => (
              <Link
                key={a.id}
                href={`/accounts/${a.id}`}
                className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border-subtle p-2.5 hover:bg-sunken"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{a.name}</p>
                  <p className="text-xs text-text-tertiary">{a.daysInStage}d in stage</p>
                </div>
                <HealthBadge health={a.health} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
