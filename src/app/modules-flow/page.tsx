"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getBackendHealth, runPipelineTrace, runPipelineTraceUpload } from "@/lib/api";
import {
  PIPELINE_MODULE_META,
  PIPELINE_MODULE_ORDER,
  type ModuleTrace,
  type PipelineTraceResponse,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  OctagonX,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  UploadCloud,
  PlayCircle,
  FileUp,
  Trash2,
  AlertTriangle,
  Hourglass,
} from "lucide-react";

const DEFAULT_ICP_TEXT = `We target B2B SaaS companies based in the United States with 100-500 employees, Series A to Series C funding, using Salesforce or HubSpot CRM, and operating in FinTech, HealthTech, or Enterprise SaaS verticals. Ideal customers have a VP Sales, CRO, or Head of RevOps as the economic buyer, have recently raised funding or posted sales hiring signals, and are looking to scale outbound lead generation while improving lead quality and reducing SDR ramp time. We exclude government agencies, regulated healthcare with PHI restrictions, and companies under 20 employees.`;

const IMPLEMENTED_MODULES = [
  "m01_icp_management",
  "m02_account_discovery",
  "m03_verification",
  "m04_fit_evaluation",
  "m05_buyer_identification",
];

const STATUS_META: Record<
  ModuleTrace["status"],
  { label: string; dot: string; badge: string; icon: typeof CheckCircle2 }
> = {
  success: {
    label: "Ran",
    dot: "bg-positive-500",
    badge: "border-positive-500/30 bg-positive-500/10 text-positive-600 dark:text-positive-400",
    icon: CheckCircle2,
  },
  skipped: {
    label: "Skipped",
    dot: "bg-text-tertiary",
    badge: "border-border-subtle bg-sunken text-text-tertiary",
    icon: ArrowRight,
  },
  error: {
    label: "Error",
    dot: "bg-risk-500",
    badge: "border-risk-500/30 bg-risk-500/10 text-risk-600 dark:text-risk-400",
    icon: OctagonX,
  },
  pending: {
    label: "Not implemented",
    dot: "bg-text-tertiary/50",
    badge: "border-border-subtle bg-sunken/50 text-text-tertiary italic",
    icon: Hourglass,
  },
  not_implemented: {
    label: "Structure only",
    dot: "bg-caution-500",
    badge: "border-caution-500/30 bg-caution-500/10 text-caution-600 dark:text-caution-400",
    icon: Hourglass,
  },
};

const PIPELINE_STATUS_META: Record<
  PipelineTraceResponse["status"],
  { label: string; className: string; dot: string }
> = {
  success: {
    label: "Pipeline complete",
    className: "text-positive-600 border-positive-500/30 bg-positive-500/10",
    dot: "bg-positive-500",
  },
  partial: {
    label: "Partial — some modules failed",
    className: "text-caution-600 border-caution-500/30 bg-caution-500/10",
    dot: "bg-caution-500",
  },
  error: {
    label: "Pipeline error",
    className: "text-risk-600 border-risk-500/30 bg-risk-500/10",
    dot: "bg-risk-500",
  },
};

