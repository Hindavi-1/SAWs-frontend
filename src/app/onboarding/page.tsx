"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  createProduct,
  generateICPFromProduct,
  saveICP,
  uploadICPDocument,
  selectActiveProduct,
} from "@/lib/api";
import type { ICPGenerationMethod } from "@/lib/types";
import { toast } from "sonner";
import {
  Package,
  Sparkles,
  Edit3,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Target,
  Users,
  AlertCircle,
  FileText,
  Loader2,
  Briefcase,
  DollarSign,
  TrendingUp,
  Play,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createdProductForModal, setCreatedProductForModal] = React.useState<any>(null);

  // Step 1: Product Definition State
  const [companyName, setCompanyName] = React.useState("Acme Enterprise Solutions");
  const [companyDomain, setCompanyDomain] = React.useState("acme.com");
  const [productName, setProductName] = React.useState("");
  const [productDescription, setProductDescription] = React.useState("");
  const [targetMarket, setTargetMarket] = React.useState("");
  const [valueProposition, setValueProposition] = React.useState("");

  // Step 2: ICP State
  const [icpMethod, setIcpMethod] = React.useState<ICPGenerationMethod>("llm");
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false);
  const [isUploadingFile, setIsUploadingFile] = React.useState(false);
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);
  const [extractedSnippet, setExtractedSnippet] = React.useState<string | null>(null);

  // Canonical ICP Data (shared across all 3 methods)
  const [icpName, setIcpName] = React.useState("");
  const [icpDescription, setIcpDescription] = React.useState("");
  const [targetIndustries, setTargetIndustries] = React.useState<string[]>([
    "Financial Services",
    "B2B SaaS",
    "Healthcare IT",
  ]);
  const [employeeMin, setEmployeeMin] = React.useState<number>(100);
  const [employeeMax, setEmployeeMax] = React.useState<number>(2500);
  const [targetTitles, setTargetTitles] = React.useState<string[]>([
    "CISO",
    "VP of Information Security",
    "Head of Infrastructure",
  ]);
  const [primaryPains, setPrimaryPains] = React.useState<string[]>([
    "Manual security questionnaires slowing down enterprise deals",
    "Lack of unified visibility across multi-cloud environments",
  ]);
  const [buyingSignals, setBuyingSignals] = React.useState<string[]>([
    "Active hiring for DevOps & Security roles",
    "Recent funding round or acquisition",
    "Upcoming compliance certification deadline",
  ]);

  // Handle LLM ICP Generation
  const handleGenerateAiICP = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      toast.error("Please enter your product name and description in Step 1 first.");
      setCurrentStep(1);
      return;
    }

    setIsGeneratingAi(true);
    try {
      const generated = await generateICPFromProduct({
        productName,
        productDescription,
        targetMarket,
        valueProposition,
        companyName,
      });

      if (generated) {
        setIcpName(generated.icpName || `${productName} — Enterprise Segment`);
        setIcpDescription(generated.description || "");

        if (generated.companyProfile?.industries?.length) {
          setTargetIndustries(generated.companyProfile.industries);
        }
        if (generated.companyProfile?.employeeRange?.min !== undefined) {
          setEmployeeMin(generated.companyProfile.employeeRange.min || 100);
        }
        if (generated.companyProfile?.employeeRange?.max !== undefined) {
          setEmployeeMax(generated.companyProfile.employeeRange.max || 2500);
        }
        if (generated.targetPersonas?.length) {
          const titles = generated.targetPersonas.flatMap((p: any) => p.titles || []);
          if (titles.length) setTargetTitles(titles);
        }
        if (generated.problemFit?.primaryProblems?.length) {
          setPrimaryPains(generated.problemFit.primaryProblems);
        }
        if (generated.buyingSignals?.length) {
          setBuyingSignals(generated.buyingSignals);
        }

        toast.success("AI synthesized Ideal Customer Profile from your product!", {
          description: "Review and refine the generated parameters below.",
        });
      }
    } catch {
      toast.error("Failed to generate ICP via AI. You can enter criteria manually.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Handle Document Upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadedFileName(file.name);
    try {
      const result = await uploadICPDocument(file);
      if (result && result.canonical_icp) {
        const canonical = result.canonical_icp;
        setIcpName(canonical.icpName || `Extracted from ${file.name}`);
        setIcpDescription(canonical.description || "");
        if (result.extracted_text_snippet) {
          setExtractedSnippet(result.extracted_text_snippet);
        }
        if (canonical.companyProfile?.industries?.length) {
          setTargetIndustries(canonical.companyProfile.industries);
        }
        if (canonical.targetPersonas?.length) {
          const titles = canonical.targetPersonas.flatMap((p: any) => p.titles || []);
          if (titles.length) setTargetTitles(titles);
        }
        toast.success(`Parsed document: ${file.name}`);
      }
    } catch {
      toast.error("Failed to parse document. Please check the file format.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Final Step: Complete Onboarding & Save
  const handleFinalSubmit = async () => {
    if (!productName.trim()) {
      toast.error("Product name is required");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Product
      const product = await createProduct({
        name: productName,
        description: productDescription,
        targetMarket,
        valueProposition,
        setAsActive: true,
      });

      // 2. Save Associated ICP
      await saveICP({
        productId: product.id,
        generationMethod: icpMethod,
        name: icpName || `${productName} Primary ICP`,
        description: icpDescription,
        criteria: {
          companyProfile: {
            industries: targetIndustries,
            employeeRange: { min: employeeMin, max: employeeMax },
          },
          targetPersonas: targetTitles.map((t) => ({ titles: [t], seniority: ["C-Level", "VP"] })),
          problemFit: { primaryProblems: primaryPains },
          buyingSignals,
        },
        rawDocumentText: extractedSnippet || undefined,
      });

      // 3. Set Active Product in company context
      await selectActiveProduct(product.id);

      window.dispatchEvent(new Event("sawf_product_updated"));
      toast.success("Product and ICP successfully configured!", {
        description: `Active pipeline switched to: ${product.name}`,
      });

      // Show auto discovery pop-up modal
      setCreatedProductForModal(product);
    } catch {
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6 px-4 sm:px-6">
      {/* Top Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-sunken px-3 py-1 text-xs font-semibold text-text-secondary mb-3">
          <Building2 className="h-3.5 w-3.5 text-accent-500" />
          <span>Product &amp; Market Onboarding</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Register Your Offering &amp; Ideal Customer Profile
        </h1>
        <p className="mt-1.5 text-sm text-text-tertiary">
          Configure what product or service your company is selling, and define who your ideal buyers are.
        </p>
      </div>

      {/* Wizard Progress Steps */}
      <div className="mb-8 grid grid-cols-3 gap-3 border-b border-border-subtle pb-4">
        {[
          { step: 1, label: "Product Definition", icon: Package },
          { step: 2, label: "ICP Setup (3 Options)", icon: Target },
          { step: 3, label: "Review & Launch", icon: CheckCircle2 },
        ].map(({ step, label, icon: Icon }) => {
          const isActive = currentStep === step;
          const isDone = currentStep > step;
          return (
            <div
              key={step}
              onClick={() => {
                if (step < currentStep) setCurrentStep(step as 1 | 2 | 3);
              }}
              className={`flex items-center gap-2.5 rounded-lg p-2 transition ${
                isActive
                  ? "bg-accent-50/60 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 font-semibold"
                  : isDone
                  ? "text-text-primary cursor-pointer hover:bg-sunken"
                  : "text-text-tertiary opacity-60"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-accent-500 text-white"
                    : isDone
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-sunken border border-border-default text-text-tertiary"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : step}
              </div>
              <div className="hidden sm:block text-left truncate">
                <span className="block text-xs leading-none">{label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Product Definition */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-border-subtle pb-4">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Package className="h-4 w-4 text-accent-500" />
              What Product or Service Are You Selling?
            </h2>
            <p className="mt-1 text-xs text-text-tertiary">
              Companies can register and switch between multiple products on the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Company / Tenant Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Enterprise Solutions"
                className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-2 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Company Domain
              </label>
              <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                placeholder="e.g. acme.com"
                className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-2 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Product / Offering Name <span className="text-risk-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. ZeroTrust Cloud SASE Platform"
              className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-2 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Product / Service Description <span className="text-risk-500">*</span>
            </label>
            <textarea
              rows={4}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Describe what your product does, its core capabilities, underlying technology, and key differentiators. E.g.: Cloud-native security platform that combines zero-trust network access, data loss prevention, and automated posture remediation for distributed teams..."
              className="w-full rounded-md border border-border-default bg-sunken/40 p-3 text-xs text-text-primary focus:border-accent-500 focus:outline-none leading-relaxed"
            />
            <p className="mt-1 text-[11px] text-text-tertiary">
              Tip: The more detailed this description is, the more accurate the AI will be when deducing candidate buyer personas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Target Market Focus
              </label>
              <input
                type="text"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                placeholder="e.g. Mid-Market & Enterprise (250-5000 employees)"
                className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-2 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Core Value Proposition / ROI
              </label>
              <input
                type="text"
                value={valueProposition}
                onChange={(e) => setValueProposition(e.target.value)}
                placeholder="e.g. Cuts security breach risk by 85% and consolidates 4 vendors"
                className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-2 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-subtle">
            <Button
              onClick={() => {
                if (!productName.trim() || !productDescription.trim()) {
                  toast.error("Please provide both Product Name and Description.");
                  return;
                }
                setCurrentStep(2);
              }}
              className="gap-2"
            >
              <span>Continue to ICP Setup</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: ICP Setup with 3 Options */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "llm",
                title: "Option A: Generate with AI",
                subtitle: "Synthesize ICP via Groq LLM",
                icon: Sparkles,
                badge: "Recommended",
              },
              {
                id: "manual",
                title: "Option B: Enter Manually",
                subtitle: "Specify candidate client traits",
                icon: Edit3,
              },
              {
                id: "upload",
                title: "Option C: Upload Document",
                subtitle: "Extract from .docx, .txt, .json",
                icon: UploadCloud,
              },
            ].map((tab) => {
              const isSelected = icpMethod === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setIcpMethod(tab.id as ICPGenerationMethod)}
                  className={`flex flex-col text-left p-4 rounded-lg border transition ${
                    isSelected
                      ? "border-accent-500 bg-accent-50/50 dark:bg-accent-500/10 ring-1 ring-accent-500/30"
                      : "border-border-default bg-raised hover:border-border-strong hover:bg-sunken"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-md ${
                        isSelected
                          ? "bg-[var(--agent-core)] text-white"
                          : "bg-sunken text-text-secondary border border-border-subtle"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {tab.badge && (
                      <span className="rounded-full bg-[var(--agent-surface)] border border-[var(--agent-border)] px-2 py-0.5 text-[9px] font-bold text-[var(--agent-text)]">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-text-primary">{tab.title}</span>
                  <span className="text-[11px] text-text-tertiary mt-0.5">{tab.subtitle}</span>
                </button>
              );
            })}
          </div>

          {/* Option A: AI Generation Content */}
          {icpMethod === "llm" && (
            <Card className="p-6 space-y-5 border-[var(--agent-border)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--agent-core)]" />
                    Autonomous ICP Synthesis from Product Description
                  </h3>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Analyzing product: <span className="font-semibold text-text-primary">{productName}</span>
                  </p>
                </div>
                <Button
                  onClick={handleGenerateAiICP}
                  disabled={isGeneratingAi}
                  className="bg-[var(--agent-core)] hover:opacity-90 text-white shrink-0 gap-2"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Synthesizing via Groq...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{icpName ? "Re-generate ICP with AI" : "Generate ICP with AI"}</span>
                    </>
                  )}
                </Button>
              </div>

              {isGeneratingAi && (
                <div className="py-8 text-center space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--agent-surface)] text-[var(--agent-core)] border border-[var(--agent-border)] animate-pulse">
                    <Sparkles className="h-5 w-5 animate-spin" />
                  </div>
                  <p className="text-xs font-medium text-text-secondary">
                    Groq LLM is deducing market personas, operational triggers, and pain points...
                  </p>
                </div>
              )}

              {/* Editable ICP Breakdown Cards */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    ICP Segment Name
                  </label>
                  <input
                    type="text"
                    value={icpName || `${productName} Enterprise Focus`}
                    onChange={(e) => setIcpName(e.target.value)}
                    className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-accent-500" />
                      Target Industries
                    </label>
                    <input
                      type="text"
                      value={targetIndustries.join(", ")}
                      onChange={(e) =>
                        setTargetIndustries(
                          e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                    />
                    <p className="mt-1 text-[10px] text-text-tertiary">Comma-separated</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-accent-500" />
                      Employee Headcount Range
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={employeeMin}
                        onChange={(e) => setEmployeeMin(Number(e.target.value))}
                        className="w-full rounded-md border border-border-default bg-sunken/40 px-2.5 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                        placeholder="Min"
                      />
                      <span className="text-xs text-text-tertiary">to</span>
                      <input
                        type="number"
                        value={employeeMax}
                        onChange={(e) => setEmployeeMax(Number(e.target.value))}
                        className="w-full rounded-md border border-border-default bg-sunken/40 px-2.5 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-accent-500" />
                    Target Buyer Titles &amp; Personas
                  </label>
                  <input
                    type="text"
                    value={targetTitles.join(", ")}
                    onChange={(e) =>
                      setTargetTitles(
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-text-tertiary">Job titles to discover and engage</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-accent-500" />
                    Key Pain Points &amp; Buying Triggers
                  </label>
                  <input
                    type="text"
                    value={buyingSignals.join(", ")}
                    onChange={(e) =>
                      setBuyingSignals(
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Option B: Manual Entry Content */}
          {icpMethod === "manual" && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-border-subtle pb-4">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-accent-500" />
                  Define Candidate Clients Manually
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Describe the accounts and companies you want your reps to prospect.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Candidate Client Narrative
                </label>
                <textarea
                  rows={3}
                  value={icpDescription}
                  onChange={(e) => setIcpDescription(e.target.value)}
                  placeholder="e.g. High-growth Series B/C fintech and enterprise software companies with remote teams undergoing SOC 2 compliance..."
                  className="w-full rounded-md border border-border-default bg-sunken/40 p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Target Industries
                  </label>
                  <input
                    type="text"
                    value={targetIndustries.join(", ")}
                    onChange={(e) =>
                      setTargetIndustries(
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="Fintech, SaaS, Healthcare IT"
                    className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Headcount Min - Max
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={employeeMin}
                      onChange={(e) => setEmployeeMin(Number(e.target.value))}
                      className="w-full rounded-md border border-border-default bg-sunken/40 px-2.5 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                    />
                    <span className="text-xs text-text-tertiary">-</span>
                    <input
                      type="number"
                      value={employeeMax}
                      onChange={(e) => setEmployeeMax(Number(e.target.value))}
                      className="w-full rounded-md border border-border-default bg-sunken/40 px-2.5 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Target Decision Maker Titles
                </label>
                <input
                  type="text"
                  value={targetTitles.join(", ")}
                  onChange={(e) =>
                    setTargetTitles(
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="CISO, VP Security, Director of IT"
                  className="w-full rounded-md border border-border-default bg-sunken/40 px-3 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                />
              </div>
            </Card>
          )}

          {/* Option C: Document Upload Content */}
          {icpMethod === "upload" && (
            <Card className="p-6 space-y-5">
              <div className="border-b border-border-subtle pb-4">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-accent-500" />
                  Upload Existing ICP Specification Document
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Upload an existing customer profile brief, docx template, or sales criteria document.
                </p>
              </div>

              <div className="relative border-2 border-dashed border-border-default hover:border-accent-500/50 rounded-xl p-8 text-center transition bg-sunken/30">
                <input
                  type="file"
                  accept=".docx,.txt,.json,.md"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploadingFile}
                />
                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400">
                    {isUploadingFile ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">
                      {uploadedFileName ? uploadedFileName : "Click or drag & drop document here"}
                    </p>
                    <p className="text-[11px] text-text-tertiary mt-0.5">
                      Supports Word (.docx), Plain Text (.txt), JSON (.json), Markdown (.md)
                    </p>
                  </div>
                </div>
              </div>

              {extractedSnippet && (
                <div className="rounded-lg border border-border-subtle bg-sunken/50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block mb-1">
                    Extracted Text Preview:
                  </span>
                  <p className="text-xs text-text-secondary line-clamp-3 italic">
                    &ldquo;{extractedSnippet}&rdquo;
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Product</span>
            </Button>
            <Button
              onClick={() => {
                if (!icpName.trim()) {
                  setIcpName(`${productName} ICP`);
                }
                setCurrentStep(3);
              }}
              className="gap-2"
            >
              <span>Review &amp; Launch</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Launch Pipeline */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-border-subtle pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Review &amp; Confirm Configuration
                </h2>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Confirm your product offering and ICP setup before activating the sales pipeline.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Ready to Launch
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Card */}
              <div className="rounded-lg border border-border-default bg-sunken/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-accent-500" />
                    Product Offering
                  </span>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-[11px] text-accent-600 dark:text-accent-400 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">{productName}</h4>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-3">
                    {productDescription}
                  </p>
                </div>
                {targetMarket && (
                  <div className="text-[11px] text-text-tertiary">
                    <span className="font-semibold text-text-secondary">Target Market: </span>
                    {targetMarket}
                  </div>
                )}
                {valueProposition && (
                  <div className="text-[11px] text-text-tertiary">
                    <span className="font-semibold text-text-secondary">Value Prop: </span>
                    {valueProposition}
                  </div>
                )}
              </div>

              {/* ICP Card */}
              <div className="rounded-lg border border-border-default bg-sunken/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-accent-500" />
                    Ideal Customer Profile
                  </span>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-[11px] text-accent-600 dark:text-accent-400 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-text-primary">{icpName || `${productName} ICP`}</h4>
                    <span className="rounded bg-accent-500/10 px-1.5 py-0.5 text-[9px] font-bold text-accent-600 dark:text-accent-400 uppercase">
                      {icpMethod}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-text-secondary">
                  <div>
                    <span className="font-semibold text-text-primary">Industries: </span>
                    {targetIndustries.join(", ") || "General B2B"}
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary">Headcount: </span>
                    {employeeMin} - {employeeMax} employees
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary">Personas: </span>
                    {targetTitles.join(", ")}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-accent-500/20 bg-accent-500/5 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-accent-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-text-primary block">
                  Next Step: Automated Pipeline Activation
                </span>
                <span className="text-text-tertiary mt-0.5 block">
                  Once confirmed, this product will become your active pipeline on the dashboard. You can switch between products at any time from the top bar selector.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Activating Pipeline...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm &amp; Launch Sales Pipeline</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Pop-Up Modal Screen for Auto ICP Extraction & Discovery */}
      {createdProductForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <Card className="w-full max-w-lg border-accent-500/40 bg-raised p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-500/10 border border-accent-500/30 text-accent-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Product &amp; ICP Configured!</h3>
                <p className="text-xs text-text-tertiary">Active Product: {createdProductForModal.name}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle bg-sunken/60 p-4 space-y-2">
              <p className="text-xs text-text-secondary leading-relaxed">
                Would you like to automatically start <strong>ICP Extraction</strong> and run <strong>Account Discovery</strong> for <span className="font-semibold text-text-primary">{createdProductForModal.name}</span> right now?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                className="w-full sm:flex-1 gap-2"
                onClick={() => {
                  router.push("/discovery?autoRun=true");
                }}
              >
                <Play className="h-4 w-4 text-white" />
                <span>⚡ Start Discovery Now</span>
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => {
                  router.push("/");
                }}
              >
                Skip to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
