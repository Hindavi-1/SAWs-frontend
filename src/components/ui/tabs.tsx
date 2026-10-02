"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "line" | "pill";
}

export function Tabs({ items, value, onChange, className, variant = "line" }: TabsProps) {
  const tabsRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      onChange(items[nextIndex].id);
      focusTab(nextIndex);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      onChange(items[prevIndex].id);
      focusTab(prevIndex);
    }
  };

  const focusTab = (index: number) => {
    const buttons = tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[index]?.focus();
  };

  if (variant === "pill") {
    return (
      <div
        ref={tabsRef}
        role="tablist"
        className={cn(
          "inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-border-default bg-sunken p-1",
          className
        )}
      >
        {items.map((item, idx) => {
          const active = item.id === value;
          return (
            <button
              key={item.id}
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(item.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                "flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-xs font-semibold transition-all",
                active
                  ? "bg-raised text-text-primary shadow-[var(--shadow-xs)]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <span>{item.label}</span>
              {item.badge}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={tabsRef}
      role="tablist"
      className={cn("flex items-center gap-1 overflow-x-auto border-b border-border-subtle", className)}
    >
      {items.map((item, idx) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-t-[var(--radius-sm)]",
              active ? "text-accent-500" : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            <span>{item.label}</span>
            {item.badge}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

