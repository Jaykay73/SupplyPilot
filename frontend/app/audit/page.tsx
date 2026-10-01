"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  CheckCircle,
  ShieldAlert,
  User,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        setLoading(true);
        const data = await api.getAuditLogs(100);
        setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load audit logs:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAuditLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <History className="h-6 w-6 text-emerald-400" />
              Immutable Audit Trail &amp; Compliance Log
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Cryptographically timestamped audit log of all human approvals, autonomous agent proposals, and scenario simulations.
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
              placeholder="Search by action, user, or entity..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">{filteredLogs.length} Events Logged</span>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Action / Event</th>
                  <th className="py-3 px-4 font-semibold">Initiator / Role</th>
                  <th className="py-3 px-4 font-semibold">Entity Type</th>
                  <th className="py-3 px-4 font-semibold">Entity ID</th>
                  <th className="py-3 px-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 animate-pulse">
                      Loading audit events...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-200">{log.action}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium">{log.user_email || "system@supplypilot.local"}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{log.entity_type}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{log.entity_id || "—"}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                        {log.details ? JSON.stringify(log.details) : "—"}
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
