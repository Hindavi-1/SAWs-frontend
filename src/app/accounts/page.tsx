"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { AccountTable } from "@/components/features/account-table";
import { HealthBadge } from "@/components/ui/badge";
import * as api from "@/lib/api";
import type { Account, FunnelStage } from "@/lib/types";
import { FUNNEL_STAGES, STAGE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Kanban, List } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import * as React from "react";

export default function AccountsPage() {
  return (
    <React.Suspense fallback={null}>
      <AccountsPageInner />
    </React.Suspense>
  );
}

function AccountsPageInner() {
  const searchParams = useSearchParams();
  const stageParam = searchParams.get("stage") as FunnelStage | null;
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [stageOverride, setStageOverride] = React.useState<FunnelStage | "all" | null>(null);
  const [view, setView] = React.useState<"table" | "kanban">("table");

  React.useEffect(() => {
    api.getAccounts().then(setAccounts);
  }, []);

  // The URL's ?stage= param is the source of truth until the user clicks a
  // filter chip directly, at which point the local override takes over.
  const stageFilter: FunnelStage | "all" = stageOverride ?? stageParam ?? "all";

  const filtered = stageFilter === "all" ? accounts : accounts.filter((a) => a.stage === stageFilter);

  return (
    <div>
      <PageHeader
        title="Accounts"
        description={`${accounts.length} accounts across the funnel`}
        actions={
          <div className="flex items-center gap-0.5 rounded-[var(--radius-sm)] border border-border-default bg-sunken p-0.5">
            <ToggleBtn icon={List} active={view === "table"} onClick={() => setView("table")} label="Table" />
            <ToggleBtn icon={Kanban} active={view === "kanban"} onClick={() => setView("kanban")} label="Kanban" />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip label="All stages" active={stageFilter === "all"} onClick={() => setStageOverride("all")} />
        {FUNNEL_STAGES.map((s) => (
          <FilterChip key={s} label={STAGE_LABELS[s]} active={stageFilter === s} onClick={() => setStageOverride(s)} />
        ))}
      </div>

      {view === "table" ? (
        <Card>
          <AccountTable accounts={filtered} />
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {FUNNEL_STAGES.map((stage) => {
            const stageAccounts = accounts.filter((a) => a.stage === stage);
            return (
              <div key={stage} className="w-64 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-xs font-semibold text-text-secondary">{STAGE_LABELS[stage]}</p>
                  <span className="font-mono text-xs text-text-tertiary">{stageAccounts.length}</span>
                </div>
                <div className="space-y-2">
                  {stageAccounts.map((a) => (
                    <Link
                      key={a.id}
                      href={`/accounts/${a.id}`}
                      className="block rounded-[var(--radius-sm)] border border-border-subtle bg-raised p-3 hover:border-border-strong hover:bg-sunken"
                    >
                      <p className="truncate text-sm font-medium text-text-primary">{a.name}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="font-mono text-xs text-text-tertiary">Fit {a.fitScore}</span>
                        <HealthBadge health={a.health} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active ? "border-accent-500 bg-accent-50 text-accent-500" : "border-border-default text-text-secondary hover:bg-sunken"
      )}
    >
      {label}
    </button>
  );
}

function ToggleBtn({ icon: Icon, active, onClick, label }: { icon: typeof List; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-[4px] px-2 text-xs font-medium",
        active ? "bg-raised text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
