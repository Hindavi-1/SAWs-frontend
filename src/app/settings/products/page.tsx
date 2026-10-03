"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProducts, selectActiveProduct, createProduct, saveICP } from "@/lib/api";
import type { Product, Company } from "@/lib/types";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Check,
  Building2,
  Calendar,
  Target,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Play,
  Loader2,
  X,
} from "lucide-react";

export default function ProductsSettingsPage() {
  const router = useRouter();
  const [company, setCompany] = React.useState<Company | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [activeProductId, setActiveProductId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Quick Add Product Modal State
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [newProdName, setNewProdName] = React.useState("");
  const [newProdDesc, setNewProdDesc] = React.useState("");
  const [newTargetMarket, setNewTargetMarket] = React.useState("");
  const [newValProp, setNewValProp] = React.useState("");
  const [createdProductForModal, setCreatedProductForModal] = React.useState<Product | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const res = await getProducts();
      setCompany(res.company);
      setProducts(res.products);
      setActiveProductId(res.activeProductId);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("sawf_product_updated", handleUpdate);
    return () => window.removeEventListener("sawf_product_updated", handleUpdate);
  }, [loadData]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdDesc.trim()) {
      toast.error("Product name and description are required.");
      return;
    }

    setIsSaving(true);
    try {
      const p = await createProduct({
        name: newProdName,
        description: newProdDesc,
        targetMarket: newTargetMarket,
        valueProposition: newValProp,
        setAsActive: true,
      });

      // Save initial ICP profile for new product
      await saveICP({
        productId: p.id,
        generationMethod: "llm",
        name: `${p.name} — Target ICP`,
        description: p.description,
        criteria: {
          companyProfile: {
            industries: ["Enterprise Tech", "Financial Services", "B2B SaaS"],
            employeeRange: { min: 100, max: 2500 },
          },
          targetPersonas: [{ titles: ["VP of Engineering", "CISO"], seniority: ["C-Level", "VP"] }],
          buyingSignals: ["Active cloud migration", "Hiring security or ops roles"],
        },
      });

      await selectActiveProduct(p.id);
      window.dispatchEvent(new Event("sawf_product_updated"));
      toast.success(`Product "${p.name}" created and set as active!`);

      setIsAddOpen(false);
      setCreatedProductForModal(p);
      loadData();
    } catch {
      toast.error("Failed to create product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchActive = async (product: Product) => {
    try {
      await selectActiveProduct(product.id);
      setActiveProductId(product.id);
      toast.success(`Active product switched to: ${product.name}`, {
        description: "Dashboard metrics and pipeline activities are now filtered to this product.",
      });
      window.dispatchEvent(new Event("sawf_product_updated"));
    } catch {
      toast.error("Failed to switch product");
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-6 px-4 sm:px-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-sunken px-2.5 py-0.5 text-[11px] font-semibold text-text-secondary mb-2">
            <Building2 className="h-3 w-3 text-accent-500" />
            <span>{company?.name || "Acme Enterprise Solutions"}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
            Products &amp; Offerings
          </h1>
          <p className="mt-1 text-xs text-text-tertiary">
            Manage your company&apos;s product catalog. Switch active products to redirect agentic pipelines and rep activities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </Button>
          <Link href="/onboarding">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4 text-accent-500" />
              <span>Full Onboarding</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block">
            Total Offerings
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary font-mono">
              {products.length}
            </span>
            <span className="text-xs text-text-tertiary">products registered</span>
          </div>
        </Card>

        <Card className="p-4 border-accent-500/20 bg-accent-50/20 dark:bg-accent-500/5">
          <span className="text-[11px] font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider block">
            Currently Active Pipeline
          </span>
          <div className="mt-2 truncate">
            <span className="text-sm font-bold text-text-primary truncate block">
              {products.find((p) => p.id === activeProductId)?.name || "ZeroTrust Cloud SASE Platform"}
            </span>
            <span className="text-[11px] text-text-tertiary">Active in Topbar Switcher</span>
          </div>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block">
            Multi-Tenant Isolation
          </span>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Dedicated Schema &amp; ICPs</span>
          </div>
          <span className="text-[10px] text-text-tertiary mt-1 block">
            PostgreSQL Multi-Tenant foreign keys
          </span>
        </Card>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-primary">
          Registered Products ({products.length})
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-lg bg-sunken animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {products.map((prod) => {
              const isActive = prod.id === activeProductId;
              return (
                <Card
                  key={prod.id}
                  className={`p-5 transition ${
                    isActive
                      ? "border-accent-500/50 bg-raised ring-1 ring-accent-500/30"
                      : "hover:border-border-strong"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400">
                          <Package className="h-3.5 w-3.5" />
                        </span>
                        <h3 className="text-sm font-bold text-text-primary">{prod.name}</h3>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/10 px-2 py-0.5 text-[10px] font-bold text-accent-600 dark:text-accent-400 border border-accent-500/20">
                            <Check className="h-2.5 w-2.5" />
                            Active Pipeline
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed">
                        {prod.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-text-tertiary">
                        {prod.targetMarket && (
                          <div>
                            <span className="font-semibold text-text-secondary">Target Market: </span>
                            {prod.targetMarket}
                          </div>
                        )}
                        {prod.valueProposition && (
                          <div>
                            <span className="font-semibold text-text-secondary">Value Prop: </span>
                            {prod.valueProposition}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle">
                      {isActive ? (
                        <span className="rounded-md border border-border-subtle bg-sunken px-3 py-1.5 text-xs font-semibold text-text-secondary">
                          Current Selection
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleSwitchActive(prod)}
                          className="text-xs gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Switch to this Product</span>
                        </Button>
                      )}

                      <Link href="/accounts">
                        <Button variant="ghost" className="text-xs gap-1 text-text-tertiary hover:text-text-primary">
                          <span>View Pipeline</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Quick Add Product */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <Card className="w-full max-w-lg border-border-subtle bg-raised p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-accent-500" />
                <h3 className="text-base font-bold text-text-primary">Add New Product / Offering</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-primary block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g., Enterprise Security Suite"
                  className="w-full rounded-lg border border-border-subtle bg-sunken px-3.5 py-2 text-xs text-text-primary outline-none focus:border-accent-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-primary block mb-1">Product Description *</label>
                <textarea
                  required
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Detailed description of what this product does, pain points it solves, and target outcomes..."
                  className="h-24 w-full rounded-lg border border-border-subtle bg-sunken px-3.5 py-2 text-xs text-text-primary outline-none focus:border-accent-500/40 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1">Target Market</label>
                  <input
                    type="text"
                    value={newTargetMarket}
                    onChange={(e) => setNewTargetMarket(e.target.value)}
                    placeholder="e.g., Mid-Market Fintech (250-1000 employees)"
                    className="w-full rounded-lg border border-border-subtle bg-sunken px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1">Value Proposition</label>
                  <input
                    type="text"
                    value={newValProp}
                    onChange={(e) => setNewValProp(e.target.value)}
                    placeholder="e.g., 85% risk reduction in single agent"
                    className="w-full rounded-lg border border-border-subtle bg-sunken px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent-500/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span>Create Product &amp; Save</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal 2: Pop-Up Screen for Auto Discovery Prompt */}
      {createdProductForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <Card className="w-full max-w-lg border-accent-500/40 bg-raised p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-500/10 border border-accent-500/30 text-accent-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Product Created &amp; Set Active!</h3>
                <p className="text-xs text-text-tertiary">Product: {createdProductForModal.name}</p>
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
                <span>⚡ Start Extraction &amp; Discovery Now</span>
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => {
                  setCreatedProductForModal(null);
                }}
              >
                Skip for Now
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
