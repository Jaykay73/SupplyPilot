"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Clock,
  CheckCircle,
  Cpu,
  Layers,
  ShieldCheck,
  Bot,
  User,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { formatDateTime, formatCurrency } from "@/lib/utils";

export default function RunDetailPage() {
  const params = useParams();
  const runId = params.id as string;

  const [run, setRun] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadRun() {
      try {
        setLoading(true);
        const data = await api.getRun(runId);
        setRun(data);
      } catch (e) {
        console.error("Failed to load run trace:", e);
      } finally {
        setLoading(false);
      }
    }
    if (runId) loadRun();
  }, [runId]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Loading execution trace {runId}...
        </div>
      </AppShell>
    );
  }

  if (!run || run.error) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-[#0d121f] border border-slate-800 text-center">
          <Activity className="h-10 w-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-slate-200">Execution Trace Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">Run trace ID "{runId}" could not be retrieved.</p>
          <Link
            href="/runs"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs hover:bg-slate-700 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Runs
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <div>
          <Link
            href="/runs"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-3 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Agent Run Traces
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100 font-mono">Run #{run.id}</h1>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                    run.status === "COMPLETED"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {run.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Started: <strong className="text-slate-300">{formatDateTime(run.created_at)}</strong> | Role:{" "}
                <span className="font-mono text-emerald-400 capitalize">{run.user_role}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Goal Card */}
        <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Original User Inquiry / Goal
          </span>
          <p className="text-sm text-slate-200 font-medium">{run.goal}</p>
        </div>

        {/* Execution Steps Timeline */}
        <div className="rounded-2xl bg-[#0d121f] border border-slate-800 p-5 space-y-4 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
            Execution Trajectory &amp; Step Telemetry
          </h2>

          <div className="space-y-2">
            {run.steps && run.steps.length > 0 ? (
              run.steps.map((st: any) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-xs font-semibold shrink-0 mt-0.5">
                      {st.step_number}
                    </span>
                    <div>
                      <p className="text-xs text-slate-200 font-medium">{st.description}</p>
                      <span className="text-[10px] text-slate-500">
                        Recorded: {formatDateTime(st.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-slate-400">{st.duration_ms} ms</span>
                    <span className="block text-[10px] font-mono text-emerald-400 font-semibold">{st.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No granular step logs recorded for this run.</p>
            )}
          </div>
        </div>

        {/* Proposed Actions from this run */}
        {run.actions && run.actions.length > 0 && (
          <div className="rounded-2xl bg-[#0d121f] border border-slate-800 p-5 space-y-3 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              Proposed Actions &amp; State Changes
            </h2>

            <div className="space-y-2">
              {run.actions.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-semibold text-purple-300">{act.action_type}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-100">{formatCurrency(act.monetary_value)}</span>
                    <span className="block text-[10px] font-mono text-amber-400">{act.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
