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

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export const icps: IcpDefinition[] = [
  {
    id: "icp_1",
    name: "Mid-market fintech, US, Series B+",
    description: "US-based fintech companies, 100–1000 employees, raised Series B or later, using legacy payment infra.",
    criteria: ["Industry: Fintech", "HQ: United States", "Employees: 100–1000", "Funding: Series B+", "Signal: legacy payment stack"],
    matchingAccounts: 428,
    createdAt: daysAgo(60),
  },
  {
    id: "icp_2",
    name: "Enterprise healthcare IT",
    description: "Healthcare technology vendors and providers with active compliance modernization initiatives.",
    criteria: ["Industry: Healthcare IT", "Employees: 1000+", "Signal: compliance hiring", "Signal: EHR migration"],
    matchingAccounts: 156,
    createdAt: daysAgo(34),
  },
  {
    id: "icp_3",
    name: "High-growth SaaS, EMEA",
    description: "European SaaS companies with recent leadership changes in revenue functions.",
    criteria: ["Industry: SaaS", "Region: EMEA", "Signal: new CRO/VP Sales", "Growth: >30% YoY"],
    matchingAccounts: 211,
    createdAt: daysAgo(12),
  },
];

export const accounts: Account[] = [
  {
    id: "acc_1", name: "Northbridge Financial", domain: "northbridgefin.com", industry: "Fintech",
    employeeRange: "250-500", hqLocation: "Austin, TX", logoInitial: "N", stage: "outreach_ready",
    health: "on_track", fitScore: 92, confidence: "high", icpId: "icp_1", icpName: "Mid-market fintech, US, Series B+",
    daysInStage: 2, discoveredAt: daysAgo(21), lastActivityAt: hoursAgo(3), ownerName: "Priya Shah",
    discoveryReasons: ["Raised $48M Series C", "Hiring 6 payments engineers", "Uses legacy ACH provider"],
    tags: ["high-fit", "warm-signal"],
  },
  {
    id: "acc_2", name: "Cascade Health Systems", domain: "cascadehealthsys.com", industry: "Healthcare IT",
    employeeRange: "1000-5000", hqLocation: "Denver, CO", logoInitial: "C", stage: "qualified",
    health: "on_track", fitScore: 87, confidence: "high", icpId: "icp_2", icpName: "Enterprise healthcare IT",
    daysInStage: 4, discoveredAt: daysAgo(30), lastActivityAt: hoursAgo(8), ownerName: "Priya Shah",
    discoveryReasons: ["Posted 4 HIPAA compliance roles", "Migrating EHR platform in Q3"],
    tags: ["enterprise"],
  },
  {
    id: "acc_3", name: "Verdant Logistics", domain: "verdantlogistics.io", industry: "Supply Chain",
    employeeRange: "500-1000", hqLocation: "Chicago, IL", logoInitial: "V", stage: "researched",
    health: "on_track", fitScore: 74, confidence: "medium", icpId: "icp_1", icpName: "Mid-market fintech, US, Series B+",
    daysInStage: 1, discoveredAt: daysAgo(9), lastActivityAt: hoursAgo(1), ownerName: "Marcus Webb",
    discoveryReasons: ["Expanding treasury operations", "RFP signal detected"],
    tags: ["needs-review"],
  },
  {
    id: "acc_4", name: "Lumen & Co.", domain: "lumenandco.com", industry: "SaaS",
    employeeRange: "100-250", hqLocation: "Dublin, IE", logoInitial: "L", stage: "buyer_identified",
    health: "on_track", fitScore: 81, confidence: "high", icpId: "icp_3", icpName: "High-growth SaaS, EMEA",
    daysInStage: 3, discoveredAt: daysAgo(14), lastActivityAt: hoursAgo(6), ownerName: "Marcus Webb",
    discoveryReasons: ["New CRO hired 6 weeks ago", "38% YoY headcount growth"],
    tags: [],
  },
  {
    id: "acc_5", name: "Ferro Industrial", domain: "ferroindustrial.com", industry: "Manufacturing",
    employeeRange: "1000-5000", hqLocation: "Pittsburgh, PA", logoInitial: "F", stage: "engaged",
    health: "on_track", fitScore: 79, confidence: "medium", icpId: "icp_1", icpName: "Mid-market fintech, US, Series B+",
    daysInStage: 6, discoveredAt: daysAgo(40), lastActivityAt: hoursAgo(2), ownerName: "Priya Shah",
    discoveryReasons: ["Modernizing supplier payments"],
    tags: ["engaged"],
  },
  {
    id: "acc_6", name: "Solace Biotech", domain: "solacebiotech.com", industry: "Healthcare IT",
    employeeRange: "500-1000", hqLocation: "Boston, MA", logoInitial: "S", stage: "nurture",
    health: "stalled", fitScore: 68, confidence: "medium", icpId: "icp_2", icpName: "Enterprise healthcare IT",
    daysInStage: 18, discoveredAt: daysAgo(55), lastActivityAt: daysAgo(12), ownerName: "Marcus Webb",
    discoveryReasons: ["Compliance audit scheduled Q4"],
    tags: ["stalled"],
  },
  {
    id: "acc_7", name: "Alder Point Bank", domain: "alderpointbank.com", industry: "Fintech",
    employeeRange: "250-500", hqLocation: "Charlotte, NC", logoInitial: "A", stage: "verified",
    health: "needs_review", fitScore: 58, confidence: "low", icpId: "icp_1", icpName: "Mid-market fintech, US, Series B+",
    daysInStage: 1, discoveredAt: daysAgo(3), lastActivityAt: hoursAgo(5), ownerName: undefined,
    discoveryReasons: ["Regional bank digital transformation initiative"],
    tags: ["low-confidence"],
  },
  {
    id: "acc_8", name: "Meridian Freightworks", domain: "meridianfreight.com", industry: "Supply Chain",
    employeeRange: "1000-5000", hqLocation: "Memphis, TN", logoInitial: "M", stage: "discovered",
    health: "on_track", fitScore: 71, confidence: "medium", icpId: "icp_1", icpName: "Mid-market fintech, US, Series B+",
    daysInStage: 0, discoveredAt: hoursAgo(4), lastActivityAt: hoursAgo(4), ownerName: undefined,
    discoveryReasons: ["Recent ERP migration announced", "Hiring FP&A leadership"],
    tags: ["new"],
  },
  {
    id: "acc_9", name: "Halcyon Data Systems", domain: "halcyondata.com", industry: "SaaS",
    employeeRange: "250-500", hqLocation: "London, UK", logoInitial: "H", stage: "next_action",
    health: "on_track", fitScore: 84, confidence: "high", icpId: "icp_3", icpName: "High-growth SaaS, EMEA",
    daysInStage: 1, discoveredAt: daysAgo(25), lastActivityAt: hoursAgo(1), ownerName: "Priya Shah",
    discoveryReasons: ["Champion went quiet after demo", "New VP Sales joined"],
    tags: ["hot"],
  },
  {
    id: "acc_10", name: "Brightline Payments", domain: "brightlinepay.com", industry: "Fintech",
    employeeRange: "500-1000", hqLocation: "San Francisco, CA", logoInitial: "B", stage: "discovered",
    health: "disqualified", fitScore: 34, confidence: "low", icpId: "icp_1", icpName: "Mid-market fintech, US, Series B+",
    daysInStage: 2, discoveredAt: daysAgo(2), lastActivityAt: daysAgo(1), ownerName: undefined,
    discoveryReasons: ["Already on modern payment stack"],
    tags: ["disqualified"],
  },
];

