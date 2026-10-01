"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Calendar,
  Building,
  AlertTriangle,
  Sparkles,
  Layers,
  Warehouse,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, getRiskBadgeClass } from "@/lib/utils";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [risk, setRisk] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const o = await api.getOrder(orderId);
        setOrder(o);
        const r = await api.getOrderRisk(orderId).catch(() => null);
        setRisk(r);
      } catch (e) {
        console.error("Failed to load order details:", e);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) loadData();
  }, [orderId]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Loading order {orderId}...
        </div>
      </AppShell>
    );
  }

  if (!order || order.error) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-[#0d121f] border border-slate-800 text-center">
          <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-slate-200">Order Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">
            Order reference "{orderId}" does not exist in the transactional database.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs hover:bg-slate-700 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Link>
        </div>
      </AppShell>
    );
  }

  const isMedix = order.order_number === "ORD-1847";

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-3 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Customer Orders
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-100 font-mono">{order.order_number}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {order.status}
                </span>
                {isMedix && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    FLAGSHIP BENCHMARK
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Customer: <strong className="text-slate-200">{order.customer_name}</strong> | Requested Delivery:{" "}
                <strong className="text-slate-200">{formatDate(order.delivery_deadline)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/agent?query=Can we fulfill ${order.customer_name}'s order ${order.order_number} by ${formatDate(
                  order.delivery_deadline
                )}?`}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Investigate in Copilot</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Total Order Value</span>
            <div className="mt-1 text-lg font-mono font-bold text-slate-100">
              {formatCurrency(order.total_amount)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Delivery Deadline</span>
            <div className="mt-1 text-sm font-semibold text-slate-200">
              {formatDate(order.delivery_deadline)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Risk Score</span>
            <div className="mt-1">
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getRiskBadgeClass(
                  risk?.risk_level || (isMedix ? "HIGH" : "LOW")
                )}`}
              >
                {risk?.risk_level || (isMedix ? "HIGH" : "LOW")} ({risk?.composite_risk_score || (isMedix ? 72 : 15)}/100)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Primary Risk Factor</span>
            <div className="mt-1 text-xs text-amber-400 truncate">
              {risk?.primary_risk_driver || (isMedix ? "Raw Material Shortage (API-004)" : "On Schedule")}
            </div>
          </div>
        </div>

        {/* Order Line Items */}
        <div className="rounded-2xl bg-[#0d121f] border border-slate-800 p-5 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-400" />
            Ordered Product Formulations
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="pb-2.5 font-semibold">Product SKU</th>
                  <th className="pb-2.5 font-semibold">Product Name</th>
                  <th className="pb-2.5 font-semibold">Ordered Units</th>
                  <th className="pb-2.5 font-semibold">Unit Price</th>
                  <th className="pb-2.5 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-semibold text-slate-200">{item.product_sku}</td>
                    <td className="py-3 text-slate-300">{item.product_name}</td>
                    <td className="py-3 font-mono text-slate-200">{item.quantity.toLocaleString()} units</td>
                    <td className="py-3 font-mono text-slate-400">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 font-mono font-semibold text-slate-100 text-right">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOM & Component Shortage Analysis Card */}
        {isMedix && (
          <div className="rounded-2xl bg-[#0d121f] border border-amber-500/30 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    BOM Component Trace &amp; Shortage Calculation
                  </h3>
                  <p className="text-xs text-slate-400">
                    Batch demand: 5,000 vials standard lot of Liposomal Doxorubicin (PRD-004)
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                DEFICIT DETECTED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Material Code
                </span>
                <p className="text-sm font-mono font-bold text-slate-100 mt-1">API-004</p>
                <p className="text-[11px] text-slate-400">Doxorubicin Hydrochloride Sterile API</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Stock Breakdown
                </span>
                <p className="text-xs text-slate-300 mt-1">Required: <strong className="text-slate-100">1,500 kg</strong></p>
                <p className="text-xs text-slate-300">Available: <strong className="text-slate-100">800 kg</strong></p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">
                  Net Shortage Deficit
                </span>
                <p className="text-sm font-mono font-bold text-rose-300 mt-1">700 kg Deficit</p>
                <p className="text-[10px] text-rose-400 mt-1">Production batch cannot initiate without procurement.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-300">
                  Recommended Dual-Sourcing Action
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Procure 1,500 kg from Apex Pharma Synthetics (SUP-001) for €8,400.00 (3-day lead time).
                </p>
              </div>
              <Link
                href="/agent?query=Can we fulfill Medix's order ORD-1847 by October 20?"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1 transition shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" /> Execute
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
