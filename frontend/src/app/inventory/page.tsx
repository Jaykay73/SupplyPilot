"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { InventoryItem } from "@/types/api";
import { Badge } from "@/components/shared/Badge";
import { MetricCard } from "@/components/shared/MetricCard";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Boxes,
  Package,
  AlertTriangle,
  Search,
  CheckCircle2,
  Lock,
  Layers,
  MapPin,
} from "lucide-react";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"all" | "raw_materials" | "finished_goods">("all");
  const [search, setSearch] = useState("");

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.inventory.list(),
  });

  const rawMaterials = inventory.filter((item) => item.item_type === "material" || item.item_code?.startsWith("API-"));
  const finishedGoods = inventory.filter((item) => item.item_type === "product" || item.item_code?.startsWith("PRD-"));

  const displayList = (
    activeTab === "all"
      ? inventory
      : activeTab === "raw_materials"
      ? rawMaterials
      : finishedGoods
  ).filter((item) => {
    return (
      item.item_code.toLowerCase().includes(search.toLowerCase()) ||
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.warehouse_location && item.warehouse_location.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const belowSafetyCount = inventory.filter((i) => i.is_below_safety_stock || i.available <= 0).length;

  return (
    <AppShell
      title="Warehouse Inventory & Stock Positions"
      subtitle="Real-time stock on hand, reservation locks, safety stock buffers & vault locations"
    >
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
            title="Total Stock Positions"
            value={inventory.length}
            subtitle="APIs, excipients & finished vials"
            icon={<Boxes className="w-4 h-4" />}
          />
          <MetricCard
            title="Critical Stock Deficits"
            value={belowSafetyCount}
            subtitle="Below safety stock or fully reserved"
            icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
            variant={belowSafetyCount > 0 ? "warning" : "default"}
            badge={
              belowSafetyCount > 0 ? (
                <Badge variant="amber" beacon>
                  Alert
                </Badge>
              ) : undefined
            }
          />
          <MetricCard
            title="Active APIs (Raw Materials)"
            value={rawMaterials.length}
            subtitle="Vault-C4 sterile storage"
            icon={<Layers className="w-4 h-4 text-emerald-600" />}
          />
          <MetricCard
            title="Finished Injectables"
            value={finishedGoods.length}
            subtitle="Commercial catalog"
            icon={<Package className="w-4 h-4 text-purple-600" />}
          />
        </div>

        {/* Filter and Tab Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-surface-secondary/70 p-1 rounded-xl border border-border-subtle">
            {[
              { id: "all", label: `All Positions (${inventory.length})` },
              { id: "raw_materials", label: `Raw Materials (${rawMaterials.length})` },
              { id: "finished_goods", label: `Finished Goods (${finishedGoods.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-text-primary font-bold shadow-sm border border-border-subtle"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, name, vault..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-surface border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500/60"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl bg-surface border border-border-subtle shadow-elevation overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-secondary/80 text-text-muted border-b border-border-subtle uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Item Code</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right">On Hand</th>
                  <th className="p-4 text-right">Reserved</th>
                  <th className="p-4 text-right">Available</th>
                  <th className="p-4 text-right">Safety Stock</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="p-4 bg-surface-secondary/20 h-14" />
                    </tr>
                  ))
                ) : displayList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <EmptyState
                        icon="inbox"
                        title="No Inventory Records Found"
                        description="No warehouse items match your filter criteria."
                      />
                    </td>
                  </tr>
                ) : (
                  displayList.map((item) => {
                    const isDeficit = item.is_below_safety_stock || item.available <= 0;
                    return (
                      <tr
                        key={item.item_id || item.item_code}
                        className="hover:bg-surface-secondary/40 transition-colors"
                      >
                        <td className="p-4 font-bold text-text-primary">
                          {item.item_code}
                        </td>
                        <td className="p-4 text-slate-900 font-sans font-medium">
                          {item.item_name}
                        </td>
                        <td className="p-4 text-text-muted flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-text-muted" />
                          <span>{item.warehouse_location || "Vault-Main"}</span>
                        </td>
                        <td className="p-4 text-right font-bold text-text-primary">
                          {item.on_hand.toLocaleString()} {item.unit}
                        </td>
                        <td className="p-4 text-right text-amber-600 font-semibold">
                          {item.reserved > 0 ? (
                            <span className="flex items-center justify-end gap-1">
                              <Lock className="w-3 h-3 text-amber-600" />
                              {item.reserved.toLocaleString()} {item.unit}
                            </span>
                          ) : (
                            "0"
                          )}
                        </td>
                        <td
                          className={`p-4 text-right font-bold ${
                            item.available <= 0 ? "text-rose-600 font-extrabold" : "text-emerald-600"
                          }`}
                        >
                          {item.available.toLocaleString()} {item.unit}
                        </td>
                        <td className="p-4 text-right text-text-muted">
                          {item.safety_stock ? `${item.safety_stock.toLocaleString()} ${item.unit}` : "N/A"}
                        </td>
                        <td className="p-4 text-center">
                          {isDeficit ? (
                            <Badge variant="red" beacon className="text-[10px]">
                              {item.available <= 0 ? "Zero Available" : "Below Safety"}
                            </Badge>
                          ) : (
                            <Badge variant="emerald" className="text-[10px]">
                              Optimal Stock
                            </Badge>
                          )}
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
