"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Building2,
  MessagesSquare,
  ListChecks,
  Boxes,
  ShieldCheck,
  RefreshCw,
  LineChart,
  Target,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeTone?: "default" | "accent" | "risk";
}

const PRIMARY: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discovery", label: "Discovery", icon: Search },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/engagement", label: "Engagement", icon: MessagesSquare },
  { href: "/actions", label: "Actions", icon: ListChecks, badge: 5, badgeTone: "risk" },
];

const PLATFORM: NavItem[] = [
  { href: "/module-ops", label: "Module Ops", icon: Boxes },
  { href: "/compliance", label: "Compliance & Quality", icon: ShieldCheck },
  { href: "/crm-sync", label: "CRM Sync", icon: RefreshCw },
  { href: "/intelligence", label: "Sales Intelligence", icon: LineChart },
  { href: "/icp-outcomes", label: "ICP & Outcomes", icon: Target },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col border-r border-border-subtle bg-raised/95 backdrop-blur-xl transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div
        className={cn(
          "relative flex h-16 items-center gap-2.5 border-b border-border-subtle px-4 overflow-hidden",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-40" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-accent-500/30 via-violet-500/20 to-cyan-500/15 blur-2xl" />
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,var(--accent-500),var(--ramp-4)_50%,var(--ramp-6))] font-mono text-xs font-bold text-white shadow-[0_4px_14px_-2px_rgba(74,95,220,0.55)] transition-transform duration-200 hover:scale-110 animate-gradient-x">
          <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.7)] animate-float-soft" />
          <span className="relative drop-shadow-sm">SW</span>
        </div>
        {!collapsed && (
          <div className="relative min-w-0">
            <span className="block text-[15px] font-extrabold tracking-tight text-text-primary">
              SAWFs
            </span>
            <span className="block text-[10px] font-medium text-text-tertiary">
              Sales Agentic Workflows
            </span>
          </div>
        )}
      </div>

      <nav className="relative flex-1 space-y-0.5 overflow-y-auto px-2.5 py-4 scrollbar-thin">
        <NavGroup items={PRIMARY} pathname={pathname} collapsed={collapsed} />
        <div
          className={cn(
            "my-4 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent",
            collapsed && "mx-1.5"
          )}
        />
        <NavGroup
          items={PLATFORM}
          pathname={pathname}
          collapsed={collapsed}
          label="Platform"
        />
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="group relative flex h-12 items-center justify-center gap-2 border-t border-border-subtle text-text-tertiary transition-all duration-200 hover:bg-sunken hover:text-accent-500 overflow-hidden"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 group-hover:bg-accent-50 group-hover:text-accent-500 group-hover:shadow-[var(--shadow-glow-accent)] dark:group-hover:bg-accent-500/10">
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </div>
      </button>
    </aside>
  );
}

function NavGroup({
  items,
  pathname,
  collapsed,
  label,
}: {
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  label?: string;
}) {
  return (
    <div className="space-y-0.5">
      {label && !collapsed && (
        <p className="px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-tertiary">
          {label}
        </p>
      )}
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-bold transition-all duration-200",
              collapsed && "justify-center px-0 py-2.5 mx-1",
              active
                ? "text-accent-500"
                : "text-text-secondary hover:bg-sunken hover:text-text-primary"
            )}
          >
            {active && (
              <>
                <span
                  className="pointer-events-none absolute inset-0 rounded-lg bg-[linear-gradient(90deg,rgba(74,95,220,0.14),rgba(14,127,157,0.06)_60%,transparent)] shadow-[inset_0_0_0_1px_rgba(74,95,220,0.18)] dark:bg-[linear-gradient(90deg,rgba(138,155,237,0.22),rgba(91,197,222,0.08)_60%,transparent)]"
                  aria-hidden
                />
                <span className="pointer-events-none absolute -right-8 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-accent-500/20 blur-2xl opacity-80" />
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-gradient-to-b from-accent-500 to-accent-400 shadow-[0_0_10px_rgba(74,95,220,0.6)]" />
              </>
            )}
            <Icon
              className={cn(
                "relative h-[18px] w-[18px] shrink-0 transition-all duration-200",
                active && "scale-110 drop-shadow-[0_0_5px_rgba(74,95,220,0.35)]",
                !active && "group-hover:scale-110 group-hover:-rotate-3"
              )}
            />
            {!collapsed && (
              <span className="relative flex-1 truncate">{item.label}</span>
            )}
            {!collapsed && item.badge ? (
              <span
                className={cn(
                  "relative inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ring-1",
                  item.badgeTone === "risk"
                    ? "bg-[linear-gradient(135deg,rgba(201,58,58,0.95),rgba(232,89,89,0.95))] text-white shadow-[var(--shadow-glow-risk)] ring-risk-500/20 animate-pulse-glow"
                    : item.badgeTone === "accent"
                      ? "bg-[linear-gradient(135deg,var(--accent-500),var(--ramp-4))] text-accent-contrast shadow-[var(--shadow-glow-accent)] ring-accent-500/20"
                      : "bg-sunken text-text-secondary ring-border-default"
                )}
              >
                {item.badge}
              </span>
            ) : collapsed && item.badge ? (
              <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 items-center justify-center">
                <Circle
                  className="h-2.5 w-2.5 fill-risk-500 text-risk-500 drop-shadow-[0_0_6px_rgba(201,58,58,0.7)] animate-pulse"
                  strokeWidth={2}
                />
                <span className="absolute inset-0 rounded-full bg-risk-500/40 animate-ping" />
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
