"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  UserCheck,
  Calendar,
  FileText,
  DollarSign,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("PENDING");
  const [decisionFeedback, setDecisionFeedback] = useState<{ id: string; msg: string; type: "success" | "error" } | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await api.getApprovals(filter === "ALL" ? undefined : filter);
      setApprovals(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Failed to load approvals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  const handleDecision = async (approvalId: string, decision: "APPROVED" | "REJECTED") => {
    setDecisionFeedback(null);
    let reason = "Authorized via Operations Console";
    if (decision === "REJECTED") {
      const input = prompt("Please provide a reason for rejection:");
      if (!input) return;
      reason = input;
    }

    try {
      await api.decideApproval(approvalId, decision, reason);
      setDecisionFeedback({
        id: approvalId,
        msg: `Approval marked as ${decision}. Audit record created.`,
        type: "success",
      });
      fetchApprovals();
    } catch (err: any) {
      setDecisionFeedback({
        id: approvalId,
        msg: err.message || "Failed to submit decision",
        type: "error",
      });
    }
  };

  const userCanApprove = (requiredRole: string, monetaryValue: number) => {
    const role = user?.role || "procurement_officer";
    if (role === "admin" || role === "operations_manager") return true;
    if (role === "procurement_officer") {
      return requiredRole === "procurement_officer" && monetaryValue <= 25000;
    }
    return false;
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-purple-400" />
              Approvals Center &amp; Human-in-the-Loop Gates
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic authorization controls for agent actions. Monetary thresholds strictly enforced by corporate policy SOP-PRC-001.
            </p>
          </div>

          {/* Current Role Banner */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Current Role:</span>
            <span className="font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
              {user?.role?.replace("_", " ") || "Procurement Officer"}
            </span>
          </div>
        </div>

        {/* Financial Thresholds Info Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Autonomous Tier</span>
              <span className="font-mono font-bold text-emerald-400">&le; €5,000</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Agent executes directly without human delay.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Procurement Officer</span>
              <span className="font-mono font-bold text-blue-400">€5,000 – €25,000</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Single procurement officer sign-off required.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Operations Manager</span>
              <span className="font-mono font-bold text-purple-400">&gt; €25,000</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Senior management authorization mandatory.</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f
                  ? "bg-purple-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {f === "ALL" ? "All History" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Approvals List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading authorization requests...
          </div>
        ) : approvals.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0d121f] border border-slate-800 text-slate-400">
            <CheckCircle className="h-10 w-10 text-emerald-500/60 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-200">No {filter} Approvals Found</p>
            <p className="text-xs text-slate-500 mt-1">
              {filter === "PENDING"
                ? "All operational actions are currently authorized or executing autonomously."
                : "No historical records matching this filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((appr) => {
              const allowed = userCanApprove(appr.required_role, appr.monetary_value);
              const isPending = appr.status === "PENDING";

              return (
                <div
                  key={appr.id}
                  className="rounded-2xl bg-[#0d121f] border border-slate-800 p-5 hover:border-slate-700 transition space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {appr.action_type}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        Requisition #{appr.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-slate-100">
                        {formatCurrency(appr.monetary_value)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono border ${
                          appr.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : appr.status === "REJECTED"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        }`}
                      >
                        {appr.status}
                      </span>
                    </div>
                  </div>

                  {/* Evidence & Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Reason &amp; Rationale
                      </span>
                      <p className="text-slate-200">{appr.reason || "Shortage mitigation for scheduled customer order."}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Authorization Requirement
                      </span>
                      <p className="text-slate-300">
                        Required Role: <strong className="text-white capitalize">{appr.required_role?.replace("_", " ")}</strong>
                      </p>
                      <p className="text-[10px] text-slate-500">Governing Policy: SOP-PRC-001</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Created &amp; Link
                      </span>
                      <p className="text-slate-400">{formatDateTime(appr.created_at)}</p>
                      {appr.order_id && (
                        <p className="text-[11px] text-emerald-400 font-mono">Linked Order: {appr.order_id}</p>
                      )}
                    </div>
                  </div>

                  {/* Decision Banner Feedback */}
                  {decisionFeedback && decisionFeedback.id === appr.id && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                        decisionFeedback.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      }`}
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{decisionFeedback.msg}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isPending && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      {!allowed ? (
                        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg w-full">
                          <Lock className="h-4 w-4 shrink-0" />
                          <span>
                            Authorization restricted: Your role (<code>{user?.role}</code>) lacks permission. Switch to <strong>Operations Manager</strong> to authorize.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => handleDecision(appr.id, "APPROVED")}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Authorize Action</span>
                          </button>
                          <button
                            onClick={() => handleDecision(appr.id, "REJECTED")}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject &amp; Cancel</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
