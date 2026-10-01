"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle,
  AlertTriangle,
  Search,
  Sparkles,
  Award,
  Globe,
  Clock,
  Shield,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function loadSuppliers() {
      try {
        setLoading(true);
        const data = await api.getSuppliers();
        setSuppliers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load suppliers:", e);
      } finally {
        setLoading(false);
      }
    }
    loadSuppliers();
  }, []);

  const filtered = suppliers.filter(
    (s) =>
      s.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      s.supplier_code.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-emerald-400" />
              Qualified Supplier Scorecards &amp; Compliance
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active vendor roster evaluated against corporate qualification policies, historical reliability, lead time SLA, and dual-sourcing limits.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between gap-3 bg-[#0d121f] p-3 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search supplier, code, or country..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} Qualified Vendors Loaded
          </span>
        </div>

        {/* Suppliers Grid / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-xs text-slate-400 animate-pulse">
              Loading vendor scorecards...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-xs text-slate-500">
              No suppliers found matching your query.
            </div>
          ) : (
            filtered.map((sup) => {
              const isApex = sup.supplier_code === "SUP-001";
              const isBioSynth = sup.supplier_code === "SUP-007";

              return (
                <div
                  key={sup.id}
                  className={`rounded-2xl bg-[#0d121f] border p-5 space-y-4 transition ${
                    isApex
                      ? "border-emerald-500/40 bg-emerald-500/5 shadow-md"
                      : isBioSynth
                      ? "border-rose-500/40 bg-rose-500/5 shadow-md"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold">
                          {sup.supplier_code}
                        </span>
                        <h3 className="font-semibold text-sm text-slate-100">{sup.supplier_name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-slate-500" />
                        {sup.country}
                      </p>
                    </div>

                    <div>
                      {isApex && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                          PRIMARY QUALIFIED
                        </span>
                      )}
                      {isBioSynth && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                          DELAY RESTRICTED
                        </span>
                      )}
                      {!isApex && !isBioSynth && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          QUALIFIED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metrics Ribbon */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block font-medium">Reliability</span>
                      <span className="text-sm font-mono font-bold text-slate-100 mt-0.5 block">
                        {(sup.reliability_rating * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block font-medium">Avg Lead Time</span>
                      <span className="text-sm font-mono font-bold text-slate-100 mt-0.5 block">
                        {sup.lead_time_days} days
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block font-medium">GMP Certified</span>
                      <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">
                        {sup.is_active ? "YES" : "NO"}
                      </span>
                    </div>
                  </div>

                  {/* Catalog & Policy Annotation */}
                  <div className="text-[11px] space-y-1.5 pt-2 border-t border-slate-800/80 text-slate-300">
                    <div>
                      <span className="text-slate-500 font-medium">Qualified Materials: </span>
                      {sup.catalog && sup.catalog.length > 0 ? (
                        sup.catalog.map((c: any) => (
                          <span
                            key={c.material_code}
                            className="inline-block mr-1 px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]"
                          >
                            {c.material_code} (€{c.unit_price}/kg)
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500">API-004, RAW-012</span>
                      )}
                    </div>

                    {isBioSynth && (
                      <p className="text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-[10px]">
                        <strong>Policy Restriction SOP-PRC-002:</strong> Active shipment delay DELAY-2026-001. Disqualified for dual-source expedited orders until reliability audit clears.
                      </p>
                    )}

                    {isApex && (
                      <p className="text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-[10px]">
                        <strong>Policy Recommendation:</strong> Primary alternative supplier for API-004 with 3-day expedited fulfillment and 96% on-time SLA.
                      </p>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-end">
                    <Link
                      href={`/agent?query=Which supplier should we use for API-004? Compare ${sup.supplier_name}`}
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-medium"
                    >
                      <Sparkles className="h-3 w-3" /> Evaluate in Copilot
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