export const evidenceByAccount: Record<string, EvidenceItem[]> = {
  acc_1: [
    { id: "ev_1", claim: "Raised $48M Series C led by Bessemer in June 2026", sourceName: "TechCrunch", sourceUrl: "#", confidence: "high", collectedAt: daysAgo(20), moduleId: "account_research" },
    { id: "ev_2", claim: "Posted 6 open roles for payments infrastructure engineers", sourceName: "LinkedIn Jobs", sourceUrl: "#", confidence: "high", collectedAt: daysAgo(18), moduleId: "account_research" },
    { id: "ev_3", claim: "Currently integrated with a legacy ACH processor per job description references", sourceName: "Job posting analysis", sourceUrl: "#", confidence: "medium", collectedAt: daysAgo(18), moduleId: "account_research" },
    { id: "ev_4", claim: "CFO mentioned 'modernizing our money movement stack' in earnings call", sourceName: "Earnings call transcript", sourceUrl: "#", confidence: "high", collectedAt: daysAgo(15), moduleId: "account_research" },
  ],
  acc_2: [
    { id: "ev_5", claim: "4 HIPAA / compliance-focused roles posted in the last 30 days", sourceName: "LinkedIn Jobs", sourceUrl: "#", confidence: "high", collectedAt: daysAgo(25), moduleId: "account_research" },
    { id: "ev_6", claim: "Announced EHR platform migration targeted for Q3", sourceName: "Company press release", sourceUrl: "#", confidence: "high", collectedAt: daysAgo(22), moduleId: "account_research" },
  ],
};

