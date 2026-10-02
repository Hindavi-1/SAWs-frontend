"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Bell, Search, Command, Bot } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import * as api from "@/lib/api";
import { CommandPalette } from "@/components/ui/command-palette";
import { ProductSelector } from "./product-selector";

export function Topbar() {
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [pendingCount, setPendingCount] = React.useState(5);
  const [runningAgents, setRunningAgents] = React.useState(3);

  React.useEffect(() => {
    Promise.all([api.getApprovalQueue(), api.getAgentTasks()]).then(([queue, tasks]) => {
      setPendingCount(queue.length);
      const running = tasks.filter((t) => t.status === "running").length;
      setRunningAgents(running > 0 ? running : 2);
    }).catch(() => {});
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-raised/85 px-4 backdrop-blur-md">
        {/* Product Switcher & Command Search Bar */}
        <div className="flex items-center gap-2.5 w-full max-w-md sm:max-w-xl">
          <ProductSelector />
          <div className="h-4 w-px bg-border-subtle shrink-0 hidden sm:block" />
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex h-8 flex-1 items-center justify-between rounded-[var(--radius-sm)] border border-border-default bg-sunken/60 px-2.5 text-xs text-text-tertiary transition-colors hover:border-border-strong hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
              <span className="truncate">Search accounts, buyers, actions...</span>
            </div>
            <div className="hidden sm:flex items-center gap-0.5 rounded border border-border-default bg-raised px-1 py-0.5 text-[10px] font-semibold text-text-tertiary shadow-xs">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Agent Monitor - Dedicated Agent Token Styling */}
          <Link
            href="/#agent-activity"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--agent-border)] bg-[var(--agent-surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--agent-text)] transition-opacity hover:opacity-90 shadow-xs"
            title="View running agent tasks"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--agent-core)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--agent-core)]" />
            </span>
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-mono">{runningAgents} agents active</span>
          </Link>

          {/* Action Queue Bell */}
          <Link
            href="/actions"
            className="relative flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-border-default text-text-secondary transition-colors hover:bg-sunken hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            aria-label="Pending approvals"
            title="Action Queue"
          >
            <Bell className="h-3.5 w-3.5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-risk-500 px-1 text-[9px] font-bold text-white shadow-xs">
                {pendingCount}
              </span>
            )}
          </Link>

          <div className="h-4 w-px bg-border-subtle mx-0.5" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1 border-l border-border-subtle">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500/10 text-accent-600 dark:text-accent-400 font-mono text-xs font-bold ring-1 ring-accent-500/20">
              PS
            </div>
            <div className="hidden lg:block text-left text-xs leading-none">
              <span className="block font-semibold text-text-primary">Priya Shah</span>
              <span className="text-[10px] text-text-tertiary">Senior SDR</span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
