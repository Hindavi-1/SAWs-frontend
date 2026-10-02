"use client";

import { cn } from "@/lib/utils";
import {
  Inbox,
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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import * as api from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "outreach" | "actions";
}

const WORK_NAV: NavItem[] = [
  { href: "/outreach-review", label: "Outreach Review", icon: Inbox, badgeKey: "outreach" },
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/actions", label: "Action Queue", icon: ListChecks, badgeKey: "actions" },
];

const PIPELINE_NAV: NavItem[] = [
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/discovery", label: "Discovery", icon: Search },
  { href: "/engagement", label: "Engagement", icon: MessagesSquare },
];

const PLATFORM_NAV: NavItem[] = [
  { href: "/intelligence", label: "Sales Intelligence", icon: LineChart },
  { href: "/icp-outcomes", label: "ICP & Outcomes", icon: Target },
  { href: "/compliance", label: "Compliance & Quality", icon: ShieldCheck },
  { href: "/crm-sync", label: "CRM Sync", icon: RefreshCw },
  { href: "/module-ops", label: "Module Ops", icon: Boxes },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [badgeCounts, setBadgeCounts] = React.useState<{ outreach: number; actions: number }>({
    outreach: 3,
    actions: 4,
  });

  React.useEffect(() => {
    Promise.all([api.getApprovalQueue(), api.getAccounts()]).then(([queue]) => {
      const outreachItems = queue.filter((item) => item.kind === "outreach_email");
      const otherActions = queue.filter((item) => item.kind !== "outreach_email");
      setBadgeCounts({
        outreach: outreachItems.length || 3, // fallback to active queue sample
        actions: otherActions.length,
      });
    }).catch(() => {
      // Graceful fallback
    });
  }, []);

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col border-r border-border-subtle bg-raised transition-[width] duration-200 ease-out select-none",
        collapsed ? "w-[64px]" : "w-[236px]"
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex h-14 items-center gap-2.5 border-b border-border-subtle px-3.5",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-accent-500 font-mono text-[11px] font-bold text-white shadow-sm">
          <span>SW</span>
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold tracking-tight text-text-primary">
              SAWFs Workspace
            </span>
            <span className="block text-[10px] font-medium text-text-tertiary truncate">
              Agentic Sales Engine
            </span>
          </div>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3 scrollbar-thin">
        <NavGroup
          label="Work"
          items={WORK_NAV}
          pathname={pathname}
          collapsed={collapsed}
          badges={badgeCounts}
        />
        <NavGroup
          label="Pipeline"
          items={PIPELINE_NAV}
          pathname={pathname}
          collapsed={collapsed}
          badges={badgeCounts}
        />
        <NavGroup
          label="Platform"
          items={PLATFORM_NAV}
          pathname={pathname}
          collapsed={collapsed}
          badges={badgeCounts}
        />
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border-subtle p-2">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "flex h-8 w-full items-center justify-center rounded-[var(--radius-sm)] text-text-tertiary transition-colors hover:bg-sunken hover:text-text-primary",
            !collapsed && "justify-between px-2.5 text-xs font-medium"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!collapsed && <span>Collapse Sidebar</span>}
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}

function NavGroup({
  items,
  pathname,
  collapsed,
  label,
  badges,
}: {
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  label?: string;
  badges: { outreach: number; actions: number };
}) {
  return (
    <div className="space-y-0.5">
      {label && !collapsed && (
        <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
          {label}
        </p>
      )}
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const count = item.badgeKey ? badges[item.badgeKey] : undefined;

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? `${item.label}${count ? ` (${count})` : ""}` : undefined}
            className={cn(
              "group relative flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium transition-colors",
              collapsed && "justify-center px-0 py-2",
              active
                ? "bg-accent-50/80 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400 font-semibold"
                : "text-text-secondary hover:bg-sunken hover:text-text-primary"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-accent-500" />
            )}
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                active ? "text-accent-500" : "text-text-tertiary group-hover:text-text-secondary"
              )}
            />
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            {!collapsed && count !== undefined && count > 0 && (
              <span
                className={cn(
                  "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  item.badgeKey === "outreach"
                    ? "bg-accent-500 text-white"
                    : "bg-sunken text-text-secondary border border-border-default"
                )}
              >
                {count}
              </span>
            )}
            {collapsed && count !== undefined && count > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-raised" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