export const icpFitByAccount: Record<string, IcpCriterionScore[]> = {
  acc_1: [
    { criterion: "Industry: Fintech", weight: 0.25, score: 100, confidence: "high", evidenceIds: [] },
    { criterion: "HQ: United States", weight: 0.15, score: 100, confidence: "high", evidenceIds: [] },
    { criterion: "Employees: 100-1000", weight: 0.2, score: 100, confidence: "high", evidenceIds: ["ev_1"] },
    { criterion: "Funding: Series B+", weight: 0.2, score: 100, confidence: "high", evidenceIds: ["ev_1"] },
    { criterion: "Signal: legacy payment stack", weight: 0.2, score: 65, confidence: "medium", evidenceIds: ["ev_3", "ev_4"] },
  ],
  acc_7: [
    { criterion: "Industry: Fintech", weight: 0.25, score: 100, confidence: "high", evidenceIds: [] },
    { criterion: "HQ: United States", weight: 0.15, score: 100, confidence: "high", evidenceIds: [] },
    { criterion: "Employees: 100-1000", weight: 0.2, score: 80, confidence: "medium", evidenceIds: [] },
    { criterion: "Funding: Series B+", weight: 0.2, score: 0, confidence: "low", evidenceIds: [] },
    { criterion: "Signal: legacy payment stack", weight: 0.2, score: 40, confidence: "low", evidenceIds: [] },
  ],
};

export const buyersByAccount: Record<string, Buyer[]> = {
  acc_1: [
    { id: "b_1", accountId: "acc_1", name: "Elena Voss", title: "VP of Engineering", seniority: "VP", relevanceScore: 91, email: "e.voss@northbridgefin.com", linkedinUrl: "#", engagementState: "not_contacted" },
    { id: "b_2", accountId: "acc_1", name: "David Ahn", title: "CFO", seniority: "C-Level", relevanceScore: 88, email: "d.ahn@northbridgefin.com", linkedinUrl: "#", engagementState: "not_contacted" },
    { id: "b_3", accountId: "acc_1", name: "Rosa Ibarra", title: "Director of Payments", seniority: "Director", relevanceScore: 84, linkedinUrl: "#", engagementState: "not_contacted" },
  ],
  acc_5: [
    { id: "b_4", accountId: "acc_5", name: "Tom Reilly", title: "VP Procurement", seniority: "VP", relevanceScore: 79, email: "t.reilly@ferroindustrial.com", engagementState: "replied" },
  ],
  acc_9: [
    { id: "b_5", accountId: "acc_9", name: "Freya Lindqvist", title: "VP Sales", seniority: "VP", relevanceScore: 90, email: "f.lindqvist@halcyondata.com", engagementState: "meeting_booked" },
  ],
};

