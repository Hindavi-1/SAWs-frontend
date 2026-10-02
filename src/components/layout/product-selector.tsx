"use client";

import * as React from "react";
import Link from "next/link";
import { getProducts, selectActiveProduct } from "@/lib/api";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { Package, Check, ChevronDown, Plus, Building2 } from "lucide-react";

export function ProductSelector() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [activeProductId, setActiveProductId] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const loadData = React.useCallback(async () => {
    try {
      const res = await getProducts();
      setProducts(res.products);
      setActiveProductId(res.activeProductId);
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();

    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("sawf_product_updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("sawf_product_updated", handleStorage);
    };
  }, [loadData]);

  // Click outside to close
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeProduct = products.find((p) => p.id === activeProductId) || products[0];

  const handleSelectProduct = async (product: Product) => {
    try {
      await selectActiveProduct(product.id);
      setActiveProductId(product.id);
      setIsOpen(false);
      toast.success(`Active product switched to: ${product.name}`, {
        description: "Pipelines, ICP targeting, and dashboard activities are now focused on this offering.",
      });
      window.dispatchEvent(new Event("sawf_product_updated"));
    } catch {
      toast.error("Failed to switch product");
    }
  };

  if (isLoading) {
    return (
      <div className="h-8 w-44 animate-pulse rounded-md bg-sunken border border-border-subtle" />
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-border-default bg-raised px-2.5 py-1 text-xs font-medium text-text-primary shadow-xs transition hover:border-border-strong hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        aria-expanded={isOpen}
      >
        <span className="flex h-4 w-4 items-center justify-center rounded bg-accent-50/80 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
          <Package className="h-3 w-3" />
        </span>
        <span className="max-w-[130px] truncate font-semibold sm:max-w-[180px]">
          {activeProduct ? activeProduct.name : "Select Product"}
        </span>
        <ChevronDown className="h-3 w-3 text-text-tertiary" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-80 rounded-lg border border-border-default bg-raised p-1.5 shadow-xl shadow-black/10 dark:shadow-black/50 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-text-tertiary uppercase border-b border-border-subtle mb-1 flex items-center justify-between bg-raised">
            <span>Select Active Product</span>
            <span className="text-[10px] font-normal lowercase text-text-tertiary">
              {products.length} registered
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 py-0.5">
            {products.map((p) => {
              const isSelected = p.id === activeProduct?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={`w-full flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition ${
                    isSelected
                      ? "bg-accent-50/70 text-text-primary dark:bg-accent-500/15 font-medium"
                      : "text-text-secondary hover:bg-sunken hover:text-text-primary"
                  }`}
                >
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 text-accent-600 dark:text-accent-400" />
                    ) : (
                      <Package className="h-3.5 w-3.5 text-text-tertiary opacity-40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-xs font-semibold text-text-primary">
                        {p.name}
                      </span>
                      {isSelected && (
                        <span className="shrink-0 rounded bg-accent-500/10 px-1.5 py-0.2 text-[9px] font-bold text-accent-600 dark:text-accent-400 border border-accent-500/20">
                          Active
                        </span>
                      )}
                    </div>
                    {p.targetMarket && (
                      <p className="truncate text-[10px] text-text-tertiary mt-0.5">
                        {p.targetMarket}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-1 border-t border-border-subtle pt-1.5 space-y-0.5 bg-raised">
            <Link
              href="/onboarding"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-accent-600 dark:text-accent-400 hover:bg-sunken font-semibold transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Product &amp; ICP</span>
            </Link>
            <Link
              href="/settings/products"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1 text-xs text-text-tertiary hover:bg-sunken hover:text-text-primary transition"
            >
              <Building2 className="h-3 w-3" />
              <span>Manage all products ({products.length})</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
