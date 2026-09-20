/**
 * Data adapter layer.
 *
 * Every function here is `async` on purpose, even though the mock
 * implementation is synchronous — this is the seam where real backend
 * calls get wired in later (e.g. `fetch("/api/accounts")`) without
 * changing a single component. Components only ever import from this
 * file, never from `mock-data.ts` directly.
 */
import * as mock from "./mock-data";
import type {
  Account,
  AgentTask,
  ApprovalItem,
  Buyer,
  ComplianceFlag,
  CrmSyncStatus,
  DashboardMetrics,
  EvidenceItem,
  IcpCriterionScore,
  IcpDefinition,
  ModuleStatus,
  Objection,
  OutcomeRecord,
  OutreachMessage,
  PipelineRunRequest,
  PipelineTraceResponse,
  QualificationCriterion,
} from "./types";

const latency = <T,>(value: T, ms = 0): Promise<T> =>
  ms > 0 ? new Promise((resolve) => setTimeout(() => resolve(value), ms)) : Promise.resolve(value);

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return latency(mock.dashboardMetrics);
}

export async function getAccounts(): Promise<Account[]> {
  return latency(mock.accounts);
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return latency(mock.accounts.find((a) => a.id === id));
}

export async function getIcps(): Promise<IcpDefinition[]> {
  return latency(mock.icps);
}

export async function getEvidenceForAccount(accountId: string): Promise<EvidenceItem[]> {
  return latency(mock.evidenceByAccount[accountId] ?? []);
}

export async function getIcpFitForAccount(accountId: string): Promise<IcpCriterionScore[]> {
  return latency(mock.icpFitByAccount[accountId] ?? []);
}

export async function getBuyersForAccount(accountId: string): Promise<Buyer[]> {
  return latency(mock.buyersByAccount[accountId] ?? []);
}

export async function getQualificationForAccount(accountId: string): Promise<QualificationCriterion[]> {
  return latency(mock.qualificationByAccount[accountId] ?? []);
}

export async function getOutreachForAccount(accountId: string): Promise<OutreachMessage[]> {
  return latency(mock.outreachByAccount[accountId] ?? []);
}

export async function getObjectionsForAccount(accountId: string): Promise<Objection[]> {
  return latency(mock.objectionsByAccount[accountId] ?? []);
}

export async function getAgentTasks(): Promise<AgentTask[]> {
  return latency(mock.agentTasks);
}

export async function getAgentTasksForAccount(accountId: string): Promise<AgentTask[]> {
  return latency(mock.agentTasks.filter((t) => t.accountId === accountId));
}

export async function getApprovalQueue(): Promise<ApprovalItem[]> {
  return latency(mock.approvalQueue);
}

export async function getModuleStatuses(): Promise<ModuleStatus[]> {
  return latency(mock.moduleStatuses);
}

export async function getComplianceFlags(): Promise<ComplianceFlag[]> {
  return latency(mock.complianceFlags);
}

export async function getCrmSyncStatus(): Promise<CrmSyncStatus> {
  return latency(mock.crmSyncStatus);
}

export async function getOutcomeRecords(): Promise<OutcomeRecord[]> {
  return latency(mock.outcomeRecords);
}

// ── Module Pipeline Trace (Backend HTTP calls) ──────────────────────
// These bypass the mock adapter — they call the FastAPI backend directly
// through the Next.js proxy configured in next.config.ts (/api/* → :8000/api/*).

export async function getBackendHealth(): Promise<{ status: string; modules: string[] } | null> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
}

export async function runPipelineTrace(req: PipelineRunRequest): Promise<PipelineTraceResponse> {
  const res = await fetch("/api/tracer/run-pipeline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    cache: "no-store",
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`Pipeline failed (${res.status}): ${errText}`);
  }
  return (await res.json()) as PipelineTraceResponse;
}

export async function runPipelineTraceUpload(params: {
  raw_icp_text?: string;
  icp_file?: File | null;
  run_verification?: boolean;
  run_fit_evaluation?: boolean;
  max_accounts_for_buyer_research?: number;
}): Promise<PipelineTraceResponse> {
  const form = new FormData();
  if (params.raw_icp_text) form.append("raw_icp_text", params.raw_icp_text);
  if (params.icp_file) form.append("icp_file", params.icp_file);
  if (params.run_verification !== undefined) {
    form.append("run_verification", String(params.run_verification));
  }
  if (params.run_fit_evaluation !== undefined) {
    form.append("run_fit_evaluation", String(params.run_fit_evaluation));
  }
  if (params.max_accounts_for_buyer_research !== undefined) {
    form.append(
      "max_accounts_for_buyer_research",
      String(params.max_accounts_for_buyer_research)
    );
  }

  const res = await fetch("/api/tracer/run-pipeline-upload", {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`Pipeline failed (${res.status}): ${errText}`);
  }
  return (await res.json()) as PipelineTraceResponse;
}