function formatDuration(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r.toFixed(0)}s`;
}

function JsonView({ data }: { data: unknown }) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);
  return (
    <pre className="max-h-[440px] overflow-auto rounded-[var(--radius-sm)] border border-border-subtle bg-slate-950/60 p-3.5 font-mono text-[11px] leading-relaxed text-slate-300 dark:bg-slate-950/80 scrollbar-thin">
      <code>{text}</code>
    </pre>
  );
}

function KeyValueList({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data ?? {});
  if (entries.length === 0) {
    return <p className="text-xs text-text-tertiary italic">No data</p>;
  }
  return (
    <div className="space-y-2 max-h-[480px] overflow-auto scrollbar-thin pr-1">
      {entries.map(([k, v]) => {
        const isComplex =
          v !== null &&
          typeof v === "object" &&
          (Array.isArray(v) ||
            (Object.keys(v as object).length > 3) ||
            JSON.stringify(v).length > 300);
        return (
          <div key={k} className="rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/60 p-3">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
              {k}
            </p>
            {isComplex ? (
              <JsonView data={v} />
            ) : (
              <div className="font-mono text-xs text-text-primary break-words whitespace-pre-wrap">
                {typeof v === "object"
                  ? JSON.stringify(v, null, 2)
                  : String(v ?? "—")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  count,
  accent,
}: {
  icon: typeof Database;
  title: string;
  count?: number;
  accent: "input" | "output";
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-1.5",
          accent === "input"
            ? "border-indigo-500/20 bg-indigo-500/8 text-indigo-600 dark:text-indigo-400"
            : "border-emerald-500/20 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-extrabold uppercase tracking-wider">
          {title}
        </span>
      </div>
      {count !== undefined && (
        <span className="font-mono text-[11px] font-bold text-text-tertiary">
          {count} keys
        </span>
      )}
    </div>
  );
}

function ModuleCard({
  idx,
  trace,
  expanded,
  onToggle,
}: {
  idx: number;
  trace: ModuleTrace;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = PIPELINE_MODULE_META[trace.module_id] ?? {
    step: String(idx + 1).padStart(2, "0"),
    icon: "🧩",
    description: trace.module_name,
  };
  const statusMeta = STATUS_META[trace.status];
  const StatusIcon = statusMeta.icon;
  const isImplemented = IMPLEMENTED_MODULES.includes(trace.module_id);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border-subtle bg-raised shadow-[var(--shadow-sm)] transition-all",
        isImplemented &&
        trace.status === "success" &&
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-positive-500/40 before:via-positive-500 before:to-positive-500/40",
        trace.status === "error" &&
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-risk-500/40 before:via-risk-500 before:to-risk-500/40",
        !isImplemented &&
        "opacity-85 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-slate-400/40 before:via-slate-400 before:to-slate-400/40"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-sunken/40"
      >
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="relative flex shrink-0 items-center justify-center">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border border-border-subtle bg-sunken text-2xl",
                !isImplemented && "grayscale opacity-60"
              )}
            >
              {meta.icon}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border-subtle bg-raised font-mono text-[10px] font-bold text-text-secondary">
              {meta.step}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-bold text-text-primary">
                {trace.module_name}
                {!isImplemented && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-slate-500/10 px-1.5 py-0.5 align-middle font-mono text-[9px] font-bold uppercase tracking-wider text-text-tertiary not-italic">
                    <Clock className="h-2.5 w-2.5" />
                    Later
                  </span>
                )}
              </h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  statusMeta.badge
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {statusMeta.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-tertiary line-clamp-1">
              {meta.description}
            </p>
            {isImplemented && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-tertiary">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {formatDuration(trace.duration_ms ?? null)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Database className="h-3 w-3" />
                  In: {Object.keys(trace.inputs ?? {}).length} keys
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3" />
                  Out: {Object.keys(trace.outputs ?? {}).length} keys
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 pt-1">
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-text-tertiary" />
          ) : (
            <ChevronRight className="h-5 w-5 text-text-tertiary" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border-subtle px-5 pb-5 pt-4">
          {trace.error && (
            <div className="mb-4 overflow-hidden rounded-xl border border-risk-500/20 bg-risk-500/10">
              <div className="flex items-start gap-2.5 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-risk-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-risk-600 dark:text-risk-400">
                    Module error
                  </p>
                  <p className="mt-1 break-words font-mono text-[11px] leading-relaxed text-risk-700 dark:text-risk-300">
                    {trace.error}
                  </p>
                </div>
              </div>
              {trace.traceback && (
                <details className="border-t border-risk-500/20 bg-black/10">
                  <summary className="cursor-pointer list-none select-none px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-risk-500">
                    <span className="inline-flex items-center gap-2">
                      <ChevronRight className="h-3.5 w-3.5" />
                      Module traceback
                    </span>
                  </summary>
                  <pre className="mx-3 mb-3 max-h-[360px] overflow-auto rounded-lg border border-border-subtle bg-slate-950/70 p-3 font-mono text-[11px] leading-relaxed text-slate-300 scrollbar-thin whitespace-pre">
                    {trace.traceback}
                  </pre>
                </details>
              )}
            </div>
          )}

          {!isImplemented ? (
            <div className="rounded-2xl border border-dashed border-border-subtle bg-gradient-to-br from-sunken/60 to-transparent p-6 text-center">
              <Hourglass className="mx-auto h-8 w-8 text-text-tertiary" />
              <p className="mt-3 text-sm font-semibold text-text-primary">
                Coming later
              </p>
              <p className="mt-1.5 text-xs text-text-tertiary">
                This module's state + schemas are implemented in the backend, but the
                pipeline extension to run it through this endpoint hasn't been wired up
                yet. Input/output structure is placeholder.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border-subtle bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent p-4">
                <SectionHeader
                  icon={Database}
                  title="Input"
                  count={Object.keys(trace.inputs ?? {}).length}
                  accent="input"
                />
                <KeyValueList data={trace.inputs as Record<string, unknown>} />
              </div>

              <div className="rounded-2xl border border-border-subtle bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent p-4">
                <SectionHeader
                  icon={ArrowRight}
                  title="Output"
                  count={Object.keys(trace.outputs ?? {}).length}
                  accent="output"
                />
                <KeyValueList data={trace.outputs as Record<string, unknown>} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type IcpInputMode = "text" | "upload";

interface RichError {
  message: string;
  error_type?: string | null;
  traceback?: string | null;
  path?: string | null;
  method?: string | null;
  partial_traces?: unknown;
}

function parseRichError(raw: unknown): RichError {
  if (!raw) return { message: "Unknown error" };
  if (raw instanceof Error) {
    const errMsg = raw.message;
    try {
      const jsonStart = errMsg.indexOf("{");
      if (jsonStart >= 0) {
        const candidate = errMsg.slice(jsonStart);
        const parsed = JSON.parse(candidate);
        const detail = parsed.detail;
        if (detail && typeof detail === "object") {
          return {
            message: String(
              (detail as { error?: unknown }).error ??
              (detail as { message?: unknown }).message ??
              errMsg
            ),
            error_type: (detail as { error_type?: string | null }).error_type ?? null,
            traceback: (detail as { traceback?: string | null }).traceback ?? null,
            path: (detail as { path?: string | null }).path ?? null,
            method: (detail as { method?: string | null }).method ?? null,
            partial_traces: (parsed as { partial_traces?: unknown }).partial_traces ?? undefined,
          };
        }
      }
    } catch {
      // Fall through to plain message
    }
    return { message: errMsg };
  }
  return { message: String(raw) };
}

export default function PipelineInspectorPage() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const [execMode, setExecMode] = useState<"live" | "mock">("mock");
  const [icpMode, setIcpMode] = useState<IcpInputMode>("text");
  const [icpText, setIcpText] = useState<string>(DEFAULT_ICP_TEXT);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RichError | null>(null);
  const [trace, setTrace] = useState<PipelineTraceResponse | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  async function checkHealth() {
    const h = await getBackendHealth();
    setBackendOnline(!!h);
    return !!h;
  }

  async function executePipeline() {
    setLoading(true);
    setError(null);
    setTrace(null);
    setExpandedModule("m01_icp_management");

    const commonOpts = {
      run_verification: true,
      run_fit_evaluation: true,
      max_accounts_for_buyer_research: 3,
      mode: execMode,
    };

    try {
      if (icpMode === "upload") {
        if (!uploadedFile) {
          throw new Error("Please upload an ICP document (.docx / .json / .txt)");
        }
        const result = await runPipelineTraceUpload({
          icp_file: uploadedFile,
          ...commonOpts,
        });
        setTrace(result);
        if (result.status === "error") {
          const erroredMod = result.modules.find((m) => m.status === "error");
          if (erroredMod) {
            setExpandedModule(erroredMod.module_id);
          }
        }
      } else {
        if (!icpText.trim()) {
          throw new Error("Please enter an ICP description first");
        }
        const result = await runPipelineTrace({
          raw_icp_text: icpText,
          ...commonOpts,
        });
        setTrace(result);
        if (result.status === "error") {
          const erroredMod = result.modules.find((m) => m.status === "error");
          if (erroredMod) {
            setExpandedModule(erroredMod.module_id);
          }
        }
      }
    } catch (e) {
      setError(parseRichError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const online = await checkHealth();
      if (!mounted) return;
      setBackendOnline(online);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const orderedTraces = useMemo(() => {
    if (!trace) return [];
    return PIPELINE_MODULE_ORDER.map(
      (id) => trace.modules.find((m) => m.module_id === id)
    ).filter((m): m is ModuleTrace => !!m);
  }, [trace]);

  const stats = useMemo(() => {
    if (!trace) return null;
    return {
      succeeded: trace.modules.filter((m) => m.status === "success").length,
      skipped: trace.modules.filter((m) => m.status === "skipped").length,
      pending: trace.modules.filter((m) => m.status === "pending").length,
      errored: trace.modules.filter((m) => m.status === "error").length,
    };
  }, [trace]);

  const canRun =
    backendOnline === true &&
    !loading &&
    ((icpMode === "text" && icpText.trim().length > 0) ||
      (icpMode === "upload" && !!uploadedFile));

  return (
    <div className="min-h-screen bg-gradient-to-b from-canvas via-canvas to-sunken/30">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold",
                backendOnline === null
                  ? "border-border-subtle bg-sunken text-text-tertiary"
                  : backendOnline
                    ? "border-positive-500/30 bg-positive-500/10 text-positive-600 dark:text-positive-400"
                    : "border-risk-500/30 bg-risk-500/10 text-risk-600 dark:text-risk-400"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  backendOnline === null
                    ? "bg-text-tertiary"
                    : backendOnline
                      ? "bg-positive-500 animate-pulse-glow"
                      : "bg-risk-500"
                )}
              />
              Backend: {backendOnline === null ? "checking…" : backendOnline ? "online · :8000" : "offline"}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-sunken px-3 py-1 text-[11px] font-mono text-text-tertiary">
              GET /modules-flow
            </div>
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-text-primary">
            Module Flow Inspector
            <span className="ml-3 bg-gradient-to-r from-accent-500 to-violet-500 bg-clip-text text-transparent">
              M01 → M05
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-text-tertiary">
            End-to-end B2B lead generation pipeline — per-module{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">inputs</span> and{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">outputs</span>.
            M06–M08 are marked for later implementation.
          </p>
        </div>

        {/* Backend offline banner */}
        {backendOnline === false && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-risk-500/25 bg-risk-500/10 p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-risk-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-risk-600 dark:text-risk-400">
                Backend FastAPI server is not reachable
              </p>
              <p className="mt-1 text-xs text-risk-700/80 dark:text-risk-300/80">
                Start the backend before running a pipeline:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-risk-500/20 bg-black/30 p-3 font-mono text-[11px] text-slate-300">
                {`..\\venv\\Scripts\\Activate.ps1
