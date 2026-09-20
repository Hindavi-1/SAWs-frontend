import type { AccountHealth, ConfidenceLevel, FunnelStage, ModuleId } from "./types";

export const SIGNAL_CLASSES = {
  positive:
    "bg-positive-50 text-positive-600 border-positive-500/25 dark:bg-positive-500/10 dark:text-positive-400 dark:border-positive-500/20",
  caution:
    "bg-caution-50 text-caution-600 border-caution-500/25 dark:bg-caution-500/10 dark:text-caution-400 dark:border-caution-500/20",
  risk: "bg-risk-50 text-risk-600 border-risk-500/25 dark:bg-risk-500/10 dark:text-risk-400 dark:border-risk-500/20",
  progress:
    "bg-progress-50 text-progress-600 border-progress-500/25 dark:bg-progress-500/10 dark:text-progress-400 dark:border-progress-500/20",
  neutral:
    "bg-sunken text-text-secondary border-border-default dark:bg-sunken dark:text-text-secondary dark:border-border-default",
} as const;

export const CONFIDENCE_META: Record<ConfidenceLevel, { label: string; signal: keyof typeof SIGNAL_CLASSES }> = {
  high: { label: "High confidence", signal: "positive" },
  medium: { label: "Medium confidence", signal: "caution" },
  low: { label: "Low confidence", signal: "risk" },
};

export const HEALTH_META: Record<AccountHealth, { label: string; signal: keyof typeof SIGNAL_CLASSES }> = {
  on_track: { label: "On track", signal: "positive" },
  stalled: { label: "Stalled", signal: "caution" },
  disqualified: { label: "Disqualified", signal: "neutral" },
  needs_review: { label: "Needs review", signal: "risk" },
};

export const STAGE_RAMP: Record<FunnelStage, number> = {
  discovered: 1,
  verified: 2,
  qualified: 3,
  buyer_identified: 4,
  researched: 5,
  outreach_ready: 6,
  engaged: 7,
  nurture: 8,
  next_action: 8,
};

export const MODULE_SHORT: Record<ModuleId, string> = {
  icp_discovery: "Discovery",
  buyer_identification: "Buyer ID",
  account_research: "Research",
  personalized_outreach: "Outreach",
  qualification: "Qualification",
  nurture_followup: "Nurture",
  sales_intelligence: "Intelligence",
  objection_handling: "Objections",
  next_best_action: "Next Action",
  crm_integration: "CRM Sync",
  compliance_quality: "Compliance",
  outcomes_icp_optimization: "Outcomes",
};
