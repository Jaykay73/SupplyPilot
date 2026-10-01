import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck, Cpu, Database, Activity } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
        <Activity className="h-3.5 w-3.5 animate-pulse" />
        PharmaPulse Operations Node Active
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl">
        Supply<span className="text-emerald-400">Pilot</span>
      </h1>
      <p className="mt-4 text-lg text-slate-400 max-w-2xl">
        Autonomous AI operations platform connecting inventory, suppliers, production, and company policies with deterministic rule enforcement and human-in-the-loop approvals.
      </p>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-colors"
        >
          Operations Console <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Role Authentication
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl text-left border-t border-slate-800/80 pt-8">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <Bot className="h-5 w-5 text-emerald-400 mb-2" />
          <h3 className="font-semibold text-slate-200 text-sm">Operations Agent</h3>
          <p className="text-xs text-slate-400 mt-1">Grounded multi-step reasoning with controlled business tools.</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2" />
          <h3 className="font-semibold text-slate-200 text-sm">Deterministic Guardrails</h3>
          <p className="text-xs text-slate-400 mt-1">Strict financial thresholds, RBAC gates, and dual-sourcing policies.</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <Cpu className="h-5 w-5 text-emerald-400 mb-2" />
          <h3 className="font-semibold text-slate-200 text-sm">Jev Decision Support</h3>
          <p className="text-xs text-slate-400 mt-1">Probabilistic risk scoring, evidence sufficiency, and human escalation.</p>
        </div>
      </div>
    </div>
  );
}