uvicorn api.main:app --reload --port 8000`}
              </pre>
            </div>
          </div>
        )}

        {/* ICP Input Options Card */}
        <div className="mb-6 rounded-2xl border border-border-subtle bg-gradient-to-br from-raised to-sunken/40 p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-extrabold text-text-primary">
                Choose your ICP input
              </h2>
              <p className="mt-1 text-xs text-text-tertiary">
                Either paste an ICP description, or upload a{" "}
                <code className="rounded bg-black/10 px-1 font-mono text-[10px] dark:bg-white/5">
                  .docx
                </code>
                <code className="ml-1 rounded bg-black/10 px-1 font-mono text-[10px] dark:bg-white/5">
                  .json
                </code>{" "}
                or{" "}
                <code className="rounded bg-black/10 px-1 font-mono text-[10px] dark:bg-white/5">
                  .txt
                </code>{" "}
                ICP document. Then hit Run Pipeline.
              </p>
            </div>
          </div>

          {/* Controls Bar: Mode Tabs + Execution Engine Switcher */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {/* Input Type */}
            <div className="inline-flex items-center gap-1 rounded-xl border border-border-subtle bg-sunken/70 p-1">
              <button
                type="button"
                onClick={() => setIcpMode("text")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all",
                  icpMode === "text"
                    ? "bg-raised text-text-primary shadow-[var(--shadow-sm)]"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                <FileText className="h-3.5 w-3.5" />
                Paste ICP Description
              </button>
              <button
                type="button"
                onClick={() => setIcpMode("upload")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all",
                  icpMode === "upload"
                    ? "bg-raised text-text-primary shadow-[var(--shadow-sm)]"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Upload ICP Document
              </button>
            </div>

            {/* Execution Engine Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Engine:
              </span>
              <div className="inline-flex items-center gap-1 rounded-xl border border-border-subtle bg-sunken/70 p-1">
                <button
                  type="button"
                  onClick={() => setExecMode("mock")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    execMode === "mock"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                      : "text-text-tertiary hover:text-text-secondary"
                  )}
                  title="Offline mock engine (1-2s run, no API keys needed, deterministic outputs)"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Mock (Offline Demo)
                </button>
                <button
                  type="button"
                  onClick={() => setExecMode("live")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    execMode === "live"
                      ? "bg-accent-500/15 text-accent-600 dark:text-accent-400 border border-accent-500/30 shadow-sm"
                      : "text-text-tertiary hover:text-text-secondary"
                  )}
                  title="Live AI execution using Groq LLM & Tavily Web Search"
                >
                  <span className="h-2 w-2 rounded-full bg-accent-500" />
                  Live (Groq + Tavily)
                </button>
              </div>
            </div>
          </div>

          {/* Text Input */}
          {icpMode === "text" && (
            <div className="animate-fade-in-up">
              <textarea
                value={icpText}
                onChange={(e) => setIcpText(e.target.value)}
                placeholder="Describe your Ideal Customer Profile: industries, geographies, company size, buyer personas, exclusions, buying signals…"
                className="h-52 w-full resize-y rounded-xl border border-border-subtle bg-sunken/50 px-4 py-3 font-mono text-[12px] leading-relaxed text-text-primary outline-none transition-all focus:border-accent-500/40 focus:shadow-[var(--shadow-glow-accent)]"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-text-tertiary">
                <span className="font-mono">{icpText.length} characters</span>
                <button
                  type="button"
                  onClick={() => setIcpText("")}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold text-text-tertiary transition-colors hover:bg-sunken hover:text-risk-500"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Upload Input */}
          {icpMode === "upload" && (
            <div className="animate-fade-in-up">
              <div
                className={cn(
                  "group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all",
                  uploadedFile
                    ? "border-accent-500/40 bg-accent-500/5"
                    : "border-border-subtle bg-sunken/40 hover:border-accent-500/40 hover:bg-accent-500/5"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.json,.txt,.doc"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setUploadedFile(f);
                  }}
                />
                {uploadedFile ? (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/20 to-violet-500/10 shadow-[var(--shadow-glow-accent)]">
                      <FileUp className="h-6 w-6 text-accent-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        {uploadedFile.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-text-tertiary font-mono">
                        {(uploadedFile.size / 1024).toFixed(1)} KB · ready to parse
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-raised px-3 py-1.5 text-[11px] font-semibold text-text-tertiary transition-all hover:border-risk-500/30 hover:text-risk-500"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sunken">
                      <UploadCloud className="h-6 w-6 text-text-tertiary transition-transform group-hover:-translate-y-0.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        Click to select or drag & drop
                      </p>
                      <p className="mt-0.5 text-[11px] text-text-tertiary">
                        Supports Word (.docx), JSON, or text files — parsed by the ICP
                        Management module
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {[".docx", ".json", ".txt"].map((ext) => (
                        <span
                          key={ext}
                          className="rounded-md border border-border-subtle bg-raised px-2 py-0.5 font-mono text-[10px] font-bold text-text-tertiary"
                        >
                          {ext}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Run button */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-tertiary">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-positive-500" />
                M01–M05 fully executed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary/50" />
                M06–M08 shown as pending
              </span>
            </div>

            <button
              type="button"
              onClick={executePipeline}
              disabled={!canRun}
              className={cn(
                "group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-extrabold shadow-[var(--shadow-md)] transition-all duration-300",
                canRun
                  ? "bg-[linear-gradient(135deg,var(--accent-500),var(--ramp-4)_50%,var(--ramp-6))] text-white hover:shadow-[var(--shadow-lg),var(--shadow-glow-accent)] hover:-translate-y-0.5 active:translate-y-0"
                  : "cursor-not-allowed border border-border-subtle bg-sunken text-text-tertiary shadow-none"
              )}
            >
              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-active:opacity-0">
                <span className="absolute inset-0 bg-[radial-gradient(800px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.18),transparent_40%)]" />
              </span>
              {loading ? (
                <>
                  <Loader2 className="relative h-4 w-4 animate-spin" />
                  Running pipeline…
                </>
              ) : (
                <>
                  <PlayCircle className="relative h-4 w-4" />
                  Run Pipeline M01 → M05
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && !loading && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-risk-500/25 bg-risk-500/10">
            <div className="flex items-start gap-3 p-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-risk-500" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-risk-600 dark:text-risk-400">
                    Pipeline run failed
                  </p>
                  {error.error_type && (
                    <span className="rounded-md border border-risk-500/20 bg-black/20 px-2 py-0.5 font-mono text-[10px] font-bold text-risk-500">
                      {error.error_type}
                    </span>
                  )}
                  {(error.method || error.path) && (
                    <span className="rounded-md border border-border-subtle bg-black/10 px-2 py-0.5 font-mono text-[10px] text-text-tertiary">
                      {error.method ? `${error.method} ` : ""}
                      {error.path ?? ""}
                    </span>
                  )}
                </div>
                <pre className="mt-2 max-h-60 overflow-auto rounded-xl border border-risk-500/20 bg-black/30 p-3 font-mono text-[11px] text-slate-300 scrollbar-thin whitespace-pre-wrap break-words">
                  {error.message}
                </pre>
                {error.traceback && (
                  <details className="mt-3 rounded-xl border border-risk-500/20 bg-black/20">
                    <summary className="cursor-pointer list-none select-none px-3 py-2 text-xs font-bold uppercase tracking-wider text-risk-400">
                      <span className="inline-flex items-center gap-2">
                        <ChevronRight className="h-3.5 w-3.5" />
                        Python traceback
                      </span>
                    </summary>
                    <pre className="mx-3 mb-3 max-h-[520px] overflow-auto rounded-lg border border-border-subtle bg-slate-950/70 p-3 font-mono text-[11px] leading-relaxed text-slate-300 scrollbar-thin">
                      {error.traceback}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading banner */}
        {loading && (
          <div className="mb-6 rounded-2xl border border-accent-500/20 bg-accent-500/5 p-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-accent-500" />
            <p className="mt-4 text-sm font-semibold text-text-primary">
              Running pipeline — this can take 2–5 minutes…
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              M01 ICP → M02 Discovery → M03 Verification → M04 Fit → M05 Buyers
            </p>
            <div className="mx-auto mt-6 grid max-w-3xl grid-cols-5 gap-2">
              {[
                { n: "M01", label: "ICP" },
                { n: "M02", label: "Discovery" },
                { n: "M03", label: "Verify" },
                { n: "M04", label: "Fit" },
                { n: "M05", label: "Buyers" },
              ].map((s, i) => (
                <div
                  key={s.n}
                  className="rounded-xl border border-border-subtle bg-sunken/50 p-2"
                >
                  <div className="font-mono text-[10px] font-bold text-accent-500">
                    {s.n}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold text-text-primary">
                    {s.label}
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-300/20 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-500 to-violet-500"
                      style={{
                        width: "0%",
                        animation: `progress 2.4s ease-in-out ${i * 0.35}s infinite`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pipeline summary + modules */}
        {trace && stats && (
          <>
            <div className="mb-6 rounded-2xl border border-border-subtle bg-gradient-to-br from-raised to-sunken/40 p-5 shadow-[var(--shadow-sm)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold",
                        PIPELINE_STATUS_META[trace.status].className
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          PIPELINE_STATUS_META[trace.status].dot
                        )}
                      />
                      {PIPELINE_STATUS_META[trace.status].label}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-sunken px-3 py-1 font-mono text-[10px] text-text-tertiary">
                      {trace.pipeline_id}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-tertiary">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Total:{" "}
                      <span className="font-mono font-semibold text-text-primary">
                        {formatDuration(trace.total_duration_ms)}
                      </span>
                    </span>
                    <span>
                      Started:{" "}
                      <span className="font-mono text-text-primary">
                        {new Date(trace.started_at).toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center sm:gap-3">
                  <StatBlock label="Ran" value={stats.succeeded} tone="positive" />
                  <StatBlock label="Pending" value={stats.pending} tone="muted" />
                  <StatBlock label="Skipped" value={stats.skipped} tone="muted" />
                  <StatBlock label="Errored" value={stats.errored} tone="risk" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryTile
                  label="Accounts through fit"
                  value={String(
                    (trace.summary.accounts_passed_fit as number) ?? 0
                  )}
                  sub="After verification + fit evaluation"
                />
                <SummaryTile
                  label="Total buyers found"
                  value={String(
                    (trace.summary.total_buyers_found as number) ?? 0
                  )}
                  sub="Across top N accounts (M05)"
                />
                <SummaryTile
                  label="Modules executed"
                  value={`${stats.succeeded}/5`}
                  sub="M01 → M05 (M06–M08 pending)"
                />
              </div>

              {stats.pending > 0 && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-caution-500/20 bg-caution-500/8 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-caution-500" />
                  <div className="min-w-0 text-xs text-caution-700 dark:text-caution-300">
                    <span className="font-bold">M06–M08 (Account Understanding · Personalized Outreach · Deal Qualification)</span>{" "}
                    are present in the backend codebase with schemas & state, but their node
                    execution graphs haven't been wired through this pipeline endpoint yet.
                    They'll be shown in this view once added.
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {orderedTraces.map((m, idx) => (
                <ModuleCard
                  key={m.module_id}
                  idx={idx}
                  trace={m}
                  expanded={expandedModule === m.module_id}
                  onToggle={() =>
                    setExpandedModule((cur) =>
                      cur === m.module_id ? null : m.module_id
                    )
                  }
                />
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-dashed border-border-subtle bg-sunken/30 p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                Full pipeline trace payload
              </p>
              <JsonView data={trace} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "positive" | "caution" | "risk" | "muted";
}) {
  const toneMap: Record<typeof tone, string> = {
    positive:
      "from-positive-500/15 to-positive-500/5 border-positive-500/20 text-positive-600 dark:text-positive-400",
    caution:
      "from-caution-500/15 to-caution-500/5 border-caution-500/20 text-caution-600 dark:text-caution-400",
    risk:
      "from-risk-500/15 to-risk-500/5 border-risk-500/20 text-risk-600 dark:text-risk-400",
    muted:
      "from-slate-500/10 to-slate-500/5 border-border-subtle text-text-secondary",
  };
  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-b px-3 py-2.5",
        toneMap[tone]
      )}
    >
      <p className="font-mono text-xl font-black leading-none">{value}</p>
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-raised p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-2xl font-black text-text-primary">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-text-tertiary">{sub}</p>}
    </div>
  );
}
