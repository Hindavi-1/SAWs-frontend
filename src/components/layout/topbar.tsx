"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Bell, Search, Sparkles, Command } from "lucide-react";
import Link from "next/link";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border-subtle bg-raised/80 px-5 backdrop-blur-xl supports-[backdrop-filter]:bg-raised/60">
      <div className="relative group w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary transition-colors group-focus-within:text-accent-500" />
        <input
          type="text"
          placeholder="Search accounts, buyers, companies..."
          className="h-10 w-full rounded-xl border border-border-default bg-sunken/60 pl-10 pr-16 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-200 focus:border-accent-500 focus:bg-raised focus:outline-none focus:ring-4 focus:ring-accent-500/10"
        />
        <div className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-border-default bg-raised px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
          <Command className="h-3 w-3" />
          <span>K</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/dashboard#agent-activity"
          className="hidden items-center gap-2 rounded-full border border-progress-500/20 bg-gradient-to-r from-progress-50/80 to-progress-50/40 px-3.5 py-1.5 text-xs font-semibold text-progress-600 transition-all duration-200 hover:border-progress-500/40 hover:from-progress-100 hover:to-progress-50 md:inline-flex dark:from-progress-500/15 dark:to-progress-500/5 dark:text-progress-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-progress-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-progress-500" />
          </span>
          <Sparkles className="h-3.5 w-3.5" />
          <span>3 agents running</span>
        </Link>

        <Link
          href="/actions"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle text-text-secondary transition-all duration-200 hover:border-accent-500/30 hover:bg-accent-50 hover:text-accent-500 dark:hover:bg-accent-500/10"
          aria-label="Pending approvals"
        >
          <Bell className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
          <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-risk-500 px-1 text-[10px] font-bold text-white shadow-[0_2px_6px_-1px_rgba(201,58,58,0.5)] ring-2 ring-raised">
            5
          </span>
        </Link>

        <div className="mx-1 h-6 w-px bg-border-subtle" />

        <ThemeToggle />
      </div>
    </header>
  );
}
