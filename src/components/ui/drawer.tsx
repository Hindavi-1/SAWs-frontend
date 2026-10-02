"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import * as React from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  widthClassName?: string;
}

export function Drawer({ open, onClose, title, description, children, widthClassName = "w-[460px]" }: DrawerProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 transition-[visibility]",
        open ? "visible" : "invisible delay-200"
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={cn(
          "absolute right-0 top-0 h-full max-w-full border-l border-border-default bg-raised shadow-xl transition-transform duration-200 ease-out flex flex-col",
          widthClassName,
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3.5 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 id="drawer-title" className="text-sm font-semibold text-text-primary truncate">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-text-tertiary truncate">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-[var(--radius-sm)] p-1 text-text-tertiary hover:bg-sunken hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