export const qualificationByAccount: Record<string, QualificationCriterion[]> = {
  acc_2: [
    { id: "q_1", label: "Budget authority identified", status: "met", agentRationale: "CFO office confirmed as budget holder via org chart analysis.", evidenceIds: [], humanOverride: null },
    { id: "q_2", label: "Active initiative within 2 quarters", status: "met", agentRationale: "EHR migration publicly announced for Q3.", evidenceIds: ["ev_6"], humanOverride: null },
    { id: "q_3", label: "Compliance mandate present", status: "met", agentRationale: "4 HIPAA-related roles posted, indicating active compliance investment.", evidenceIds: ["ev_5"], humanOverride: null },
    { id: "q_4", label: "No competing vendor contract lock-in", status: "unclear", agentRationale: "No public signal found either way; recommend confirming with buyer directly.", evidenceIds: [], humanOverride: null },
  ],
};

export const outreachByAccount: Record<string, OutreachMessage[]> = {
  acc_1: [
    { id: "om_1", accountId: "acc_1", buyerId: "b_1", channel: "email", subject: "Modernizing payment ops at Northbridge", body: "Hi Elena — noticed the team is scaling payments infra post-Series C...", status: "pending_approval" },
  ],
  acc_5: [
    { id: "om_2", accountId: "acc_5", buyerId: "b_4", channel: "email", subject: "Re: supplier payment modernization", body: "Tom, great speaking earlier — sending over the case study we discussed...", status: "sent", sentAt: daysAgo(2), sentiment: "positive" },
  ],
};

export const objectionsByAccount: Record<string, Objection[]> = {
  acc_5: [
    { id: "obj_1", accountId: "acc_5", raisedBy: "Tom Reilly", category: "Pricing", text: "This feels like a big jump from what we're paying today.", agentResponse: "Drafted ROI comparison showing 14-month payback based on current manual reconciliation costs.", status: "pending_approval", raisedAt: hoursAgo(20) },
  ],
};

export const agentTasks: AgentTask[] = [
  { id: "t_1", accountId: "acc_1", accountName: "Northbridge Financial", moduleId: "personalized_outreach", title: "Drafted outreach email for Elena Voss", status: "needs_review", startedAt: hoursAgo(3), finishedAt: hoursAgo(3), reasoning: "Referenced Series C raise and payments hiring signal to establish relevance.", sourcesConsulted: 4, confidence: "high", outputSummary: "1 email draft awaiting approval" },
  { id: "t_2", accountId: "acc_3", accountName: "Verdant Logistics", moduleId: "account_research", title: "Compiled pain-point research", status: "done", startedAt: hoursAgo(2), finishedAt: hoursAgo(1), reasoning: "Cross-referenced RFP signal with treasury team expansion to infer active evaluation.", sourcesConsulted: 7, confidence: "medium", outputSummary: "6 evidence items collected" },
  { id: "t_3", accountId: "acc_7", accountName: "Alder Point Bank", moduleId: "icp_discovery", title: "Verification run", status: "needs_review", startedAt: hoursAgo(5), finishedAt: hoursAgo(5), reasoning: "Funding stage could not be confirmed from public sources; fit score capped pending manual check.", sourcesConsulted: 3, confidence: "low", outputSummary: "Low-confidence verification" },
  { id: "t_4", accountId: "acc_9", accountName: "Halcyon Data Systems", moduleId: "next_best_action", title: "Recommended re-engagement sequence", status: "running", startedAt: hoursAgo(1) },
  { id: "t_5", accountId: "acc_5", accountName: "Ferro Industrial", moduleId: "objection_handling", title: "Drafted response to pricing objection", status: "needs_review", startedAt: hoursAgo(20), finishedAt: hoursAgo(19), reasoning: "Built ROI model from account's stated reconciliation headcount.", sourcesConsulted: 2, confidence: "high", outputSummary: "1 response awaiting approval" },
  { id: "t_6", accountId: "acc_8", accountName: "Meridian Freightworks", moduleId: "icp_discovery", title: "Initial discovery scoring", status: "done", startedAt: hoursAgo(4), finishedAt: hoursAgo(4), sourcesConsulted: 5, confidence: "medium", outputSummary: "Fit score 71 assigned" },
  { id: "t_7", accountId: "acc_2", accountName: "Cascade Health Systems", moduleId: "qualification", title: "Qualification checklist evaluated", status: "done", startedAt: hoursAgo(8), finishedAt: hoursAgo(8), sourcesConsulted: 6, confidence: "high", outputSummary: "3 of 4 criteria met" },
  { id: "t_8", accountId: "acc_10", accountName: "Brightline Payments", moduleId: "compliance_quality", title: "Pre-outreach compliance scan", status: "error", startedAt: hoursAgo(10), finishedAt: hoursAgo(10), reasoning: "Could not verify consent basis for stored contact records.", outputSummary: "Blocking flag raised" },
];

