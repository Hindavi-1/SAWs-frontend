/**
 * Domain model for SAWFs (Sales Agentic Workflows).
 *
 * These types are the contract between the UI and the backend. Every mock
 * data file and every API adapter function in `lib/api.ts` returns data
 * shaped exactly like this, so swapping the mock adapter for real HTTP
 * calls later does not require touching any component.
 */

/** The 12 backend modules/agents. Used for Module Ops tracking and for
 * tagging which module produced a given piece of evidence or activity. */
export type ModuleId =
  | "icp_discovery"
  | "buyer_identification"
  | "account_research"
  | "personalized_outreach"
  | "qualification"
  | "nurture_followup"
  | "sales_intelligence"
  | "objection_handling"
  | "next_best_action"
  | "crm_integration"
  | "compliance_quality"
  | "outcomes_icp_optimization";

export const MODULE_LABELS: Record<ModuleId, string> = {
  icp_discovery: "ICP & Account Discovery",
  buyer_identification: "Buyer Identification",
  account_research: "Account Understanding & Research",
  personalized_outreach: "Personalized Outreach",
  qualification: "Qualification",
  nurture_followup: "Nurture & Follow-up",
  sales_intelligence: "Sales Intelligence",
  objection_handling: "Objection Handling",
  next_best_action: "Next-Best Action",
  crm_integration: "CRM Integration",
  compliance_quality: "Compliance & Quality Checks",
  outcomes_icp_optimization: "Customer Outcomes & ICP Optimization",
};

/** Linear funnel stages. Cross-cutting modules (compliance, CRM, etc.) are
 * intentionally not represented as stages — they act across all of them. */
export type FunnelStage =
  | "discovered"
  | "verified"
  | "qualified"
  | "buyer_identified"
  | "researched"
  | "outreach_ready"
  | "engaged"
  | "nurture"
  | "next_action";

export const FUNNEL_STAGES: FunnelStage[] = [
  "discovered",
  "verified",
  "qualified",
  "buyer_identified",
  "researched",
  "outreach_ready",
  "engaged",
  "nurture",
  "next_action",
];

export const STAGE_LABELS: Record<FunnelStage, string> = {
  discovered: "Discovered",
  verified: "Verified",
  qualified: "Qualified",
  buyer_identified: "Buyer Identified",
  researched: "Researched",
  outreach_ready: "Outreach Ready",
  engaged: "Engaged",
  nurture: "Nurture",
  next_action: "Next Action",
};

/** Whether a transition into a stage happens automatically once agents
 * are confident enough, or requires an explicit human approval. */
export const STAGE_GATED: Record<FunnelStage, boolean> = {
  discovered: false,
  verified: false,
  qualified: true,
  buyer_identified: false,
  researched: false,
  outreach_ready: true,
  engaged: false,
  nurture: false,
  next_action: false,
};

export type ConfidenceLevel = "high" | "medium" | "low";

export type AccountHealth = "on_track" | "stalled" | "disqualified" | "needs_review";

export interface Account {
  id: string;
  name: string;
  domain: string;
  industry: string;
  employeeRange: string;
  hqLocation: string;
  logoInitial: string;
  stage: FunnelStage;
  health: AccountHealth;
  fitScore: number; // 0-100
  confidence: ConfidenceLevel;
  icpId: string;
  icpName: string;
  daysInStage: number;
  discoveredAt: string; // ISO date
  lastActivityAt: string; // ISO date
  ownerName?: string;
  discoveryReasons: string[];
  tags: string[];
}

export interface EvidenceItem {
  id: string;
  claim: string;
  sourceName: string;
  sourceUrl?: string;
  confidence: ConfidenceLevel;
  collectedAt: string;
  moduleId: ModuleId;
}

export interface IcpCriterionScore {
  criterion: string;
  weight: number; // 0-1
  score: number; // 0-100
  confidence: ConfidenceLevel;
  evidenceIds: string[];
}

export interface Buyer {
  id: string;
  accountId: string;
  name: string;
  title: string;
  seniority: "C-Level" | "VP" | "Director" | "Manager" | "IC";
  relevanceScore: number;
  email?: string;
  linkedinUrl?: string;
  engagementState: "not_contacted" | "contacted" | "replied" | "meeting_booked" | "unresponsive";
}

export type QualificationVerdict = "qualified" | "not_qualified" | "needs_review";

export interface QualificationCriterion {
  id: string;
  label: string;
  status: "met" | "unmet" | "unclear";
  agentRationale: string;
  humanOverride?: "met" | "unmet" | null;
  evidenceIds: string[];
}

export interface OutreachMessage {
  id: string;
  accountId: string;
  buyerId: string;
  channel: "email" | "linkedin" | "call_script";
  subject?: string;
  body: string;
  status: "draft" | "pending_approval" | "sent" | "replied" | "bounced";
  sentAt?: string;
  sentiment?: "positive" | "neutral" | "negative";
}

