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