export const approvalQueue: ApprovalItem[] = [
  { id: "ap_1", accountId: "acc_1", accountName: "Northbridge Financial", moduleId: "personalized_outreach", kind: "outreach_email", title: "Approve outreach email to Elena Voss", description: "AI-drafted introduction referencing the Series C raise and payments hiring signal.", payloadPreview: "Hi Elena — noticed the team is scaling payments infra post-Series C...", createdAt: hoursAgo(3), urgency: "normal" },
  { id: "ap_2", accountId: "acc_7", accountName: "Alder Point Bank", moduleId: "icp_discovery", kind: "stage_advance", title: "Confirm verification for Alder Point Bank", description: "Low-confidence funding-stage signal — verify manually before advancing.", createdAt: hoursAgo(5), urgency: "high" },
  { id: "ap_3", accountId: "acc_5", accountName: "Ferro Industrial", moduleId: "objection_handling", kind: "objection_response", title: "Approve pricing objection response", description: "ROI comparison drafted in response to Tom Reilly's pricing concern.", createdAt: hoursAgo(19), urgency: "high" },
  { id: "ap_4", accountId: "acc_10", accountName: "Brightline Payments", moduleId: "compliance_quality", kind: "compliance_hold", title: "Resolve compliance hold before outreach", description: "Consent basis for stored contact records could not be verified.", createdAt: hoursAgo(10), urgency: "high" },
  { id: "ap_5", accountId: "acc_2", accountName: "Cascade Health Systems", moduleId: "qualification", kind: "qualification_verdict", title: "Confirm qualification verdict", description: "3 of 4 criteria met automatically; one marked unclear and needs a human read.", createdAt: hoursAgo(8), urgency: "normal" },
];

