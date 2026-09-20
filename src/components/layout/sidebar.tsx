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
        "relative flex h-full shrink-0 flex-col border-r border-border-subtle bg-raised transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2.5 border-b border-border-subtle px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-accent-500 to-accent-600 font-mono text-xs font-bold text-accent-contrast shadow-[0_4px_12px_-2px_rgba(74,95,220,0.45)] transition-transform duration-200 hover:scale-105">
          <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-amber-300" />
          SW
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="block text-[15px] font-bold tracking-tight text-text-primary">SAWFs</span>
            <span className="block text-[10px] font-medium text-text-tertiary">Sales Agentic Workflows</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-4">
        <NavGroup items={PRIMARY} pathname={pathname} collapsed={collapsed} />
        <div className={cn("my-4 border-t border-border-subtle", collapsed && "mx-1.5")} />
        <NavGroup items={PLATFORM} pathname={pathname} collapsed={collapsed} label="Platform" />
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="group flex h-12 items-center justify-center gap-2 border-t border-border-subtle text-text-tertiary transition-all hover:bg-sunken hover:text-accent-500"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md transition-colors group-hover:bg-accent-50 group-hover:text-accent-500 dark:group-hover:bg-accent-500/10">
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
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
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
          {label}
        </p>
      )}
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200",
              collapsed && "justify-center px-0 py-2.5 mx-1",
              active
                ? "bg-gradient-to-r from-accent-500/10 to-accent-500/5 text-accent-500 shadow-[inset_0_0_0_1px_rgba(74,95,220,0.15)] dark:from-accent-500/15 dark:to-accent-500/5"
                : "text-text-secondary hover:bg-sunken hover:text-text-primary"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-accent-500" />
            )}
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-transform duration-200",
                active && "scale-110",
                !active && "group-hover:scale-110"
              )}
            />
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            {!collapsed && item.badge ? (
              <span
                className={cn(
                  "inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  item.badgeTone === "risk"
                    ? "bg-risk-500 text-white shadow-[0_2px_6px_-1px_rgba(201,58,58,0.5)]"
                    : item.badgeTone === "accent"
                      ? "bg-accent-500 text-accent-contrast"
                      : "bg-sunken text-text-secondary ring-1 ring-border-default"
                )}
              >
                {item.badge}
              </span>
            ) : collapsed && item.badge ? (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-risk-500 ring-2 ring-raised" />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
