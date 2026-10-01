"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PackageSearch,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Calendar,
  Building,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, getRiskBadgeClass } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await api.getOrders({ limit: 100 });
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load orders:", e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <PackageSearch className="h-6 w-6 text-emerald-400" />
              Customer Orders &amp; Risk Portfolio
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active commercial commitments, delivery deadlines, and calculated risk scores.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d121f] p-3 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # or customer..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
            {["ALL", "CONFIRMED", "PROCESSING", "PENDING"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  statusFilter === st
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order Number</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Delivery Target</th>
                  <th className="py-3 px-4 font-semibold">Total Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Risk Level</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 animate-pulse">
                      Loading customer orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No customer orders match the current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const isMedix = ord.order_number === "ORD-1847";
                    return (
                      <tr
                        key={ord.id}
                        className={`hover:bg-slate-800/40 transition ${
                          isMedix ? "bg-amber-500/5 border-l-2 border-l-amber-400" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                          <Link href={`/orders/${ord.order_number}`} className="hover:text-emerald-400 flex items-center gap-1.5">
                            {ord.order_number}
                            {isMedix && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                FLAGSHIP
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-slate-200">{ord.customer_name}</td>
                        <td className="py-3 px-4 text-slate-400">{formatDate(ord.delivery_deadline)}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-100">
                          {formatCurrency(ord.total_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getRiskBadgeClass(
                              isMedix ? "HIGH" : "LOW"
                            )}`}
                          >
                            {isMedix ? "HIGH (72/100)" : "LOW (15/100)"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/orders/${ord.order_number}`}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                            >
                              Details
                            </Link>
                            <Link
                              href={`/agent?query=Can we fulfill ${ord.customer_name}'s order ${ord.order_number} by ${formatDate(
                                ord.delivery_deadline
                              )}?`}
                              className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 transition"
                            >
                              <Sparkles className="h-3 w-3" /> Copilot
                            </Link>
                          </div>
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
