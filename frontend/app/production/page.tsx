"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Factory,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function ProductionPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadBatches() {
      try {
        setLoading(true);
        const data = await api.getProductionBatches();
        setBatches(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load production batches:", e);
      } finally {
        setLoading(false);
      }
    }
    loadBatches();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Factory className="h-6 w-6 text-emerald-400" />
              Master Production Schedule (MPS)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              PharmaPulse Cleanroom Lines A &amp; B batch planning, equipment capacity, and freeze-window compliance.
            </p>
          </div>
        </div>

        {/* Cleanroom Lines Capacity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-100">Cleanroom Line A (Sterile Injectables)</h3>
                <p className="text-xs text-slate-400">Liposomal vials, lyophilization, aseptic packaging</p>
              </div>
              <span className="font-mono text-sm font-bold text-amber-400">78% Utilization</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-400 h-2 rounded-full" style={{ width: "78%" }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Next Available Window: Oct 19, 2026</span>
              <span className="text-amber-400">24-Hour Freeze Window Active</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-100">Cleanroom Line B (Oral Solid Dosage)</h3>
                <p className="text-xs text-slate-400">High-shear granulation, tablet compression, blister packs</p>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-400">62% Utilization</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-400 h-2 rounded-full" style={{ width: "62%" }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Next Available Window: Oct 14, 2026</span>
              <span className="text-emerald-400">Normal Operating State</span>
            </div>
          </div>
        </div>

        {/* Master Production Schedule Table */}
        <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Scheduled Production Batches
            </h2>
            <span className="text-xs font-mono text-slate-400">{batches.length} Planned Batches</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Batch Number</th>
                  <th className="py-3 px-4 font-semibold">Product SKU</th>
                  <th className="py-3 px-4 font-semibold">Planned Quantity</th>
                  <th className="py-3 px-4 font-semibold">Cleanroom Line</th>
                  <th className="py-3 px-4 font-semibold">Scheduled Start</th>
                  <th className="py-3 px-4 font-semibold">Scheduled End</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 animate-pulse">
                      Loading master production schedule...
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No active production batches found.
                    </td>
                  </tr>
                ) : (
                  batches.map((b) => {
                    const isFlagshipBatch = b.batch_number === "BATCH-2026-101";

                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-slate-800/40 transition ${
                          isFlagshipBatch ? "bg-amber-500/5 border-l-2 border-l-amber-400" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                          {b.batch_number}
                          {isFlagshipBatch && (
                            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              MEDIX LOT
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{b.product_sku}</td>
                        <td className="py-3 px-4 font-mono text-slate-200">
                          {b.planned_quantity.toLocaleString()} units
                        </td>
                        <td className="py-3 px-4 text-slate-300">{b.production_line}</td>
                        <td className="py-3 px-4 text-slate-400">{formatDate(b.scheduled_start_date)}</td>
                        <td className="py-3 px-4 text-slate-400">{formatDate(b.scheduled_end_date)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                              b.status === "COMPLETED"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : b.status === "SCHEDULED"
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/agent?query=Evaluate production capacity and line schedule for batch ${b.batch_number}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] transition"
                          >
                            <Sparkles className="h-3 w-3" /> Analyze
                          </Link>
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
