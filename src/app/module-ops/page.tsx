import { PageHeader } from "@/components/layout/page-header";
import { ModuleStatusCard } from "@/components/features/module-status-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getModuleStatuses } from "@/lib/api";
import type { ModuleStatus } from "@/lib/types";
import { Boxes } from "lucide-react";

export default async function ModuleOpsPage() {
  let modules: ModuleStatus[] | null = null;
  try {
    modules = await getModuleStatuses();
  } catch {
    modules = null;
  }

  return (
    <div>
      <PageHeader
        title="Module Ops"
        description="Status and throughput of the 12 backend agents that power the workspace. This view is for platform owners — sales users work from the funnel, not from here."
      />
      {modules === null ? (
        <EmptyState
          icon={Boxes}
          title="Module status is not available"
          description="This view has no live backend data source yet, so it stays empty rather than showing sample numbers that look real."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <ModuleStatusCard key={m.id} module={m} />
          ))}
        </div>
      )}
    </div>
  );
}
