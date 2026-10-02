"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { ProductionBatch, ProductionLine } from "@/types/api";
import { StatusChip } from "@/components/shared/StatusChip";
import { Badge } from "@/components/shared/Badge";
import { MetricCard } from "@/components/shared/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";
import {
  Factory,
  Cpu,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function ProductionPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Fetch batches
  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["production-batches"],
    queryFn: () => api.production.listBatches(),
  });

  // Fetch lines
  const { data: lines = [], isLoading: linesLoading } = useQuery({
    queryKey: ["production-lines"],
    queryFn: () => api.production.listLines(),
  });

  // Check capacity for PRD-004
  const { data: capacityData } = useQuery({
    queryKey: ["production-capacity", "PRD-004", "2026-10-20"],
    queryFn: () => api.production.checkCapacity("PRD-004", "2026-10-20"),
  });

  const filteredBatches = batches.filter((b) => {
    return (
      statusFilter === "ALL" ||
      b.status.toUpperCase() === statusFilter.toUpperCase()
    );
  });

  const stalledCount = batches.filter((b) => b.status === "STALLED_SHORTAGE").length;

  return (
    <AppShell
      title="Master Production Schedule (MPS)"
      subtitle="Cleanroom sterile lines, batch sequencing, freeze-window governance & capacity telemetry"
    >
      <div className="space-y-8">
        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Cleanroom Lines"
            value={lines.length || 2}
            subtitle="ISO-5 / Class A sterile environment"
            icon={<Factory className="w-4 h-4 text-emerald-600" />}
          />
          <MetricCard
            title="Scheduled Batches"
            value={batches.length}
            subtitle="Fulfillment runs in queue"
            icon={<Calendar className="w-4 h-4 text-purple-600" />}
          />
          <MetricCard
            title="Stalled Batches"
            value={stalledCount}
            subtitle={stalledCount > 0 ? "Blocked by raw material shortage" : "All batches active"}
            icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
            variant={stalledCount > 0 ? "critical" : "default"}
            badge={
              stalledCount > 0 ? (
                <Badge variant="red" beacon>
                  Shortage Alert
                </Badge>
              ) : undefined
            }
          />
          <MetricCard
            title="Line Efficiency"
            value="98.5%"
            subtitle="OEE performance rating"
            icon={<Cpu className="w-4 h-4 text-cyan-600" />}
          />
        </div>

        {/* Cleanroom Lines Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono">
              Manufacturing Lines & Line Telemetry
            </h3>
            <span className="text-xs font-mono text-text-muted">
              48hr Freeze-Window Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lines.map((line) => (
              <div
                key={line.id}
                className="p-5 rounded-2xl bg-surface border border-border-subtle flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-text-primary">
                        <Factory className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">
                          {line.name}
                        </h4>
                        <span className="text-[10px] font-mono text-text-muted">
                          Code: {line.line_code} · {line.category}
                        </span>
                      </div>
                    </div>

                    <Badge variant="emerald" beacon>
                      Operational
                    </Badge>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    Dedicated aseptic compounding and terminal sterilization line for oncology suspensions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-secondary/60 border border-border-subtle text-xs font-mono">
                  <div>
                    <span className="text-text-muted text-[10px] block">DAILY CAPACITY</span>
                    <span className="text-text-primary font-bold">
                      {line.daily_capacity_hours} Hours / Day
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] block">EFFICIENCY FACTOR</span>
                    <span className="text-emerald-700 font-bold">
                      {Math.round(line.efficiency_factor * 100)}% Standard
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Production Schedule Timeline */}
        <div className="rounded-2xl bg-surface border border-border-subtle shadow-elevation overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Master Batch Schedule & Timeline
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Current and planned manufacturing lots with component reservation states.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-surface-secondary/70 p-1 rounded-xl border border-border-subtle text-xs">
              {["ALL", "SCHEDULED", "RUNNING", "STALLED_SHORTAGE", "COMPLETED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === f
                      ? "bg-white text-text-primary font-bold shadow-sm border border-border-subtle"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {f === "STALLED_SHORTAGE" ? "Stalled" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Batches Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-secondary/80 text-text-muted border-b border-border-subtle uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Batch Number</th>
                  <th className="p-3">Product SKU</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Target Output</th>
                  <th className="p-3">Scheduled Start</th>
                  <th className="p-3">Scheduled End</th>
                  <th className="p-3">Assigned Line</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {batchesLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="p-4 bg-surface-secondary/20 h-12" />
                    </tr>
                  ))
                ) : filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center">
                      <EmptyState
                        icon="inbox"
                        title="No Batches Found"
                        description="No manufacturing batches match the selected filter."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => {
                    const isStalled = batch.status === "STALLED_SHORTAGE";
                    return (
                      <tr
                        key={batch.id || batch.batch_number}
                        className={`hover:bg-surface-secondary/40 transition-colors ${
                          isStalled ? "bg-rose-50/60" : ""
                        }`}
                      >
                        <td className="p-3 font-bold text-text-primary">
                          {batch.batch_number}
                        </td>
                        <td className="p-3 text-purple-700 font-bold">
                          {batch.product_sku}
                        </td>
                        <td className="p-3 text-slate-800 font-sans font-medium">
                          {batch.product_name}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-700">
                          {batch.target_quantity.toLocaleString()} vials
                        </td>
                        <td className="p-3 text-slate-700">
                          {formatDate(batch.scheduled_start_date)}
                        </td>
                        <td className="p-3 text-slate-700">
                          {formatDate(batch.scheduled_end_date)}
                        </td>
                        <td className="p-3 text-text-muted">
                          {batch.line_id || "Line 1 Sterile"}
                        </td>
                        <td className="p-3 text-center">
                          <StatusChip status={batch.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
