"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProducts, selectActiveProduct } from "@/lib/api";
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
} from "lucide-react";

export default function ProductsSettingsPage() {
  const [company, setCompany] = React.useState<Company | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [activeProductId, setActiveProductId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

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
          <Link href="/onboarding">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Add New Product &amp; ICP</span>
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
    </div>
  );
}
