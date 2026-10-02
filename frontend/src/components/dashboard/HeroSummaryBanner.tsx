"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardSummary } from "@/types/api";
import { Sparkles, AlertTriangle, ShieldCheck, Factory, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/shared/Badge";

interface HeroSummaryBannerProps {
  summary?: DashboardSummary;
  isLoading: boolean;
}

export function HeroSummaryBanner({ summary, isLoading }: HeroSummaryBannerProps) {
  const { user } = useAuth();

  const atRiskCount = summary?.at_risk_orders_count ?? 0;
  const pendingApprovals = summary?.pending_approvals_count ?? 0;
  const activeBatches = summary?.active_batches_count ?? 0;

  const firstName = user?.full_name?.split(" ")[0] || "Operator";

  return (
    <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-surface to-surface-secondary border border-border-subtle overflow-hidden">
      <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Operations Command Console
            </span>
            <span className="text-text-muted">·</span>
            <Badge variant="emerald" beacon>
              SYSTEM OPERATIONAL
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Welcome back, {firstName}.
          </h2>
          <p className="mt-1 text-sm text-text-secondary max-w-xl">
            Pharmaceutical synthesis and packaging lines are running under active ERP
            and MES supervision.
          </p>
        </div>

        {/* Live System Posture Indicator Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface border border-border-subtle text-xs font-mono shadow-subtle">
            <div className="w-2 h-2 rounded-full bg-amber-500 beacon-amber" />
            <span className="text-text-secondary">Supply Risks:</span>
            <span className="text-amber-600 font-bold">
              {isLoading ? "..." : `${atRiskCount} Require Review`}
            </span>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface border border-border-subtle text-xs font-mono shadow-subtle">
            <div className="w-2 h-2 rounded-full bg-accent-purple" />
            <span className="text-text-secondary">Approvals Waiting:</span>
            <span className="text-purple-600 font-bold">
              {isLoading ? "..." : pendingApprovals}
            </span>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface border border-border-subtle text-xs font-mono shadow-subtle">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-text-secondary">Cleanroom Batches:</span>
            <span className="text-emerald-600 font-bold">
              {isLoading ? "..." : `${activeBatches} Active`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
