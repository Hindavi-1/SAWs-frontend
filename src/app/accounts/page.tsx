"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { AccountTable } from "@/components/features/account-table";
import { AccountPeekDrawer } from "@/components/features/account-peek-drawer";
import { HealthBadge } from "@/components/ui/badge";
import * as api from "@/lib/api";
import type { Account, FunnelStage } from "@/lib/types";
import { FUNNEL_STAGES, STAGE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Kanban, List, Search, Filter, Sparkles, Building2, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import * as React from "react";

type SavedView = "all" | "high_fit" | "outreach" | "attention" | "recent";

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
  const [savedView, setSavedView] = React.useState<SavedView>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [view, setView] = React.useState<"table" | "kanban">("table");

  // Peek drawer state
  const [peekAccount, setPeekAccount] = React.useState<Account | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    api.getAccounts().then(setAccounts);
  }, []);

  const handleSelectAccount = (acc: Account) => {
    setPeekAccount(acc);
    setDrawerOpen(true);
  };

  const stageFilter: FunnelStage | "all" = stageOverride ?? stageParam ?? "all";

  // Filter pipeline
  const filtered = React.useMemo(() => {
    return accounts.filter((a) => {
      // Stage filter
      if (stageFilter !== "all" && a.stage !== stageFilter) {
        return false;
      }

      // Saved view filter
      if (savedView === "high_fit" && a.fitScore < 80) return false;
      if (savedView === "outreach" && a.stage !== "outreach_ready") return false;
      if (savedView === "attention" && a.health !== "stalled" && a.daysInStage < 7) return false;
      if (savedView === "recent") {
        const isRecent = new Date(a.discoveredAt).getTime() > Date.now() - 14 * 86400000;
        if (!isRecent) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesDomain = a.domain.toLowerCase().includes(q);
        const matchesIndustry = a.industry.toLowerCase().includes(q);
        if (!matchesName && !matchesDomain && !matchesIndustry) {
          return false;
        }
      }

      return true;
    });
  }, [accounts, stageFilter, savedView, searchQuery]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Accounts Directory"
        description={`${accounts.length} total target accounts under autonomous coverage`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-[var(--radius-sm)] border border-border-default bg-sunken p-0.5">
              <ToggleBtn icon={List} active={view === "table"} onClick={() => setView("table")} label="Table" />
              <ToggleBtn icon={Kanban} active={view === "kanban"} onClick={() => setView("kanban")} label="Kanban" />
            </div>
          </div>
        }
      />

      {/* Saved Views Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <SavedViewTab
            label="All Accounts"
            count={accounts.length}
            active={savedView === "all"}
            onClick={() => setSavedView("all")}
          />
          <SavedViewTab
            label="High Fit (80+)"
            count={accounts.filter((a) => a.fitScore >= 80).length}
            active={savedView === "high_fit"}
            onClick={() => setSavedView("high_fit")}
          />
          <SavedViewTab
            label="In Outreach"
            count={accounts.filter((a) => a.stage === "outreach_ready").length}
            active={savedView === "outreach"}
            onClick={() => setSavedView("outreach")}
          />
          <SavedViewTab
            label="Needs Attention"
            count={accounts.filter((a) => a.health === "stalled" || a.daysInStage >= 7).length}
            active={savedView === "attention"}
            onClick={() => setSavedView("attention")}
          />
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search accounts, domains, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-raised border border-border-default rounded-[var(--radius-sm)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-accent-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-tertiary hover:text-text-primary"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Stage Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-text-tertiary font-medium mr-1">Stage:</span>
        <FilterChip label="All stages" count={accounts.length} active={stageFilter === "all"} onClick={() => setStageOverride("all")} />
        {FUNNEL_STAGES.map((s) => {
          const count = accounts.filter((a) => a.stage === s).length;
          return (
            <FilterChip
              key={s}
              label={STAGE_LABELS[s]}
              count={count}
              active={stageFilter === s}
              onClick={() => setStageOverride(s)}
            />
          );
        })}
      </div>

      {/* Main View Area */}
      {view === "table" ? (
        <Card className="overflow-hidden border-border-default">
          <AccountTable accounts={filtered} onSelectAccount={handleSelectAccount} />
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {FUNNEL_STAGES.map((stage) => {
            const stageAccounts = filtered.filter((a) => a.stage === stage);
            return (
              <div key={stage} className="w-64 shrink-0 rounded-[var(--radius-md)] border border-border-subtle bg-sunken/30 p-2.5">
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-text-primary">{STAGE_LABELS[stage]}</p>
                    <span className="rounded-full bg-sunken px-1.5 py-0.2 text-[10px] font-mono text-text-tertiary border border-border-subtle">
                      {stageAccounts.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {stageAccounts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-text-tertiary italic">No accounts</div>
                  ) : (
                    stageAccounts.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => handleSelectAccount(a)}
                        className="cursor-pointer block rounded-[var(--radius-sm)] border border-border-subtle bg-raised p-3 shadow-xs hover:border-border-strong hover:bg-sunken/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <p className="truncate text-xs font-semibold text-text-primary hover:text-accent-500">
                            {a.name}
                          </p>
                          <HealthBadge health={a.health} />
                        </div>
                        <p className="text-[11px] text-text-tertiary truncate mb-2">{a.industry}</p>
                        <div className="flex items-center justify-between border-t border-border-subtle/50 pt-2 text-[10px] text-text-tertiary">
                          <span className="font-mono font-medium text-text-secondary">Fit {a.fitScore}</span>
                          <span>{a.daysInStage}d in stage</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Peek Drawer */}
      <AccountPeekDrawer
        account={peekAccount}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

function SavedViewTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-colors whitespace-nowrap",
        active
          ? "bg-raised text-text-primary border border-border-default shadow-xs"
          : "text-text-secondary hover:text-text-primary hover:bg-sunken"
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
          active ? "bg-sunken text-text-secondary" : "text-text-tertiary"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
        active
          ? "border-accent-500 bg-accent-50 text-accent-500 dark:bg-accent-950/40"
          : "border-border-default text-text-secondary hover:bg-sunken"
      )}
    >
      <span>{label}</span>
      {count !== undefined && <span className="opacity-70 font-mono text-[10px]">({count})</span>}
    </button>
  );
}

function ToggleBtn({
  icon: Icon,
  active,
  onClick,
  label,
}: {
  icon: typeof List;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-[4px] px-2 text-xs font-medium",
        active ? "bg-raised text-text-primary shadow-xs border border-border-subtle" : "text-text-tertiary hover:text-text-secondary"
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
