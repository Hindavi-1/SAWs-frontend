"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceList } from "@/components/features/evidence-list";
import type { EvidenceItem } from "@/lib/types";
import * as api from "@/lib/api";
import {
  Sparkles,
  Loader2,
  Newspaper,
  Layers,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface AccountResearchTabProps {
  accountId: string;
  accountName: string;
  evidence: EvidenceItem[];
  onResearchUpdated?: () => void;
}

export function AccountResearchTab({
  accountId,
  accountName,
  evidence,
  onResearchUpdated,
}: AccountResearchTabProps) {
  const [dossier, setDossier] = React.useState<any | null>(null);
  const [loadingDossier, setLoadingDossier] = React.useState(true);
  const [isResearching, setIsResearching] = React.useState(false);

  const loadDossier = React.useCallback(async () => {
    setLoadingDossier(true);
    try {
      const data = await api.getAccountDossier(accountId);
      setDossier(data);
    } catch (err) {
      console.warn("Failed to fetch dossier:", err);
    } finally {
      setLoadingDossier(false);
    }
  }, [accountId]);

  React.useEffect(() => {
    loadDossier();
  }, [loadDossier]);

  const handleRunResearch = async () => {
    setIsResearching(true);
    toast.info("Researching account", {
      description: `Conducting deep qualitative research for ${accountName} (M06)...`,
    });
    try {
      const res = await api.researchAccount(accountId);
      if (res?.dossier) {
        setDossier(res.dossier);
      } else {
        await loadDossier();
      }
      toast.success("Account research complete", {
        description: `Synthesized intelligence dossier and extracted buying signals for ${accountName}`,
      });
      onResearchUpdated?.();
    } catch (err: any) {
      console.error("Research failed:", err);
      toast.error("Research failed", {
        description: err?.message || "Could not complete account research. Check backend logs.",
      });
    } finally {
      setIsResearching(false);
    }
  };

  const hasDossier = !!dossier;
  const newsSignals = dossier?.recent_news_signals || [];
  const techStack = dossier?.technology_stack || [];
  const painPoints = dossier?.pain_points || [];
  const talkingPoints = dossier?.talking_points || [];

  return (
    <div className="space-y-5">
      {/* Action Header Card */}
      <Card className="p-4 border-border-default bg-raised">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent-500">
                Module 06 · Account Understanding
              </span>
              {hasDossier && (
                <span className="inline-flex items-center gap-1 rounded-full bg-positive-500/10 px-2 py-0.5 text-[10px] font-medium text-positive-600 dark:text-positive-400 border border-positive-500/20">
                  <CheckCircle2 className="h-3 w-3" /> Dossier Active
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-bold text-text-primary">
              Strategic Intelligence Dossier
            </p>
            <p className="text-xs text-text-tertiary">
              Deep-dive qualitative analysis, business model synthesis, pain signals, and tech stack mapping.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleRunResearch}
            disabled={isResearching}
            className="shrink-0"
          >
            {isResearching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {isResearching
              ? "Synthesizing Dossier…"
              : hasDossier
              ? "Refresh Intelligence (M06)"
              : "Run Deep Research (M06)"}
          </Button>
        </div>
      </Card>

      {/* Empty State if no dossier and no evidence */}
      {!hasDossier && evidence.length === 0 && !loadingDossier && (
        <Card className="p-8 text-center border-border-default">
          <Building2 className="mx-auto h-8 w-8 text-text-tertiary mb-2 opacity-50" />
          <p className="text-sm font-medium text-text-primary">No Intelligence Dossier Generated Yet</p>
          <p className="text-xs text-text-tertiary mt-1 max-w-md mx-auto">
            Run Module 06 Account Understanding to gather recent news, identify operational pain points, map tech stack infrastructure, and formulate talking points.
          </p>
          <Button size="sm" className="mt-4" onClick={handleRunResearch} disabled={isResearching}>
            {isResearching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Run Deep Research (M06)
          </Button>
        </Card>
      )}

      {/* Company Overview & Business Model */}
      {hasDossier && (
        <Card className="p-4 border-border-default space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-accent-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Company Overview & Operations
            </h3>
          </div>
          {dossier.company_overview && (
            <p className="text-xs text-text-secondary leading-relaxed">
              {dossier.company_overview}
            </p>
          )}
          {dossier.business_model && (
            <div className="rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/40 p-2.5">
              <span className="font-semibold text-text-primary text-[11px]">Business Model: </span>
              <span className="text-text-secondary text-xs">{dossier.business_model}</span>
            </div>
          )}
        </Card>
      )}

      {/* Key Pain Points & Solution Fit */}
      {painPoints.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-caution-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Identified Pain Points & Solution Fit ({painPoints.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {painPoints.map((p: any, idx: number) => {
              const urgency = p.urgency || "medium";
              return (
                <Card
                  key={idx}
                  className="p-3.5 border-border-default hover:border-border-strong transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-text-primary">{p.pain_title || p.title || "Operational Pain"}</p>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded capitalize ${
                        urgency === "high"
                          ? "bg-risk-500/10 text-risk-600 dark:text-risk-400 border border-risk-500/20"
                          : urgency === "medium"
                          ? "bg-caution-500/10 text-caution-600 dark:text-caution-400 border border-caution-500/20"
                          : "bg-sunken text-text-tertiary"
                      }`}
                    >
                      {urgency} urgency
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {p.description}
                  </p>
                  {p.how_we_solve_it && (
                    <div className="rounded-[var(--radius-xs)] border border-accent-500/20 bg-accent-500/5 p-2 text-[11px] text-text-primary">
                      <span className="font-semibold text-accent-500">How we solve it: </span>
                      <span>{p.how_we_solve_it}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Discovered Technology Stack */}
      {techStack.length > 0 && (
        <Card className="p-4 border-border-default space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Discovered Technology Stack ({techStack.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {techStack.map((t: any, idx: number) => {
              const toolName = typeof t === "string" ? t : t.tool_name || t.name;
              const category = typeof t === "object" ? t.category : "";
              const isComp = typeof t === "object" && t.is_competitor;
              return (
                <div
                  key={idx}
                  className="rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/40 p-2 text-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-text-primary truncate">{toolName}</span>
                    {isComp && (
                      <span className="font-mono text-[9px] text-risk-600 dark:text-risk-400 bg-risk-500/10 px-1 rounded">
                        comp
                      </span>
                    )}
                  </div>
                  {category && (
                    <span className="text-[10px] text-text-tertiary font-mono truncate mt-0.5">
                      {category}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent News & Buying Signals */}
      {newsSignals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-accent-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Recent News & Triggers ({newsSignals.length})
            </h3>
          </div>
          <div className="space-y-2">
            {newsSignals.map((n: any, idx: number) => {
              const headline = typeof n === "string" ? n : n.headline || n.title;
              const summary = typeof n === "object" ? n.summary : "";
              const signalType = typeof n === "object" ? n.signal_type : "news";
              const relevance = typeof n === "object" ? n.relevance_to_sale : "";
              return (
                <Card key={idx} className="p-3.5 border-border-default space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-text-primary">{headline}</p>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sunken text-text-tertiary uppercase shrink-0">
                      {signalType}
                    </span>
                  </div>
                  {summary && (
                    <p className="text-xs text-text-secondary leading-relaxed">{summary}</p>
                  )}
                  {relevance && (
                    <p className="text-[11px] text-accent-600 dark:text-accent-400 font-medium">
                      💡 Sales Trigger: {relevance}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Talking Points */}
      {talkingPoints.length > 0 && (
        <Card className="p-4 border-border-default space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Recommended Sales Angles & Talking Points
            </h3>
          </div>
          <div className="space-y-2.5">
            {talkingPoints.map((tp: any, idx: number) => (
              <div
                key={idx}
                className="rounded-[var(--radius-sm)] border border-border-subtle bg-sunken/30 p-3 text-xs space-y-1"
              >
                <p className="font-bold text-text-primary">{tp.topic || `Angle 0${idx + 1}`}</p>
                {tp.opener && (
                  <p className="text-text-secondary">
                    <span className="font-medium text-text-tertiary">Opener: </span>
                    &ldquo;{tp.opener}&rdquo;
                  </p>
                )}
                {tp.bridge && (
                  <p className="text-text-secondary">
                    <span className="font-medium text-text-tertiary">Value Bridge: </span>
                    {tp.bridge}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Evidence Items Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Grounding Evidence & Citations ({evidence.length})
        </h3>
        <EvidenceList items={evidence} />
      </div>
    </div>
  );
}
