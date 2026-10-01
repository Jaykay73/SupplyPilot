"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Search,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Bot,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function RunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function loadRuns() {
      try {
        setLoading(true);
        const data = await api.getRuns();
        setRuns(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load agent runs:", e);
      } finally {
        setLoading(false);
      }
    }
    loadRuns();
  }, []);

  const filteredRuns = runs.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.goal?.toLowerCase().includes(search.toLowerCase()) ||
      r.user_role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-400" />
              Agent Execution Traces &amp; Observability
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Historical LangGraph execution trajectories, step timestamps, tool invocations, and policy evaluations.
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
              placeholder="Search by run ID, goal, or role..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">{filteredRuns.length} Recorded Runs</span>
        </div>

        {/* Runs Table */}
        <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Run ID</th>
                  <th className="py-3 px-4 font-semibold">User Goal / Inquiry</th>
                  <th className="py-3 px-4 font-semibold">Role Context</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 animate-pulse">
                      Loading execution traces...
                    </td>
                  </tr>
                ) : filteredRuns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No agent runs recorded yet. Submit an operational query in the Copilot to generate a trace.
                    </td>
                  </tr>
                ) : (
                  filteredRuns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                        <Link href={`/runs/${r.id}`} className="hover:underline">
                          {r.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-200 max-w-md truncate">{r.goal}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                          {r.user_role?.replace("_", " ") || "Procurement Officer"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            r.status === "COMPLETED"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{formatDateTime(r.created_at)}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/runs/${r.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition"
                        >
                          Inspect <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
