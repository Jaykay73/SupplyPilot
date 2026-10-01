"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Warehouse,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"raw_materials" | "finished_goods">("raw_materials");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);
        const data = await api.getInventory(activeTab);
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load inventory:", e);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, [activeTab]);

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    if (activeTab === "raw_materials") {
      return (
        item.material_code?.toLowerCase().includes(q) ||
        item.material_name?.toLowerCase().includes(q) ||
        item.grade?.toLowerCase().includes(q)
      );
    } else {
      return (
        item.product_sku?.toLowerCase().includes(q) ||
        item.product_name?.toLowerCase().includes(q) ||
        item.dosage_form?.toLowerCase().includes(q)
      );
    }
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Warehouse className="h-6 w-6 text-emerald-400" />
              Warehouse Inventory &amp; Stock Levels
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time stock positions, safety thresholds, and reservations for active pharmaceutical ingredients (APIs) and finished drug products.
            </p>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d121f] p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("raw_materials")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "raw_materials"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              Raw Materials &amp; APIs (20)
            </button>
            <button
              onClick={() => setActiveTab("finished_goods")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "finished_goods"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              Finished Products (10)
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by code, name, grade..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 uppercase tracking-wider">
                {activeTab === "raw_materials" ? (
                  <tr>
                    <th className="py-3 px-4 font-semibold">Material Code</th>
                    <th className="py-3 px-4 font-semibold">Material Name</th>
                    <th className="py-3 px-4 font-semibold">Pharma Grade</th>
                    <th className="py-3 px-4 font-semibold">On Hand</th>
                    <th className="py-3 px-4 font-semibold">Reserved</th>
                    <th className="py-3 px-4 font-semibold">Available</th>
                    <th className="py-3 px-4 font-semibold">Safety Stock</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="py-3 px-4 font-semibold">Product SKU</th>
                    <th className="py-3 px-4 font-semibold">Product Name</th>
                    <th className="py-3 px-4 font-semibold">Dosage Form</th>
                    <th className="py-3 px-4 font-semibold">Strength</th>
                    <th className="py-3 px-4 font-semibold">On Hand</th>
                    <th className="py-3 px-4 font-semibold">Committed</th>
                    <th className="py-3 px-4 font-semibold">Available</th>
                    <th className="py-3 px-4 font-semibold">Batch Size</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 animate-pulse">
                      Loading inventory records...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No inventory records match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    if (activeTab === "raw_materials") {
                      const isShortage = item.available_quantity < item.safety_stock;
                      const isAPI004 = item.material_code === "API-004";

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-800/40 transition ${
                            isAPI004 ? "bg-amber-500/5 border-l-2 border-l-amber-400" : ""
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                            {item.material_code}
                          </td>
                          <td className="py-3 px-4 text-slate-200 font-medium">
                            {item.material_name}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{item.grade}</td>
                          <td className="py-3 px-4 font-mono text-slate-200">
                            {item.quantity_on_hand.toLocaleString()} {item.unit}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {item.reserved_quantity.toLocaleString()} {item.unit}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-100">
                            {item.available_quantity.toLocaleString()} {item.unit}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {item.safety_stock.toLocaleString()} {item.unit}
                          </td>
                          <td className="py-3 px-4">
                            {isShortage ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                                DEFICIT ALERT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                OPTIMAL
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                            {item.product_sku}
                          </td>
                          <td className="py-3 px-4 text-slate-200 font-medium">{item.product_name}</td>
                          <td className="py-3 px-4 text-slate-400">{item.dosage_form}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{item.strength}</td>
                          <td className="py-3 px-4 font-mono text-slate-200">
                            {item.quantity_on_hand.toLocaleString()} vials
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {item.committed_quantity.toLocaleString()} vials
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-100">
                            {item.available_quantity.toLocaleString()} vials
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {item.standard_batch_size?.toLocaleString() || "5,000"} vials
                          </td>
                        </tr>
                      );
                    }
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
