"use client";

import React from "react";
import { DashboardSummary } from "@/types/api";
import { MetricCard } from "@/components/shared/MetricCard";
import {
  ShoppingCart,
  Clock,
  AlertTriangle,
  CheckSquare,
  Factory,
  Building2,
  Boxes,
} from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { useRouter } from "next/navigation";

interface KpiGridProps {
  summary?: DashboardSummary;
  isLoading: boolean;
}

export function KpiGrid({ summary, isLoading }: KpiGridProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-surface border border-border-subtle animate-pulse"
          />
        ))}
      </div>
    );
  }

  const atRiskCount = summary?.at_risk_orders_count ?? 0;
  const pendingApprovalsCount = summary?.pending_approvals_count ?? 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
      {/* 1. Total Orders */}
      <MetricCard
        title="Total Orders"
        value={summary?.total_orders ?? 0}
        subtitle="Global demand catalog"
        icon={<ShoppingCart className="w-4 h-4" />}
        onClick={() => router.push("/orders")}
      />

      {/* 2. Open Orders */}
      <MetricCard
        title="Open Orders"
        value={summary?.open_orders ?? 0}
        subtitle="In fulfillment pipeline"
        icon={<Clock className="w-4 h-4" />}
        onClick={() => router.push("/orders?status=processing")}
      />

      {/* 3. Orders At Risk (Dominant Metric) */}
      <MetricCard
        title="At Risk"
        value={atRiskCount}
        subtitle={atRiskCount > 0 ? "BOM or delivery deficit" : "Zero deficits"}
        icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
        variant={atRiskCount > 0 ? "warning" : "default"}
        badge={
          atRiskCount > 0 ? (
            <Badge variant="amber" beacon>
              Attention
            </Badge>
          ) : undefined
        }
        onClick={() => router.push("/orders")}
      />

      {/* 4. Pending Approvals (Dominant Metric) */}
      <MetricCard
        title="Approvals"
        value={pendingApprovalsCount}
        subtitle="Staged for sign-off"
        icon={<CheckSquare className="w-4 h-4 text-purple-600" />}
        variant={pendingApprovalsCount > 0 ? "purple" : "default"}
        badge={
          pendingApprovalsCount > 0 ? (
            <Badge variant="purple" beacon>
              Review
            </Badge>
          ) : undefined
        }
        onClick={() => router.push("/approvals")}
      />

      {/* 5. Active Batches */}
      <MetricCard
        title="Batches"
        value={summary?.active_batches_count ?? 0}
        subtitle="Cleanrooms 1 & 2"
        icon={<Factory className="w-4 h-4 text-emerald-600" />}
        onClick={() => router.push("/production")}
      />

      {/* 6. Qualified Suppliers */}
      <MetricCard
        title="Suppliers"
        value={summary?.suppliers_count ?? 0}
        subtitle="GMP certified vendors"
        icon={<Building2 className="w-4 h-4" />}
        onClick={() => router.push("/suppliers")}
      />

      {/* 7. Raw Materials */}
      <MetricCard
        title="Materials"
        value={summary?.raw_materials_count ?? 0}
        subtitle="Active API catalog"
        icon={<Boxes className="w-4 h-4" />}
        onClick={() => router.push("/inventory")}
      />
    </div>
  );
}
