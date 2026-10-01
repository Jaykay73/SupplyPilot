"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  ShieldAlert,
  PackageSearch,
  Warehouse,
  Building2,
  Factory,
  Activity,
  History,
  LogOut,
  Sparkles,
  ChevronRight,
  UserCheck,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent", label: "Operations Copilot", icon: Bot },
  { href: "/approvals", label: "Approvals Center", icon: ShieldAlert, hasBadge: true },
  { href: "/orders", label: "Orders & Risk", icon: PackageSearch },
  { href: "/inventory", label: "Inventory Levels", icon: Warehouse },
  { href: "/suppliers", label: "Suppliers", icon: Building2 },
  { href: "/production", label: "Production MPS", icon: Factory },
  { href: "/runs", label: "Agent Run Traces", icon: Activity },
  { href: "/audit", label: "Audit Timeline", icon: History },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout, quickSwitchRole } = useAuth();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simNotification, setSimNotification] = useState<string | null>(null);

  useEffect(() => {
    async function checkPending() {
      try {
        const approvals = await api.getApprovals("PENDING");
        if (Array.isArray(approvals)) {
          setPendingApprovalsCount(approvals.length);
        }
      } catch {
        // Backend not logged in or offline yet
      }
    }
    checkPending();
    const interval = setInterval(checkPending, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSimulateDelay = async () => {
    setIsSimulating(true);
    setSimNotification(null);
    try {
      const res = await api.simulateFlagshipDelay();
      setSimNotification(
        `Cascade DELAY-2026-001 simulated! ${res.affected_orders?.length || 1} orders impacted. Check Agent Copilot.`
      );
      setTimeout(() => setSimNotification(null), 6000);
      const approvals = await api.getApprovals("PENDING");
      if (Array.isArray(approvals)) setPendingApprovalsCount(approvals.length);
    } catch (e: any) {
      setSimNotification(`Simulation error: ${e.message}`);
      setTimeout(() => setSimNotification(null), 5000);
    } finally {
      setIsSimulating(false);
    }
  };

  const getRoleBadge = (roleName?: string) => {
    switch (roleName) {
      case "operations_manager":
        return { label: "Operations Manager", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" };
      case "production_planner":
        return { label: "Production Planner", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
      case "admin":
        return { label: "System Admin", color: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
      default:
        return { label: "Procurement Officer", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0d121f] flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Brand */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
                SupplyPilot
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">PharmaPulse Synthetics</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasBadge && pendingApprovalsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & 1-Click Role Switcher */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs shrink-0 font-medium">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-slate-200 truncate">{user?.full_name || "Demo User"}</p>
                <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded border font-mono ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-slate-500 hover:text-slate-300 p-1.5 rounded hover:bg-slate-800/60 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Role Switcher */}
          <div className="pt-2 border-t border-slate-800/60">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-slate-400" /> Switch Role:
            </label>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                onClick={() => quickSwitchRole("procurement_officer")}
                className={`px-2 py-1 rounded text-left border transition ${
                  user?.role === "procurement_officer"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold"
                    : "bg-slate-800/40 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                Procurement
              </button>
              <button
                onClick={() => quickSwitchRole("operations_manager")}
                className={`px-2 py-1 rounded text-left border transition ${
                  user?.role === "operations_manager"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold"
                    : "bg-slate-800/40 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                Op Manager
              </button>
              <button
                onClick={() => quickSwitchRole("production_planner")}
                className={`px-2 py-1 rounded text-left border transition ${
                  user?.role === "production_planner"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40 font-semibold"
                    : "bg-slate-800/40 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                Planner
              </button>
              <button
                onClick={() => quickSwitchRole("admin")}
                className={`px-2 py-1 rounded text-left border transition ${
                  user?.role === "admin"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold"
                    : "bg-slate-800/40 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800/80 bg-[#0d121f]/90 backdrop-blur px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">Operations Console</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="capitalize text-emerald-400 font-medium">
              {pathname === "/" ? "Dashboard" : pathname.replace("/", "").replace("-", " ")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulation Notification */}
            {simNotification && (
              <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full animate-fade-in">
                {simNotification}
              </span>
            )}

            {/* Quick 1-Click Flagship Simulation Action */}
            <button
              onClick={handleSimulateDelay}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition disabled:opacity-50"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>{isSimulating ? "Simulating..." : "Simulate Flagship Delay"}</span>
            </button>

            {/* Backend Status indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-400">Agent Live</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