export const moduleStatuses: ModuleStatus[] = [
  { id: "icp_discovery", status: "active", lastRunAt: hoursAgo(1), runsToday: 14, successRate: 96, avgDurationSec: 145, dependsOn: [] },
  { id: "buyer_identification", status: "active", lastRunAt: hoursAgo(2), runsToday: 9, successRate: 94, avgDurationSec: 62, dependsOn: ["icp_discovery"] },
  { id: "account_research", status: "active", lastRunAt: hoursAgo(1), runsToday: 11, successRate: 91, avgDurationSec: 210, dependsOn: ["icp_discovery"] },
  { id: "personalized_outreach", status: "active", lastRunAt: hoursAgo(3), runsToday: 6, successRate: 98, avgDurationSec: 38, dependsOn: ["account_research", "buyer_identification"] },
  { id: "qualification", status: "idle", lastRunAt: hoursAgo(8), runsToday: 3, successRate: 100, avgDurationSec: 90, dependsOn: ["account_research"] },
  { id: "nurture_followup", status: "idle", lastRunAt: daysAgo(1), runsToday: 1, successRate: 100, avgDurationSec: 20, dependsOn: ["qualification"] },
  { id: "sales_intelligence", status: "active", lastRunAt: hoursAgo(6), runsToday: 2, successRate: 100, avgDurationSec: 300, dependsOn: [] },
  { id: "objection_handling", status: "active", lastRunAt: hoursAgo(19), runsToday: 2, successRate: 100, avgDurationSec: 45, dependsOn: ["account_research"] },
  { id: "next_best_action", status: "active", lastRunAt: hoursAgo(1), runsToday: 18, successRate: 97, avgDurationSec: 12, dependsOn: ["qualification", "sales_intelligence"] },
  { id: "crm_integration", status: "degraded", lastRunAt: hoursAgo(1), runsToday: 40, successRate: 88, avgDurationSec: 8, dependsOn: [] },
  { id: "compliance_quality", status: "error", lastRunAt: hoursAgo(10), runsToday: 5, successRate: 80, avgDurationSec: 15, dependsOn: [] },
  { id: "outcomes_icp_optimization", status: "idle", lastRunAt: daysAgo(3), runsToday: 0, successRate: 100, avgDurationSec: 400, dependsOn: ["icp_discovery"] },
];

export const complianceFlags: ComplianceFlag[] = [
  { id: "cf_1", accountId: "acc_10", accountName: "Brightline Payments", rule: "Consent basis required before outreach", severity: "blocking", detail: "No verifiable consent basis found for stored contact records in this region.", createdAt: hoursAgo(10), status: "open" },
  { id: "cf_2", accountId: "acc_6", accountName: "Solace Biotech", rule: "Data retention window exceeded", severity: "warning", detail: "Account research data collected 90+ days ago; refresh recommended before next outreach.", createdAt: daysAgo(2), status: "open" },
];

export const crmSyncStatus: CrmSyncStatus = {
  provider: "Salesforce",
  connected: true,
  lastSyncAt: hoursAgo(0.1),
  recordsSynced: 1284,
  errors: 3,
};

export const outcomeRecords: OutcomeRecord[] = [
  { id: "or_1", accountId: "acc_x1", accountName: "Portside Capital", outcome: "won", closedAt: daysAgo(10), dealValue: 84000, icpCriteriaMatched: ["Industry: Fintech", "Funding: Series B+", "Signal: legacy payment stack"], icpCriteriaMissed: [] },
  { id: "or_2", accountId: "acc_x2", accountName: "Ironclad Mutual", outcome: "lost", closedAt: daysAgo(18), icpCriteriaMatched: ["Industry: Fintech", "HQ: United States"], icpCriteriaMissed: ["Funding: Series B+", "Signal: legacy payment stack"] },
  { id: "or_3", accountId: "acc_x3", accountName: "Beacon Underwriting", outcome: "won", closedAt: daysAgo(26), dealValue: 62000, icpCriteriaMatched: ["Industry: Fintech", "Employees: 100-1000", "Funding: Series B+"], icpCriteriaMissed: [] },
];

export const dashboardMetrics: DashboardMetrics = {
  totalAccounts: 1042,
  activeDiscoveryRuns: 2,
  qualifiedThisWeek: 18,
  avgTimeInStageDays: 4.2,
  agentSuccessRate: 94,
  funnel: [
    { stage: "discovered", count: 412, deltaThisWeek: 38 },
    { stage: "verified", count: 288, deltaThisWeek: 21 },
    { stage: "qualified", count: 154, deltaThisWeek: 12 },
    { stage: "buyer_identified", count: 121, deltaThisWeek: 9 },
    { stage: "researched", count: 98, deltaThisWeek: 7 },
    { stage: "outreach_ready", count: 64, deltaThisWeek: 5 },
    { stage: "engaged", count: 41, deltaThisWeek: 4 },
    { stage: "nurture", count: 27, deltaThisWeek: -2 },
    { stage: "next_action", count: 19, deltaThisWeek: 3 },
  ],
};
