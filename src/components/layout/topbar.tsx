"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Bell, Search, Sparkles, Command, Zap } from "lucide-react";
import Link from "next/link";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border-subtle bg-raised/70 px-5 backdrop-blur-2xl supports-[backdrop-filter]:bg-raised/50">
      <div className="relative group/widget w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary transition-colors duration-200 group-focus-within/widget:text-accent-500" />
        <input
          type="text"
          placeholder="Search accounts, buyers, companies..."
          className="h-10 w-full rounded-xl border border-border-default bg-sunken/60 pl-10 pr-16 text-sm font-medium text-text-primary placeholder:text-text-tertiary transition-all duration-200 focus:border-accent-500 focus:bg-raised focus:outline-none focus:ring-4 focus:ring-accent-500/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        />
        <div className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-border-default bg-raised px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary shadow-[0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)]">
          <Command className="h-3 w-3" />
          <span>K</span>
        </div>
        <span className="pointer-events-none absolute inset-x-0 -bottom-px mx-auto h-px w-0 bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-0 transition-all duration-500 group-focus-within/widget:w-[96%] group-focus-within/widget:opacity-100" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/dashboard#agent-activity"
          className="relative hidden items-center gap-2 overflow-hidden rounded-full border border-progress-500/25 bg-gradient-to-r from-progress-50 via-cyan-400/5 to-progress-50 px-4 py-1.5 text-xs font-bold text-progress-700 transition-all duration-300 hover:border-progress-500/50 hover:shadow-[var(--shadow-glow-progress)] hover:-translate-y-0.5 md:inline-flex dark:from-progress-500/20 dark:via-progress-500/8 dark:to-progress-500/18 dark:text-progress-300"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)] opacity-70" />
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-progress-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-progress-500 animate-pulse-glow" />
          </span>
          <Sparkles className="relative h-3.5 w-3.5" />
          <span className="relative">3 agents running</span>
          <Zap className="relative h-3 w-3 fill-current text-progress-600/60 dark:text-progress-300/50" />
        </Link>

        <Link
          href="/actions"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-risk-500/30 hover:bg-risk-50 hover:text-risk-500 hover:shadow-[var(--shadow-glow-risk)] dark:hover:bg-risk-500/10"
          aria-label="Pending approvals"
        >
          <Bell className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110 group-hover:animate-[wiggle_0.6s_ease-in-out]" />
          <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-risk-500 px-1 text-[10px] font-bold text-white shadow-[0_2px_8px_-1px_rgba(201,58,58,0.55)] ring-2 ring-raised animate-pulse-glow">
            5
          </span>
        </Link>

        <div className="mx-1 h-6 w-px bg-gradient-to-b from-transparent via-border-subtle to-transparent" />

        <ThemeToggle />
      </div>
    </header>
  );
}
