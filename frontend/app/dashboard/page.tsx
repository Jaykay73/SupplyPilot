"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PackageCheck,
  AlertTriangle,
  Clock,
  Warehouse,
  Factory,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Zap,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, getRiskBadgeClass } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cascadeResult, setCascadeResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getDashboardSummary();
        setSummary(data);
      } catch (e) {
        console.error("Failed to load dashboard summary:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSimulateCascade = async () => {
    setIsSimulating(true);
    try {
      const res = await api.simulateFlagshipDelay();
      setCascadeResult(res);
      // Reload dashboard summary to reflect updated risk counts
      const updated = await api.getDashboardSummary();
      setSummary(updated);
    } catch (e: any) {
      alert(`Simulation failed: ${e.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome & System State Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Operations Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">
              PharmaPulse Synthetics — Active monitoring across inventory, batches, suppliers, and procurement gates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/agent"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Operations Copilot</span>
            </Link>
          </div>
        </div>

        {/* Executive KPI Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-100">{summary?.total_orders ?? "124"}</span>
              <span className="text-[11px] font-mono text-emerald-400">{summary?.open_orders ?? "118"} open</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Orders At Risk</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold text-amber-400">{summary?.at_risk_orders_count ?? "1"}</span>
              <span className="text-[11px] font-mono text-rose-400">Medix Flagship</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold text-purple-400">{summary?.pending_approvals_count ?? "0"}</span>
              <Link href="/approvals" className="text-[11px] text-purple-400 hover:underline">
                View Queue
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Catalog Materials</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-100">{summary?.raw_materials_count ?? "20"}</span>
              <span className="text-[11px] text-slate-400">20 Active APIs</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Finished Products</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-100">{summary?.products_count ?? "10"}</span>
              <span className="text-[11px] text-slate-400">10 Formulations</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Production MPS</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold text-blue-400">{summary?.active_batches_count ?? "4"}</span>
              <span className="text-[11px] text-slate-400">Cleanroom A/B</span>
            </div>
          </div>
        </div>

        {/* Flagship Demonstration Interactive Card */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#0d121f] to-[#0d121f] p-5 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  FLAGSHIP SCENARIO: DELAY-2026-001
                </span>
                <span className="text-xs text-slate-400">Medix Order ORD-1847 Disruption</span>
              </div>
              <h2 className="text-base font-semibold text-slate-100 mt-1">
                Simulate 5-Day Supplier Delay & Multi-Tier Cascade Propagation
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulates BioSynth Corp (SUP-007) shipment delay for API-004, causing production batch stoppage and customer delivery risk.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSimulateCascade}
                disabled={isSimulating}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                <span>{isSimulating ? "Propagating Cascade..." : "Execute Delay Simulation"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Cascade Breakdown */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">1. Supplier Delay</span>
              <p className="text-xs font-semibold text-slate-200 mt-1">BioSynth Corp (SUP-007)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">API-004 delayed +5 days (ETA: Oct 17)</p>
              <span className="inline-block mt-2 text-[10px] text-rose-400 font-mono">Policy SOP-PRC-002 Flag</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">2. Component Shortage</span>
              <p className="text-xs font-semibold text-slate-200 mt-1">API-004 Deficit: 700 kg</p>
              <p className="text-[11px] text-slate-400 mt-0.5">800 kg in stock vs 1,500 kg batch demand</p>
              <span className="inline-block mt-2 text-[10px] text-amber-400 font-mono">BOM Level 1 Deficit</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">3. Production Block</span>
              <p className="text-xs font-semibold text-slate-200 mt-1">Batch BATCH-2026-101</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Cleanroom Line A cannot start on Oct 12</p>
              <span className="inline-block mt-2 text-[10px] text-rose-400 font-mono">Schedule Stalled</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">4. AI Agent Solution</span>
              <p className="text-xs font-semibold text-slate-200 mt-1">Dual-Source: Apex Pharma</p>
              <p className="text-[11px] text-slate-400 mt-0.5">1,500 kg @ €5.60/kg = €8,400 (3 days)</p>
              <Link
                href="/agent"
                className="inline-flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-semibold hover:underline"
              >
                Resolve with Copilot <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: At-Risk Orders & Pending Approvals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* At-Risk Orders Table (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-[#0d121f] border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Critical & High-Risk Customer Orders
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Orders subject to component deficit or deadline pressure.</p>
              </div>
              <Link href="/orders" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                View All Orders <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                  <tr>
                    <th className="pb-2.5 font-medium">Order #</th>
                    <th className="pb-2.5 font-medium">Customer</th>
                    <th className="pb-2.5 font-medium">Delivery Deadline</th>
                    <th className="pb-2.5 font-medium">Total Value</th>
                    <th className="pb-2.5 font-medium">Risk Level</th>
                    <th className="pb-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-normal">
                  {summary?.at_risk_orders && summary.at_risk_orders.length > 0 ? (
                    summary.at_risk_orders.map((ord: any) => (
                      <tr key={ord.order_number} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 font-mono font-semibold text-slate-200">
                          <Link href={`/orders/${ord.order_number}`} className="hover:text-emerald-400">
                            {ord.order_number}
                          </Link>
                        </td>
                        <td className="py-3 text-slate-300">{ord.customer_name}</td>
                        <td className="py-3 text-slate-400">{formatDate(ord.delivery_deadline)}</td>
                        <td className="py-3 font-mono text-slate-200">{formatCurrency(ord.total_amount)}</td>
                        <td className="py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getRiskBadgeClass(
                              ord.risk_level
                            )}`}
                          >
                            {ord.risk_level} ({ord.risk_score}/100)
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/agent?query=Can we fulfill ${ord.customer_name}'s order ${ord.order_number} by ${formatDate(
                              ord.delivery_deadline
                            )}?`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] transition"
                          >
                            <Sparkles className="h-3 w-3" /> Investigate
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No critical risk orders detected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Approvals Card (1 col) */}
          <div className="rounded-2xl bg-[#0d121f] border border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                  Authorization Queue
                </h2>
                <Link href="/approvals" className="text-xs text-purple-400 hover:underline">
                  Full Queue
                </Link>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Autonomous agent proposals requiring human sign-off per corporate financial policy.
              </p>

              {summary?.pending_approvals_count && summary.pending_approvals_count > 0 ? (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-300">PURCHASE_REQUEST</span>
                    <span className="text-xs font-mono font-bold text-slate-100">€8,400.00</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Apex Pharma Synthetics — 1,500 kg API-004</p>
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href="/approvals"
                      className="w-full py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs text-center transition"
                    >
                      Review in Approvals Center
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500/60 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-medium">All Approvals Clear</p>
                  <p className="text-[11px] text-slate-500 mt-1">No pending agent purchase or schedule gates.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Auto-Approved Threshold:</span>
                <span className="font-mono text-emerald-400">€0 – €5,000</span>
              </div>
              <div className="flex justify-between">
                <span>Procurement Officer Gate:</span>
                <span className="font-mono text-blue-400">€5,000 – €25,000</span>
              </div>
              <div className="flex justify-between">
                <span>Operations Manager Gate:</span>
                <span className="font-mono text-purple-400">&gt; €25,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
