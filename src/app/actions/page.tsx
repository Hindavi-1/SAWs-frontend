import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ApprovalCard } from "@/components/features/approval-card";
import { getApprovalQueue } from "@/lib/api";

export default async function ActionsPage() {
  const approvals = await getApprovalQueue();
  const urgent = approvals.filter((a) => a.urgency === "high");
  const normal = approvals.filter((a) => a.urgency === "normal");

  return (
    <div>
      <PageHeader
        title="Actions"
        description="Every decision waiting on you, across all accounts and modules — approve, reject, or open the account for more context."
      />

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Urgent</CardTitle>
              <CardDescription>{urgent.length} items — compliance holds and time-sensitive approvals</CardDescription>
            </div>
          </CardHeader>
          <div className="divide-y divide-border-subtle">
            {urgent.map((item) => (
              <ApprovalCard key={item.id} item={item} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Standard</CardTitle>
              <CardDescription>{normal.length} items</CardDescription>
            </div>
          </CardHeader>
          <div className="divide-y divide-border-subtle">
            {normal.map((item) => (
              <ApprovalCard key={item.id} item={item} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
