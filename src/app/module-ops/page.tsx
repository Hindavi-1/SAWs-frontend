import { PageHeader } from "@/components/layout/page-header";
import { ModuleStatusCard } from "@/components/features/module-status-card";
import { getModuleStatuses } from "@/lib/api";

export default async function ModuleOpsPage() {
  const modules = await getModuleStatuses();

  return (
    <div>
      <PageHeader
        title="Module Ops"
        description="Status and throughput of the 12 backend agents that power the workspace. This view is for platform owners — sales users work from the funnel, not from here."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <ModuleStatusCard key={m.id} module={m} />
        ))}
      </div>
    </div>
  );
}
