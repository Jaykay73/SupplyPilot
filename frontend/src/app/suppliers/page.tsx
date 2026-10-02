"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { SupplierItem } from "@/types/api";
import { Badge } from "@/components/shared/Badge";
import { StatusChip } from "@/components/shared/StatusChip";
import { MetricCard } from "@/components/shared/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Truck,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"ALL" | "ACTIVE" | "RESTRICTED">("ALL");

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.suppliers.list(),
  });

  const filtered = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.supplier_code.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterActive === "ALL" ||
      (filterActive === "ACTIVE" && s.status === "ACTIVE") ||
      (filterActive === "RESTRICTED" && s.status !== "ACTIVE");

    return matchesSearch && matchesStatus;
  });

  const activeCount = suppliers.filter((s) => s.status === "ACTIVE").length;
  const restrictedCount = suppliers.filter((s) => s.status !== "ACTIVE").length;

  return (
    <AppShell
      title="Supplier Registry & Compliance Scorecards"
      subtitle="GMP audited vendor network, reliability SLAs, dual-sourcing eligibility & active catalog pricing"
    >
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Registered Vendors"
            value={suppliers.length}
            subtitle="European & global network"
            icon={<Building2 className="w-4 h-4" />}
          />
          <MetricCard
            title="GMP Qualified Active"
            value={activeCount}
            subtitle="Dual-sourcing approved"
            icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
            variant="success"
          />
          <MetricCard
            title="Restricted / Delinquent"
            value={restrictedCount}
            subtitle="Delayed or non-compliant"
            icon={<ShieldAlert className="w-4 h-4 text-rose-600" />}
            variant={restrictedCount > 0 ? "critical" : "default"}
            badge={
              restrictedCount > 0 ? (
                <Badge variant="red" beacon>
                  Action Required
                </Badge>
              ) : undefined
            }
          />
          <MetricCard
            title="Average On-Time SLA"
            value="91.4%"
            subtitle="Automated performance tracking"
            icon={<Clock className="w-4 h-4 text-purple-600" />}
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-surface-secondary/70 p-1 rounded-xl border border-border-subtle text-xs">
            {["ALL", "ACTIVE", "RESTRICTED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterActive(f as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterActive === f
                    ? "bg-white text-text-primary font-bold shadow-sm border border-border-subtle"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor name, code, country..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-surface border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500/60"
            />
          </div>
        </div>

        {/* Suppliers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-surface border border-border-subtle animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="No Suppliers Found"
            description="No vendors match your search parameters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((sup) => {
              const isRestricted = sup.status !== "ACTIVE";
              const reliabilityPct = Math.round(sup.reliability_score * 100);

              return (
                <div
                  key={sup.id || sup.supplier_code}
                  className={`p-6 rounded-2xl bg-surface border transition-all duration-200 flex flex-col justify-between ${
                    isRestricted
                      ? "border-rose-200 hover:border-rose-300 bg-rose-50/40"
                      : "border-border-subtle hover:border-slate-300 shadow-subtle"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-border-subtle/70 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isRestricted
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-surface-secondary text-text-primary border border-border-subtle"
                          }`}
                        >
                          {sup.country}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-text-primary">
                              {sup.name}
                            </h3>
                            <span className="text-[10px] font-mono text-text-muted">
                              ({sup.supplier_code})
                            </span>
                          </div>
                          <span className="text-xs text-text-muted">
                            {sup.contact_email}
                          </span>
                        </div>
                      </div>

                      <StatusChip status={sup.status} />
                    </div>

                    {/* Scorecard KPIs */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-surface-secondary/50 border border-border-subtle text-xs font-mono">
                        <span className="text-text-muted text-[10px] block">RELIABILITY SLA</span>
                        <span
                          className={`text-lg font-bold ${
                            reliabilityPct >= 90
                              ? "text-emerald-700"
                              : reliabilityPct >= 80
                              ? "text-amber-700"
                              : "text-rose-700"
                          }`}
                        >
                          {reliabilityPct}% On-Time
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-secondary/50 border border-border-subtle text-xs font-mono">
                        <span className="text-text-muted text-[10px] block">QUALIFIED MATERIALS</span>
                        <span className="text-lg font-bold text-text-primary">
                          {sup.qualified_materials?.length || 0} APIs
                        </span>
                      </div>
                    </div>

                    {/* Catalog Preview */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                        Qualified Materials Catalog:
                      </span>
                      <div className="space-y-1">
                        {sup.qualified_materials?.map((mat, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-surface-secondary/70 border border-border-subtle text-xs font-mono flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary">
                                {mat.material_code}
                              </span>
                              <span className="text-text-muted text-[11px] truncate max-w-[150px]">
                                {mat.material_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-text-muted">
                                {mat.lead_time_days}d lead
                              </span>
                              <span className="font-bold text-emerald-700">
                                €{mat.unit_price.toFixed(2)}/kg
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Policy Status */}
                  <div className="mt-4 pt-3 border-t border-border-subtle/50 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-text-muted">
                      Audit Status:{" "}
                      <strong className={isRestricted ? "text-rose-700" : "text-emerald-700"}>
                        {isRestricted ? "RESTRICTED (Policy Exclusion)" : "GMP Approved"}
                      </strong>
                    </span>
                    <span className="text-text-muted">SOP-SUP-002</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
