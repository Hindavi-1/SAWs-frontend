"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Inbox,
  LayoutDashboard,
  Building2,
  ListChecks,
  Search,
  MessagesSquare,
  LineChart,
  ShieldCheck,
  RefreshCw,
  Boxes,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { getAccounts } from "@/lib/api";
import type { Account } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [accounts, setAccounts] = React.useState<Account[]>([]);

  React.useEffect(() => {
    getAccounts().then(setAccounts);
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    command();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-raised shadow-2xl animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center border-b border-border-subtle px-3 py-2.5">
            <Search className="mr-2 h-4 w-4 shrink-0 text-text-tertiary" />
            <Command.Input
              autoFocus
              placeholder="Type a command, page, or search accounts..."
              className="w-full bg-transparent text-sm font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border-default bg-sunken px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-xs">
            <Command.Empty className="py-6 text-center text-text-tertiary">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-text-tertiary font-semibold uppercase text-[10px] px-2 py-1.5">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/outreach-review"))}
                icon={Inbox}
                title="Outreach Review Queue"
                subtitle="Review pending human-in-the-loop drafts"
                badge="Showpiece"
              />
              <CommandItem
                onSelect={() => runCommand(() => router.push("/"))}
                icon={LayoutDashboard}
                title="Dashboard"
                subtitle="Today's rep command center"
              />
              <CommandItem
                onSelect={() => runCommand(() => router.push("/accounts"))}
                icon={Building2}
                title="Accounts Directory"
                subtitle="All accounts across pipeline"
              />
              <CommandItem
                onSelect={() => runCommand(() => router.push("/actions"))}
                icon={ListChecks}
                title="Action Queue"
                subtitle="Decisions and stage advancements"
              />
              <CommandItem
                onSelect={() => runCommand(() => router.push("/discovery"))}
                icon={Search}
                title="Account Discovery"
                subtitle="Run ICP search and qualify"
              />
              <CommandItem
                onSelect={() => runCommand(() => router.push("/engagement"))}
                icon={MessagesSquare}
                title="Engagement & Outbox"
                subtitle="Active conversations and replies"
              />
              <CommandItem
                onSelect={() => runCommand(() => router.push("/intelligence"))}
                icon={LineChart}
                title="Sales Intelligence"
                subtitle="Conversion and funnel analytics"
              />
              <CommandItem
                onSelect={() => runCommand(() => router.push("/compliance"))}
                icon={ShieldCheck}
                title="Compliance & Quality"
                subtitle="Consent and guardrail rules"
              />
              <CommandItem
                onSelect={() => runCommand(() => router.push("/crm-sync"))}
                icon={RefreshCw}
                title="CRM Sync"
                subtitle="Bi-directional CRM telemetry"
              />
              <CommandItem
                onSelect={() => runCommand(() => router.push("/module-ops"))}
                icon={Boxes}
                title="Module Ops"
                subtitle="Backend module execution inspector"
              />
            </Command.Group>

            {accounts.length > 0 && (
              <Command.Group heading="Accounts" className="text-text-tertiary font-semibold uppercase text-[10px] px-2 py-1.5 mt-2">
                {accounts.slice(0, 5).map((acc) => (
                  <CommandItem
                    key={acc.id}
                    onSelect={() => runCommand(() => router.push(`/accounts/${acc.id}`))}
                    icon={Building2}
                    title={acc.name}
                    subtitle={`${acc.industry} • Fit ${acc.fitScore}`}
                  />
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Preferences" className="text-text-tertiary font-semibold uppercase text-[10px] px-2 py-1.5 mt-2">
              <CommandItem
                onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}
                icon={theme === "dark" ? Sun : Moon}
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              />
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({
  onSelect,
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  onSelect: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center justify-between gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-text-primary cursor-pointer hover:bg-sunken aria-selected:bg-sunken transition-colors"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="h-4 w-4 shrink-0 text-text-secondary" />
        <div className="min-w-0 truncate">
          <p className="text-xs font-semibold text-text-primary truncate">{title}</p>
          {subtitle && <p className="text-[11px] text-text-tertiary truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {badge && (
          <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-[10px] font-bold text-accent-500 border border-accent-500/20">
            {badge}
          </span>
        )}
        <ArrowRight className="h-3 w-3 text-text-tertiary opacity-40" />
      </div>
    </Command.Item>
  );
}
