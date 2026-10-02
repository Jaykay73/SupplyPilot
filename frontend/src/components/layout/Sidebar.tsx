"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  ShoppingCart,
  Boxes,
  Building2,
  Factory,
  GitFork,
  Terminal,
  ScrollText,
  Activity,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleSwitcher } from "./RoleSwitcher";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const CORE_NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Copilot",
    href: "/agent",
    icon: Bot,
    highlight: true,
  },
  {
    name: "Approvals",
    href: "/approvals",
    icon: CheckSquare,
    badgeKey: "pending_approvals_count",
  },
  {
    name: "Activity",
    href: "/audit",
    icon: Activity,
  },
];

const SECONDARY_NAV_ITEMS = [
  { name: "Disruption Cascade", href: "/cascade", icon: GitFork },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Boxes },
  { name: "Suppliers", href: "/suppliers", icon: Building2 },
  { name: "Production MPS", href: "/production", icon: Factory },
  { name: "Agent Runs", href: "/runs", icon: Terminal },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [showMore, setShowMore] = React.useState(false);

  // Query summary for live approval badge count
  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.dashboard.getSummary(),
    refetchInterval: 15000,
  });

  const pendingApprovalsCount = summary?.pending_approvals_count || 0;

  return (
    <aside className="w-64 h-screen flex flex-col bg-surface border-r border-border-subtle flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-border-subtle flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-purple-600 flex items-center justify-center shadow-glow-emerald/30 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 text-white font-bold" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-text-primary flex items-center gap-1.5">
                <span>SupplyPilot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald beacon-emerald" />
              </div>
              <span className="text-[10px] text-text-muted tracking-wide uppercase font-mono block">
                Autonomous Ops
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-between px-2.5 py-1 rounded bg-surface-secondary border border-border-subtle text-[10px] font-mono text-text-muted">
          <span>SIMULATION ENV</span>
          <span className="text-emerald-600 font-semibold">LIVE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Core Primary Navigation (4 Areas) */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Core Navigation
          </div>
          {CORE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));
            const Icon = item.icon;
            const badgeCount = item.badgeKey === "pending_approvals_count" ? pendingApprovalsCount : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-surface-secondary text-text-primary border border-border-subtle font-bold shadow-subtle"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? item.highlight
                          ? "text-accent-purple"
                          : "text-accent-emerald"
                        : item.highlight
                        ? "text-purple-600 group-hover:text-purple-700"
                        : "text-text-muted group-hover:text-text-secondary"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {badgeCount !== null && badgeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation (Collapsible) */}
        <div className="pt-2 border-t border-border-subtle/60">
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-text-muted hover:text-text-secondary rounded-lg transition-colors font-medium"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider">
              {showMore ? "Hide Workspaces" : "More Operations"}
            </span>
            <span className="text-[10px] font-mono text-purple-600">
              {showMore ? "▲" : "▼ 6"}
            </span>
          </button>

          {showMore && (
            <div className="mt-1 space-y-0.5 pl-1 animate-in fade-in duration-200">
              {SECONDARY_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
                      isActive
                        ? "bg-surface-secondary text-text-primary font-bold"
                        : "text-text-muted hover:text-text-primary hover:bg-surface-secondary/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Role Switcher & Footer */}
      <div className="p-3 border-t border-border-subtle flex flex-col gap-2.5">
        <RoleSwitcher />

        <Link
          href="/"
          className="flex items-center justify-between px-3 py-1.5 text-xs text-text-muted hover:text-text-secondary rounded-lg hover:bg-surface-secondary transition-colors"
        >
          <span>Return to Product Tour</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
