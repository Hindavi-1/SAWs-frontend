"use client";

import * as React from "react";
import { ConfidenceBadge, HealthBadge, StageBadge } from "@/components/ui/badge";
import type { Account } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Send,
  Sparkles,
  Download,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

interface AccountTableProps {
  accounts: Account[];
  onSelectAccount?: (account: Account) => void;
}

type SortField = "name" | "fitScore" | "stage" | "daysInStage" | "discoveredAt";
type SortOrder = "asc" | "desc";

export function AccountTable({ accounts, onSelectAccount }: AccountTableProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [sortField, setSortField] = React.useState<SortField>("fitScore");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedAccounts = React.useMemo(() => {
    return [...accounts].sort((a, b) => {
      let result = 0;
      if (sortField === "name") {
        result = a.name.localeCompare(b.name);
      } else if (sortField === "fitScore") {
        result = a.fitScore - b.fitScore;
      } else if (sortField === "daysInStage") {
        result = a.daysInStage - b.daysInStage;
      } else if (sortField === "discoveredAt") {
        result = new Date(a.discoveredAt).getTime() - new Date(b.discoveredAt).getTime();
      } else if (sortField === "stage") {
        result = a.stage.localeCompare(b.stage);
      }
      return sortOrder === "asc" ? result : -result;
    });
  }, [accounts, sortField, sortOrder]);

  const allSelected = sortedAccounts.length > 0 && selectedIds.size === sortedAccounts.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedAccounts.map((a) => a.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkAction = (actionName: string) => {
    toast.success(`Action applied to ${selectedIds.size} accounts: ${actionName}`);
    setSelectedIds(new Set());
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-40 ml-1 inline" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-accent-500 ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 text-accent-500 ml-1 inline" />
    );
  };

  return (
    <div className="relative">
      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-2 z-20 mx-4 mb-3 flex items-center justify-between rounded-[var(--radius-sm)] border border-border-strong bg-raised px-4 py-2 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white font-mono text-xs font-bold">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold text-text-primary">
              Accounts selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="secondary"
              onClick={() => handleBulkAction("Assign Owner")}
            >
              Assign Owner
            </Button>
            <Button
              size="xs"
              variant="secondary"
              onClick={() => handleBulkAction("Advance Funnel Stage")}
            >
              Advance Stage
            </Button>
            <Button
              size="xs"
              variant="primary"
              onClick={() => handleBulkAction("Queue Outreach Sequences")}
            >
              <Send className="h-3 w-3" /> Queue Outreach
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
            >
              Deselect
            </Button>
          </div>
        </div>
      )}

      {/* Dense Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border-subtle bg-sunken/60 text-text-tertiary select-none font-semibold">
              <th className="w-10 px-3 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-border-default accent-accent-500 cursor-pointer"
                  aria-label="Select all accounts"
                />
              </th>
              <th
                className="px-3 py-2.5 cursor-pointer hover:text-text-primary"
                onClick={() => toggleSort("name")}
              >
                <span>Account & Domain</span>
                <SortIcon field="name" />
              </th>
              <th
                className="px-3 py-2.5 cursor-pointer hover:text-text-primary"
                onClick={() => toggleSort("fitScore")}
              >
                <span>Fit Score</span>
                <SortIcon field="fitScore" />
              </th>
              <th
                className="px-3 py-2.5 cursor-pointer hover:text-text-primary"
                onClick={() => toggleSort("stage")}
              >
                <span>Stage</span>
                <SortIcon field="stage" />
              </th>
              <th className="px-3 py-2.5">Health</th>
              <th className="px-3 py-2.5">Confidence</th>
              <th
                className="px-3 py-2.5 cursor-pointer hover:text-text-primary"
                onClick={() => toggleSort("daysInStage")}
              >
                <span>In Stage</span>
                <SortIcon field="daysInStage" />
              </th>
              <th className="px-3 py-2.5">Owner</th>
              <th
                className="px-4 py-2.5 cursor-pointer hover:text-text-primary text-right"
                onClick={() => toggleSort("discoveredAt")}
              >
                <span>Discovered</span>
                <SortIcon field="discoveredAt" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {sortedAccounts.map((a) => {
              const isSelected = selectedIds.has(a.id);
              return (
                <tr
                  key={a.id}
                  onClick={() => onSelectAccount?.(a)}
                  className={`group transition-colors cursor-pointer select-none ${
                    isSelected ? "bg-accent-50/50 dark:bg-accent-500/10" : "hover:bg-sunken/70"
                  }`}
                >
                  {/* Checkbox */}
                  <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelectRow(a.id, e as unknown as React.MouseEvent)}
                      className="rounded border-border-default accent-accent-500 cursor-pointer"
                      aria-label={`Select ${a.name}`}
                    />
                  </td>

                  {/* Account Name & Domain */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] bg-accent-50 font-mono text-xs font-bold text-accent-500 dark:bg-accent-500/15">
                        {a.logoInitial}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/accounts/${a.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-text-primary hover:text-accent-500 truncate block text-xs"
                        >
                          {a.name}
                        </Link>
                        <p className="text-[11px] text-text-tertiary truncate">
                          {a.domain} · {a.industry}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Fit Score */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-text-primary">
                        {a.fitScore}
                      </span>
                      <div className="h-1.5 w-12 rounded-full bg-sunken overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-500"
                          style={{ width: `${a.fitScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Stage */}
                  <td className="px-3 py-2.5">
                    <StageBadge stage={a.stage} />
                  </td>

                  {/* Health */}
                  <td className="px-3 py-2.5">
                    <HealthBadge health={a.health} />
                  </td>

                  {/* Confidence */}
                  <td className="px-3 py-2.5">
                    <ConfidenceBadge level={a.confidence} />
                  </td>

                  {/* In Stage */}
                  <td className="px-3 py-2.5 font-mono text-text-secondary">
                    {a.daysInStage}d
                  </td>

                  {/* Owner */}
                  <td className="px-3 py-2.5 text-text-secondary truncate max-w-[120px]">
                    {a.ownerName || "Unassigned"}
                  </td>

                  {/* Discovered */}
                  <td className="px-4 py-2.5 text-text-tertiary text-right font-mono">
                    {formatDate(a.discoveredAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
