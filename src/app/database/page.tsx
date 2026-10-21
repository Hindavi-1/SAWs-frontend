"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDatabaseDump,
  getEditableColumns,
  updateDatabaseRecord,
  deleteDatabaseRecord,
  type DatabaseDump,
} from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import { Database, Pencil, RefreshCw, Search, ShieldAlert, Trash2, X } from "lucide-react";

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// These columns are stored as JSONB in PostgreSQL and are edited as raw JSON.
const JSONB_COLUMNS = new Set(["criteria", "bant_status", "objections"]);

interface EditTarget {
  table: string;
  rowId: string;
  row: Record<string, unknown>;
  columns: string[];
}

interface DeleteTarget {
  table: string;
  rowId: string;
  label: string;
}

export default function DatabaseExplorerPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [dump, setDump] = React.useState<DatabaseDump | null>(null);
  const [editable, setEditable] = React.useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [editTarget, setEditTarget] = React.useState<EditTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, cols] = await Promise.all([getDatabaseDump(), getEditableColumns()]);
      setDump(data);
      setEditable(cols);
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
        const [data, cols] = await Promise.all([getDatabaseDump(), getEditableColumns()]);
        if (!active) return;
        setDump(data);
        setEditable(cols);
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

  const handleSaveEdit = async (updates: Record<string, unknown>) => {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      await updateDatabaseRecord(editTarget.table, editTarget.rowId, updates);
      toast.success("Row updated");
      setEditTarget(null);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update row");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await deleteDatabaseRecord(deleteTarget.table, deleteTarget.rowId);
      toast.success("Row deleted");
      setDeleteTarget(null);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete row");
    } finally {
      setIsSaving(false);
    }
  };

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
        description="Snapshot of every table in the connected PostgreSQL database, restricted to admin users. Whitelisted tables can be edited or deleted inline. This page is intentionally hidden from the navigation — open it directly at /database."
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
            const editableColumns = editable[name];
            const canEdit = Array.isArray(editableColumns) && editableColumns.length > 0;

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
                            {canEdit && (
                              <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-text-secondary">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRows.map((row, index) => {
                            const rowId = row.id !== undefined && row.id !== null ? String(row.id) : null;
                            return (
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
                                {canEdit && (
                                  <td className="whitespace-nowrap px-3 py-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        title="Edit row"
                                        disabled={!rowId}
                                        onClick={() =>
                                          rowId &&
                                          setEditTarget({
                                            table: name,
                                            rowId,
                                            row,
                                            columns: editableColumns,
                                          })
                                        }
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        title="Delete row"
                                        disabled={!rowId}
                                        onClick={() =>
                                          rowId &&
                                          setDeleteTarget({
                                            table: name,
                                            rowId,
                                            label:
                                              (row.name as string) ||
                                              (row.email as string) ||
                                              formatCell(rowId),
                                          })
                                        }
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-risk-500" />
                                      </Button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
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

      {editTarget && (
        <EditRowModal
          target={editTarget}
          isSaving={isSaving}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete row"
          message={`Permanently delete this row from "${deleteTarget.table}" (${deleteTarget.label})? This cannot be undone.`}
          confirmLabel="Delete"
          isSaving={isSaving}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[var(--radius-md)] border border-border-default bg-canvas shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose} title="Close">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-4 py-3">{children}</div>
      </div>
    </div>,
    document.body
  );
}

function EditRowModal({
  target,
  isSaving,
  onClose,
  onSave,
}: {
  target: EditTarget;
  isSaving: boolean;
  onClose: () => void;
  onSave: (updates: Record<string, unknown>) => void;
}) {
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    target.columns.forEach((col) => {
      const raw = target.row[col];
      if (raw === null || raw === undefined) initial[col] = "";
      else if (typeof raw === "object") initial[col] = JSON.stringify(raw);
      else initial[col] = String(raw);
    });
    return initial;
  });

  const handleSubmit = () => {
    const updates: Record<string, unknown> = {};
    target.columns.forEach((col) => {
      const original = target.row[col];
      const next = values[col];
      if (JSONB_COLUMNS.has(col) || typeof original === "object") {
        if (next.trim() === "" && original === null) return;
        try {
          updates[col] = JSON.parse(next);
        } catch {
          updates[col] = next;
        }
      } else if (typeof original === "boolean") {
        updates[col] = next === "true";
      } else if (typeof original === "number") {
        updates[col] = next === "" ? null : Number(next);
      } else {
        updates[col] = next === "" ? null : next;
      }
    });
    onSave(updates);
  };

  return (
    <ModalShell title={`Edit ${target.table}`} onClose={onClose}>
      <div className="space-y-3">
        {target.columns.map((col) => {
          const original = target.row[col];
          const isJson = JSONB_COLUMNS.has(col) || typeof original === "object";
          const isBool = typeof original === "boolean";
          return (
            <div key={col} className="space-y-1">
              <label className="block font-mono text-[11px] font-semibold text-text-secondary">
                {col}
              </label>
              {isBool ? (
                <select
                  value={values[col]}
                  onChange={(e) => setValues((v) => ({ ...v, [col]: e.target.value }))}
                  className="h-8 w-full rounded-[var(--radius-sm)] border border-border-default bg-raised px-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : isJson ? (
                <textarea
                  value={values[col]}
                  rows={3}
                  onChange={(e) => setValues((v) => ({ ...v, [col]: e.target.value }))}
                  className="w-full rounded-[var(--radius-sm)] border border-border-default bg-raised px-2.5 py-2 font-mono text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                />
              ) : (
                <input
                  value={values[col]}
                  onChange={(e) => setValues((v) => ({ ...v, [col]: e.target.value }))}
                  className="h-8 w-full rounded-[var(--radius-sm)] border border-border-default bg-raised px-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} loading={isSaving}>
          Save changes
        </Button>
      </div>
    </ModalShell>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  isSaving,
  onClose,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <p className="text-xs text-text-secondary">{message}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={isSaving}>
          {confirmLabel}
        </Button>
      </div>
    </ModalShell>
  );
}
