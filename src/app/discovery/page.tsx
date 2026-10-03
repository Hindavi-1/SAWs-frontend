"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccountCard } from "@/components/features/account-card";
import { EvidenceList } from "@/components/features/evidence-list";
import { Drawer } from "@/components/ui/drawer";
import { ConfidenceBadge } from "@/components/ui/badge";
import { RadialScore } from "@/components/ui/radial-score";
import * as api from "@/lib/api";
import { evidenceByAccount, icpFitByAccount } from "@/lib/mock-data";
import type { Account, IcpDefinition } from "@/lib/types";
import { CheckCircle2, ChevronDown, Loader2, Play, Sparkles, Table2, LayoutGrid, FileText, UploadCloud, Trash2, FileUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as React from "react";

const RUN_STEPS = ["Scanning data sources", "Scoring ICP fit", "Verifying signals", "Ranking results"];

export default function DiscoveryPage() {
  return (
    <React.Suspense fallback={null}>
      <DiscoveryPageInner />
    </React.Suspense>
  );
}

function DiscoveryPageInner() {
  const searchParams = useSearchParams();
  const autoRunParam = searchParams.get("autoRun");

  const [icpMode, setIcpMode] = React.useState<"existing" | "text" | "upload">("existing");
  const [icps, setIcps] = React.useState<IcpDefinition[]>([]);
  const [selectedIcpId, setSelectedIcpId] = React.useState<string | null>(null);
  const [icpText, setIcpText] = React.useState("");
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [isGeneratingText, setIsGeneratingText] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [runState, setRunState] = React.useState<"idle" | "running" | "done">("idle");
  const [runStep, setRunStep] = React.useState(0);
  const [results, setResults] = React.useState<Account[]>([]);
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const [activeAccount, setActiveAccount] = React.useState<Account | null>(null);

  const loadInitialData = React.useCallback(async () => {
    const loadedIcps = await api.getIcps();
    setIcps(loadedIcps);
    if (loadedIcps.length > 0) {
      setSelectedIcpId(loadedIcps[0].id);
      setIcpMode("existing");
    } else {
      setIcpMode("text");
    }
    const loadedAccounts = await api.getAccounts();
    setResults(loadedAccounts);
    if (loadedAccounts.length > 0) {
      setRunState("done");
    }
    if (autoRunParam === "true") {
      setTimeout(() => {
        startRun();
      }, 500);
    }
  }, [autoRunParam]);

  React.useEffect(() => {
    loadInitialData();
    const handleUpdate = () => loadInitialData();
    window.addEventListener("sawf_product_updated", handleUpdate);
    return () => window.removeEventListener("sawf_product_updated", handleUpdate);
  }, [loadInitialData]);

  const handleAutoGenerateFromProduct = async () => {
    setIsGeneratingText(true);
    try {
      const prodsData = await api.getProducts();
      const activeProd =
        prodsData.products.find((p) => p.id === prodsData.activeProductId) ||
        prodsData.products[0];

      if (!activeProd) {
        toast.error("No active product details found.");
        return;
      }

      toast.info(`Generating ICP description from "${activeProd.name}"...`);

      const canonical = await api.generateICPFromProduct({
        productName: activeProd.name,
        productDescription: activeProd.description,
        targetMarket: activeProd.targetMarket,
        valueProposition: activeProd.valueProposition,
      });

      if (canonical) {
        const parts: string[] = [];
        if (canonical.icpName || canonical.description) {
          parts.push(`Target Segment: ${canonical.icpName || activeProd.name}`);
          parts.push(canonical.description || activeProd.description);
        }
        if (canonical.companyProfile?.industries?.length) {
          parts.push(`Industries: ${canonical.companyProfile.industries.join(", ")}`);
        }
        if (canonical.companyProfile?.employeeRange) {
          parts.push(
            `Company Size: ${canonical.companyProfile.employeeRange.min}–${canonical.companyProfile.employeeRange.max} employees`
          );
        }
        if (canonical.targetPersonas?.length) {
          const titles = canonical.targetPersonas
            .flatMap((p: any) => p.titles || [])
            .filter(Boolean)
            .join(", ");
          if (titles) parts.push(`Target Personas: ${titles}`);
        }
        if (canonical.buyingSignals?.length) {
          parts.push(`Buying Signals: ${canonical.buyingSignals.join("; ")}`);
        }

        const formattedText =
          parts.length > 0
            ? parts.join("\n\n")
            : `Targeting B2B organizations in need of ${activeProd.name}: ${activeProd.description}`;

        setIcpText(formattedText);
        toast.success(`ICP description auto-generated from product "${activeProd.name}"!`);
      } else {
        setIcpText(`Targeting B2B organizations for ${activeProd.name}: ${activeProd.description}`);
        toast.success("ICP description generated from active product.");
      }
    } catch (err) {
      console.error("Failed to generate ICP description:", err);
      toast.error("Failed to auto-generate ICP description from product.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const selectedIcp = icps.find((i) => i.id === selectedIcpId) || icps[0];
  const recentIcps = icps.slice(0, 3);

  async function startRun() {
    setRunState("running");
    setRunStep(0);
    const interval = setInterval(() => {
      setRunStep((prev) => (prev < RUN_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      if (icpMode === "existing" && selectedIcp) {
        await api.runPipelineTrace({
          raw_icp_text: selectedIcp.description || selectedIcp.name,
          canonical_icp: selectedIcp.rawCriteria,
        });
      } else if (icpMode === "upload" && uploadedFile) {
        await api.runPipelineTraceUpload({ icp_file: uploadedFile });
      } else if (icpText) {
        await api.runPipelineTrace({ raw_icp_text: icpText });
      }
    } catch (err) {
      console.error("Discovery run failed:", err);
    } finally {
      clearInterval(interval);
      setRunStep(RUN_STEPS.length - 1);
      const all = await api.getAccounts();
      setResults(all);
      setRunState("done");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sawf_pipeline_complete"));
      }
    }
  }

  const canRun =
    (icpMode === "existing" && !!selectedIcpId) ||
    (icpMode === "text" && icpText.trim().length > 0) ||
    (icpMode === "upload" && !!uploadedFile);

  return (
    <div>
      <PageHeader
        title="Account Discovery"
        description="Select an existing Ideal Customer Profile (ICP) or define a new one, run AI discovery, and review newly sourced target accounts."
      />

      <Card className="mb-5">
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-xl border border-border-subtle bg-sunken/70 p-1">
              <button
                type="button"
                onClick={() => setIcpMode("existing")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all",
                  icpMode === "existing"
                    ? "bg-raised text-text-primary shadow-sm"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-accent-500" />
                Use Existing ICP ({icps.length})
              </button>
              <button
                type="button"
                onClick={() => setIcpMode("text")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all",
                  icpMode === "text"
                    ? "bg-raised text-text-primary shadow-sm"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                <FileText className="h-3.5 w-3.5" />
                Enter Description
              </button>
              <button
                type="button"
                onClick={() => setIcpMode("upload")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all",
                  icpMode === "upload"
                    ? "bg-raised text-text-primary shadow-sm"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Upload Spec Document
              </button>
            </div>
          </div>

          {/* Mode 1: Existing ICP Selector */}
          {icpMode === "existing" && (
            <div className="space-y-4 animate-fade-in-up">
              {icps.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border-subtle bg-sunken/40 p-6 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-accent-500/60 mb-2" />
                  <p className="text-sm font-semibold text-text-primary">No ICP defined for this product yet</p>
                  <p className="text-xs text-text-tertiary mt-1 mb-4">
                    Enter a product description or upload an ICP document to create your first profile.
                  </p>
                  <Button size="sm" onClick={() => setIcpMode("text")}>
                    Enter Product Description
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                        Recently Used &amp; Active ICPs
                      </span>
                      <span className="text-[11px] text-text-tertiary font-mono">
                        {icps.length} profile{icps.length > 1 ? "s" : ""} registered
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {recentIcps.map((icp) => {
                        const isSelected = icp.id === selectedIcpId;
                        return (
                          <div
                            key={icp.id}
                            onClick={() => setSelectedIcpId(icp.id)}
                            className={cn(
                              "cursor-pointer rounded-xl border p-3.5 transition-all relative",
                              isSelected
                                ? "border-accent-500 bg-accent-500/5 shadow-sm ring-1 ring-accent-500/20"
                                : "border-border-subtle bg-sunken/40 hover:border-border-default hover:bg-sunken"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-text-primary line-clamp-1">{icp.name}</h4>
                              {isSelected && (
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-500 text-[9px] font-bold text-white">
                                  ✓
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[11px] text-text-tertiary line-clamp-2 leading-relaxed">
                              {icp.description || "Ideal Customer Profile for target outbound campaign."}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-text-tertiary font-mono">
                              <span>{icp.criteriaCount || 4} criteria</span>
                              <span>·</span>
                              <span>{icp.createdAt ? new Date(icp.createdAt).toLocaleDateString() : "Active"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected ICP Details Card */}
                  {selectedIcp && (
                    <div className="rounded-xl border border-accent-500/20 bg-sunken/60 p-4">
                      <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-accent-500" />
                          <span className="text-xs font-bold text-text-primary">Selected ICP Context</span>
                        </div>
                        <span className="rounded bg-accent-500/10 px-2 py-0.5 text-[10px] font-bold text-accent-500">
                          Ready for Discovery
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                        {selectedIcp.description}
                      </p>
                      {selectedIcp.rawCriteria?.companyProfile?.industries && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-text-tertiary uppercase mr-1">Industries:</span>
                          {selectedIcp.rawCriteria.companyProfile.industries.map((ind: string) => (
                            <span key={ind} className="rounded-md border border-border-subtle bg-raised px-2 py-0.5 text-[10px] font-medium text-text-primary">
                              {ind}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {icpMode === "text" && (
            <div className="animate-fade-in-up space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                  <span>Enter ICP Description</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateFromProduct}
                  disabled={isGeneratingText}
                  title="Auto-write ICP description from saved active product details using AI"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 text-xs font-bold text-accent-600 dark:text-accent-400 transition-all hover:bg-accent-500/20 disabled:opacity-50"
                >
                  {isGeneratingText ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-500" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-accent-500" />
                  )}
                  <span>Auto-Generate from Active Product</span>
                </button>
              </div>
              <textarea
                value={icpText}
                onChange={(e) => setIcpText(e.target.value)}
                placeholder="Describe your Ideal Customer Profile: industries, geographies, company size, buyer personas, exclusions, buying signals… or click the AI icon above to generate from your active product."
                className="h-36 w-full resize-y rounded-xl border border-border-subtle bg-sunken/50 px-4 py-3 font-mono text-[12px] leading-relaxed text-text-primary outline-none transition-all focus:border-accent-500/40 focus:shadow-[var(--shadow-glow-accent)]"
              />
              <div className="flex items-center justify-between text-[11px] text-text-tertiary">
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

          {icpMode === "upload" && (
            <div className="animate-fade-in-up">
              <div
                className={cn(
                  "group relative flex min-h-[128px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 text-center transition-all",
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/20 to-violet-500/10 shadow-sm">
                      <FileUp className="h-5 w-5 text-accent-500" />
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sunken">
                      <UploadCloud className="h-5 w-5 text-text-tertiary transition-transform group-hover:-translate-y-0.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        Click to select or drag & drop
                      </p>
                      <p className="mt-0.5 text-[11px] text-text-tertiary">
                        Supports Word (.docx), JSON, or text files
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end border-t border-border-subtle pt-4">
            <Button size="md" onClick={startRun} disabled={!canRun || runState === "running"} loading={runState === "running"}>
              <Play className="h-3.5 w-3.5" /> Start Discovery Run
            </Button>
          </div>
        </CardContent>
      </Card>

      {runState === "running" && (
        <Card className="mb-5">
          <CardContent>
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-text-primary">
              <Sparkles className="h-4 w-4 text-accent-500" />
              Running discovery agent...
            </div>
            <ul className="mt-3 space-y-2.5">
              {RUN_STEPS.map((step, i) => (
                <li key={step} className="flex items-center gap-2.5 text-sm">
                  {i < runStep ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-positive-500" />
                  ) : i === runStep ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-500" />
                  ) : (
                    <span className="h-4 w-4 shrink-0 rounded-full border-2 border-border-default" />
                  )}
                  <span className={i <= runStep ? "text-text-primary" : "text-text-tertiary"}>{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {runState === "done" && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">{results.length} accounts</span> discovered and scored
            </p>
            <div className="flex items-center gap-0.5 rounded-[var(--radius-sm)] border border-border-default bg-sunken p-0.5">
              <ViewToggle icon={LayoutGrid} active={view === "grid"} onClick={() => setView("grid")} />
              <ViewToggle icon={Table2} active={view === "table"} onClick={() => setView("table")} />
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((account) => (
                <AccountCard key={account.id} account={account} onOpen={setActiveAccount} />
              ))}
            </div>
          ) : (
            <Card>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs text-text-tertiary">
                    <th className="px-5 py-2.5 font-medium">Account</th>
                    <th className="px-3 py-2.5 font-medium">Fit score</th>
                    <th className="px-3 py-2.5 font-medium">Confidence</th>
                    <th className="px-3 py-2.5 font-medium">Signals</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((a) => (
                    <tr key={a.id} onClick={() => setActiveAccount(a)} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-sunken">
                      <td className="px-5 py-3 font-medium text-text-primary">{a.name}</td>
                      <td className="px-3 py-3 font-mono">{a.fitScore}</td>
                      <td className="px-3 py-3"><ConfidenceBadge level={a.confidence} /></td>
                      <td className="px-3 py-3 text-text-secondary">{a.discoveryReasons.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      <Drawer
        open={!!activeAccount}
        onClose={() => setActiveAccount(null)}
        title={activeAccount?.name ?? ""}
        description={activeAccount ? `${activeAccount.industry} · ${activeAccount.hqLocation}` : undefined}
      >
        {activeAccount && (
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-4">
              <RadialScore value={activeAccount.fitScore} size={64} label="fit" />
              <div>
                <ConfidenceBadge level={activeAccount.confidence} />
                <p className="mt-1.5 text-xs text-text-tertiary">Discovered via {activeAccount.icpName}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-text-secondary">Why this account matched</p>
              <ul className="space-y-1.5">
                {activeAccount.discoveryReasons.map((r) => (
                  <li key={r} className="text-sm text-text-primary">· {r}</li>
                ))}
              </ul>
            </div>

            {icpFitByAccount[activeAccount.id] && (
              <div>
                <p className="mb-2 text-xs font-semibold text-text-secondary">ICP fit breakdown</p>
                <ul className="space-y-2">
                  {icpFitByAccount[activeAccount.id].map((c) => (
                    <li key={c.criterion} className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{c.criterion}</span>
                      <span className="font-mono text-text-primary">{c.score}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold text-text-secondary">Evidence</p>
              <EvidenceList items={evidenceByAccount[activeAccount.id] ?? []} />
            </div>

            <div className="flex gap-2 border-t border-border-subtle pt-4">
              <Button className="flex-1">Verify & Advance</Button>
              <Button variant="secondary">Watchlist</Button>
              <Button variant="ghost">Reject</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function ViewToggle({ icon: Icon, active, onClick }: { icon: typeof LayoutGrid; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-[4px] ${active ? "bg-raised text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