export interface Objection {
  id: string;
  accountId: string;
  raisedBy: string;
  category: string;
  text: string;
  agentResponse: string;
  status: "pending_approval" | "resolved" | "escalated";
  raisedAt: string;
}

export type AgentTaskStatus = "queued" | "running" | "done" | "error" | "needs_review";

export interface AgentTask {
  id: string;
  accountId?: string;
  accountName?: string;
  moduleId: ModuleId;
  title: string;
  status: AgentTaskStatus;
  startedAt: string;
  finishedAt?: string;
  reasoning?: string;
  sourcesConsulted?: number;
  confidence?: ConfidenceLevel;
  outputSummary?: string;
}

export interface ApprovalItem {
  id: string;
  accountId: string;
  accountName: string;
  moduleId: ModuleId;
  kind: "outreach_email" | "qualification_verdict" | "stage_advance" | "objection_response" | "compliance_hold";
  title: string;
  description: string;
  payloadPreview?: string;
  createdAt: string;
  urgency: "normal" | "high";
}

export interface ModuleStatus {
  id: ModuleId;
  status: "active" | "idle" | "degraded" | "error";
  lastRunAt: string;
  runsToday: number;
  successRate: number; // 0-100
  avgDurationSec: number;
  dependsOn: ModuleId[];
}

export interface IcpDefinition {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  matchingAccounts: number;
  createdAt: string;
}

export interface FunnelStageCount {
  stage: FunnelStage;
  count: number;
  deltaThisWeek: number;
}

export interface DashboardMetrics {
  totalAccounts: number;
  activeDiscoveryRuns: number;
  qualifiedThisWeek: number;
  avgTimeInStageDays: number;
  agentSuccessRate: number;
  funnel: FunnelStageCount[];
}

export interface ComplianceFlag {
  id: string;
  accountId: string;
  accountName: string;
  rule: string;
  severity: "blocking" | "warning";
  detail: string;
  createdAt: string;
  status: "open" | "resolved";
}

export interface CrmSyncStatus {
  provider: string;
  connected: boolean;
  lastSyncAt: string;
  recordsSynced: number;
  errors: number;
}

export interface OutcomeRecord {
  id: string;
  accountId: string;
  accountName: string;
  outcome: "won" | "lost";
  closedAt: string;
  dealValue?: number;
  icpCriteriaMatched: string[];
  icpCriteriaMissed: string[];
}

// ── Module Pipeline Trace (M01 → M08 I/O Inspector) ─────────────
export type ModuleTraceStatus = "success" | "skipped" | "error" | "not_implemented" | "pending";
export type PipelineStatus = "success" | "partial" | "error";

export interface ModuleTrace {
  module_id: string;
  module_name: string;
  status: ModuleTraceStatus;
  timestamp: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  error?: string | null;
  traceback?: string | null;
  duration_ms?: number | null;
}

export interface PipelineTraceResponse {
  pipeline_id: string;
  started_at: string;
  completed_at: string;
  total_duration_ms: number;
  status: PipelineStatus;
  modules: ModuleTrace[];
  summary: Record<string, unknown>;
}

export interface PipelineRunRequest {
  raw_icp_text?: string;
  icp_file_path?: string;
  canonical_icp?: Record<string, unknown>;
  run_verification?: boolean;
  run_fit_evaluation?: boolean;
  max_accounts_for_buyer_research?: number;
}

export const PIPELINE_MODULE_ORDER = [
  "m01_icp_management",
  "m02_account_discovery",
  "m03_verification",
  "m04_fit_evaluation",
  "m05_buyer_identification",
  "m06_account_understanding",
  "m07_personalized_outreach",
  "m08_qualification",
] as const;

export const PIPELINE_MODULE_META: Record<string, { step: string; icon: string; description: string }> = {
  m01_icp_management: {
    step: "01",
    icon: "🎯",
    description: "Parse raw ICP description into structured Canonical ICP schema.",
  },
  m02_account_discovery: {
    step: "02",
    icon: "🔍",
    description: "Run AI web search to discover candidate accounts matching the ICP.",
  },
  m03_verification: {
    step: "03",
    icon: "✅",
    description: "Fact-check each account against live web data for accuracy.",
  },
  m04_fit_evaluation: {
    step: "04",
    icon: "📊",
    description: "Score each account against the ICP across weighted fit dimensions.",
  },
  m05_buyer_identification: {
    step: "05",
    icon: "👤",
    description: "Find key decision makers and enrich with contact intelligence.",
  },
  m06_account_understanding: {
    step: "06",
    icon: "📚",
    description: "Deep research: news, tech stack, pain points, competitors, talking points.",
  },
  m07_personalized_outreach: {
    step: "07",
    icon: "✉️",
    description: "Generate multi-channel outreach sequences (email, LinkedIn, call script).",
  },
  m08_qualification: {
    step: "08",
    icon: "🎖️",
    description: "MEDDPICC / BANT / SPICED qualification scorecard + deal gaps.",
  },
};
