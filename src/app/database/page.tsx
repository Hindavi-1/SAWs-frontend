"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDatabaseDump, type DatabaseDump } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import { Database, RefreshCw, Search, ShieldAlert } from "lucide-react";

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function DatabaseExplorerPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [dump, setDump] = React.useState<DatabaseDump | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setDump(await getDatabaseDump());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load database");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    (async () => {
      try {
        const data = await getDatabaseDump();
        if (!active) return;
        setDump(data);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load database");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  // Non-admin users get an explicit access-denied state instead of a stuck loader.
  if (!isAdmin) {
    return (
      <div>
        <PageHeader
          eyebrow="Debug"
          title="Database Explorer"
          description="Read-only snapshot of every table in the connected PostgreSQL database. This page is restricted to admin users."
        />
        <Card className="border-border-strong">
          <CardContent className="flex items-center gap-2 text-xs text-risk-500">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Access denied — you must be signed in as an administrator to view the database.
          </CardContent>
        </Card>
      </div>
    );
  }

  const tables = dump?.tables ?? {};
  const totalRows = Object.values(tables).reduce((sum, rows) => sum + rows.length, 0);
  const q = query.trim().toLowerCase();

  return (
    <div>
      <PageHeader
        eyebrow="Debug"
        title="Database Explorer"
        description="Read-only snapshot of every table in the connected PostgreSQL database, restricted to admin users. This page is intentionally hidden from the navigation — open it directly at /database."
        actions={
          <Button variant="secondary" size="sm" onClick={refresh} loading={isLoading}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      {error && (
        <Card className="border-border-strong">
          <CardContent className="flex items-center gap-2 text-xs text-risk-500">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {!error && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge signal={dump?.connected ? "positive" : "risk"} dot>
            {dump?.connected ? "PostgreSQL connected" : isLoading ? "Connecting…" : "Not connected"}
          </Badge>
          <Badge signal="neutral">{Object.keys(tables).length} tables</Badge>
          <Badge signal="neutral">{totalRows} rows</Badge>
          <div className="relative ml-auto w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter rows…"
              className="h-8 w-full rounded-[var(--radius-sm)] border border-border-default bg-raised pl-8 pr-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {!error && dump && !dump.connected && (
        <Card>
          <CardContent className="flex items-center gap-2 text-xs text-text-secondary">
            <Database className="h-4 w-4 text-text-tertiary" />
            The backend is not connected to PostgreSQL (it fell back to the in-memory store), so there
            is nothing to show. Start the database and restart the backend.
          </CardContent>
        </Card>
      )}

      {!error && dump?.connected && (
        <div className="space-y-4">
          {Object.entries(tables).map(([name, rows]) => {
            const columns = Array.from(
              rows.reduce((set, row) => {
                Object.keys(row).forEach((key) => set.add(key));
                return set;
              }, new Set<string>())
            );
            const visibleRows = q
              ? rows.filter((row) =>
                  Object.values(row).some((value) => formatCell(value).toLowerCase().includes(q))
                )
              : rows;

            return (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="font-mono">{name}</CardTitle>
                  <span className="text-[11px] text-text-tertiary">
                    {visibleRows.length}
                    {visibleRows.length !== rows.length ? ` / ${rows.length}` : ""} rows
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  {visibleRows.length === 0 ? (
                    <p className="px-5 py-4 text-xs text-text-tertiary">No rows</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-border-subtle bg-sunken/50">
                            {columns.map((column) => (
                              <th
                                key={column}
                                className="whitespace-nowrap px-3 py-2 font-mono font-semibold text-text-secondary"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRows.map((row, index) => (
                            <tr
                              key={index}
                              className="border-b border-border-subtle last:border-0 hover:bg-sunken/40"
                            >
                              {columns.map((column) => {
                                const text = formatCell(row[column]);
                                return (
                                  <td
                                    key={column}
                                    className="max-w-[320px] truncate px-3 py-2 align-top text-text-primary"
                                    title={text}
                                  >
                                    {text}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
