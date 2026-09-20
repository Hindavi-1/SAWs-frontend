"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccountCard } from "@/components/features/account-card";
import { EvidenceList } from "@/components/features/evidence-list";
import { Drawer } from "@/components/ui/drawer";
import { ConfidenceBadge } from "@/components/ui/badge";
import { RadialScore } from "@/components/ui/radial-score";
import * as api from "@/lib/api";
import { evidenceByAccount, icpFitByAccount } from "@/lib/mock-data";
import type { Account } from "@/lib/types";
import { CheckCircle2, ChevronDown, Loader2, Play, Sparkles, Table2, LayoutGrid } from "lucide-react";
import * as React from "react";

const RUN_STEPS = ["Scanning data sources", "Scoring ICP fit", "Verifying signals", "Ranking results"];

export default function DiscoveryPage() {
  const [selectedIcp, setSelectedIcp] = React.useState("icp_1");
  const [icps, setIcps] = React.useState<Awaited<ReturnType<typeof api.getIcps>>>([]);
  const [runState, setRunState] = React.useState<"idle" | "running" | "done">("idle");
  const [runStep, setRunStep] = React.useState(0);
  const [results, setResults] = React.useState<Account[]>([]);
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const [activeAccount, setActiveAccount] = React.useState<Account | null>(null);

  React.useEffect(() => {
    api.getIcps().then(setIcps);
  }, []);

  function startRun() {
    setRunState("running");
    setRunStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setRunStep(step);
      if (step >= RUN_STEPS.length) {
        clearInterval(interval);
        api.getAccounts().then((all) => {
          setResults(all.filter((a) => a.icpId === selectedIcp));
          setRunState("done");
        });
      }
    }, 550);
  }

  const activeIcp = icps.find((i) => i.id === selectedIcp);

  return (
    <div>
      <PageHeader
        title="Account Discovery"
        description="Select an ICP, run discovery, and review what the agent found before advancing accounts into the funnel."
      />

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Ideal Customer Profile</label>
            <div className="relative max-w-md">
              <select
                value={selectedIcp}
                onChange={(e) => {
                  setSelectedIcp(e.target.value);
                  setRunState("idle");
                }}
                className="h-9 w-full appearance-none rounded-[var(--radius-sm)] border border-border-default bg-sunken px-3 pr-8 text-sm text-text-primary focus:border-accent-500 focus:outline-none"
              >
                {icps.map((icp) => (
                  <option key={icp.id} value={icp.id}>
                    {icp.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            </div>
            {activeIcp && (
              <p className="mt-2 max-w-xl text-xs text-text-tertiary">
                {activeIcp.description} · ~{activeIcp.matchingAccounts} companies match initial filters
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md">+ New ICP</Button>
            <Button size="md" onClick={startRun} loading={runState === "running"}>
              <Play className="h-3.5 w-3.5" /> Start Discovery Run
            </Button>
          </div>
        </CardContent>

        {activeIcp && (
          <div className="flex flex-wrap gap-1.5 border-t border-border-subtle px-5 py-3">
            {activeIcp.criteria.map((c) => (
              <span key={c} className="rounded-full border border-border-default bg-sunken px-2.5 py-1 text-[11px] text-text-secondary">
                {c}
              </span>
            ))}
          </div>
        )}
      </Card>

      {runState === "running" && (
        <Card className="mb-5">
          <CardContent>
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-text-primary">
              <Sparkles className="h-4 w-4 text-accent-500" />
              Running discovery agent...
            </div>
            <ul className="mt-3 space-y-2.5">
              {RUN_STEPS.map((step, i) => (
                <li key={step} className="flex items-center gap-2.5 text-sm">
                  {i < runStep ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-positive-500" />
                  ) : i === runStep ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-500" />
                  ) : (
                    <span className="h-4 w-4 shrink-0 rounded-full border-2 border-border-default" />
                  )}
                  <span className={i <= runStep ? "text-text-primary" : "text-text-tertiary"}>{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {runState === "done" && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">{results.length} accounts</span> discovered and scored
            </p>
            <div className="flex items-center gap-0.5 rounded-[var(--radius-sm)] border border-border-default bg-sunken p-0.5">
              <ViewToggle icon={LayoutGrid} active={view === "grid"} onClick={() => setView("grid")} />
              <ViewToggle icon={Table2} active={view === "table"} onClick={() => setView("table")} />
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((account) => (
                <AccountCard key={account.id} account={account} onOpen={setActiveAccount} />
              ))}
            </div>
          ) : (
            <Card>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs text-text-tertiary">
                    <th className="px-5 py-2.5 font-medium">Account</th>
                    <th className="px-3 py-2.5 font-medium">Fit score</th>
                    <th className="px-3 py-2.5 font-medium">Confidence</th>
                    <th className="px-3 py-2.5 font-medium">Signals</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((a) => (
                    <tr key={a.id} onClick={() => setActiveAccount(a)} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-sunken">
                      <td className="px-5 py-3 font-medium text-text-primary">{a.name}</td>
                      <td className="px-3 py-3 font-mono">{a.fitScore}</td>
                      <td className="px-3 py-3"><ConfidenceBadge level={a.confidence} /></td>
                      <td className="px-3 py-3 text-text-secondary">{a.discoveryReasons.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      <Drawer
        open={!!activeAccount}
        onClose={() => setActiveAccount(null)}
        title={activeAccount?.name ?? ""}
        description={activeAccount ? `${activeAccount.industry} · ${activeAccount.hqLocation}` : undefined}
      >
        {activeAccount && (
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-4">
              <RadialScore value={activeAccount.fitScore} size={64} label="fit" />
              <div>
                <ConfidenceBadge level={activeAccount.confidence} />
                <p className="mt-1.5 text-xs text-text-tertiary">Discovered via {activeAccount.icpName}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-text-secondary">Why this account matched</p>
              <ul className="space-y-1.5">
                {activeAccount.discoveryReasons.map((r) => (
                  <li key={r} className="text-sm text-text-primary">· {r}</li>
                ))}
              </ul>
            </div>

            {icpFitByAccount[activeAccount.id] && (
              <div>
                <p className="mb-2 text-xs font-semibold text-text-secondary">ICP fit breakdown</p>
                <ul className="space-y-2">
                  {icpFitByAccount[activeAccount.id].map((c) => (
                    <li key={c.criterion} className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{c.criterion}</span>
                      <span className="font-mono text-text-primary">{c.score}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold text-text-secondary">Evidence</p>
              <EvidenceList items={evidenceByAccount[activeAccount.id] ?? []} />
            </div>

            <div className="flex gap-2 border-t border-border-subtle pt-4">
              <Button className="flex-1">Verify & Advance</Button>
              <Button variant="secondary">Watchlist</Button>
              <Button variant="ghost">Reject</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function ViewToggle({ icon: Icon, active, onClick }: { icon: typeof LayoutGrid; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-[4px] ${active ? "bg-raised text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
