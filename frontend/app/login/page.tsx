"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, UserCheck, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const DEMO_ROLES = [
  {
    role: "procurement_officer" as const,
    title: "Procurement Officer",
    email: "procurement@demo.local",
    desc: "Autonomous approval up to €5,000. Authorize requisitions up to €25,000.",
    color: "emerald",
    badge: "€5k - €25k Gate",
  },
  {
    role: "operations_manager" as const,
    title: "Operations Manager",
    email: "manager@demo.local",
    desc: "Unrestricted financial authorization for emergency requisitions > €25,000.",
    color: "purple",
    badge: "Authoritative > €25k",
  },
  {
    role: "production_planner" as const,
    title: "Production Planner",
    email: "planner@demo.local",
    desc: "Master production scheduling, line capacity, and batch rescheduling.",
    color: "blue",
    badge: "MPS & Lines",
  },
  {
    role: "admin" as const,
    title: "System Administrator",
    email: "admin@demo.local",
    desc: "Full administrative access, policy configurations, and audit telemetry.",
    color: "rose",
    badge: "Full Access",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, quickSwitchRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Try a demo account below.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (role: "procurement_officer" | "production_planner" | "operations_manager" | "admin") => {
    setError(null);
    setLoading(true);
    try {
      await quickSwitchRole(role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-4xl space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <Sparkles className="h-4 w-4" />
            SupplyPilot Operations Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Sign In to PharmaPulse Synthetics
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Connected operational intelligence for pharmaceutical manufacturing, supply chain mitigation, and human-in-the-loop workflows.
          </p>
        </div>

        {/* 1-Click Role Switcher Demo Cards */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              1-Click Demo Accounts (Pre-Seeded)
            </span>
            <span className="text-xs text-slate-400">Password: <code className="font-mono text-emerald-400">demo123</code></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {DEMO_ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => handleSelectRole(r.role)}
                disabled={loading}
                className="group relative flex flex-col justify-between p-4 rounded-xl border border-slate-800 bg-[#0d121f] hover:border-emerald-500/50 hover:bg-slate-900/60 transition text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                      {r.badge}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-200 group-hover:text-white">{r.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{r.desc}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400 truncate">
                  {r.email}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Login Card */}
        <div className="max-w-md mx-auto w-full bg-[#0d121f] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" /> Or sign in with custom credentials
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="procurement@demo.local"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Console"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
