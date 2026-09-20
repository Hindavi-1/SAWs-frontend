"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface TabItem {
  id: string;
  label: string;
  badge?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex items-center gap-1 overflow-x-auto border-b border-border-subtle", className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            {item.label}
            {item.badge}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-500" />}
          </button>
        );
      })}
    </div>
  );
}
