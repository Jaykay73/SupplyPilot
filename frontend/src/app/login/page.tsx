"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_PERSONAS } from "@/context/AuthContext";
import { Layers, ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loginAs, isLoading } = useAuth();

  const [email, setEmail] = useState("procurement@demo.local");
  const [password, setPassword] = useState("demo123");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await loginWithCredentials(email, password);
      toast.success("Authentication successful", {
        description: "Welcome to SupplyPilot Operations Console.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Authentication failed", {
        description: err.message || "Invalid credentials provided.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPersona = async (key: keyof typeof DEMO_PERSONAS) => {
    setSubmitting(true);
    try {
      await loginAs(key);
      toast.success(`Logged in as ${DEMO_PERSONAS[key].title}`, {
        description: `Active as ${DEMO_PERSONAS[key].name} · ${DEMO_PERSONAS[key].thresholdLimit}`,
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Failed to authenticate demo persona", {
        description: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600 flex items-center justify-center shadow-glow-emerald">
              <Layers className="w-5 h-5 text-white font-bold" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-text-primary">
              SupplyPilot
            </span>
          </Link>
          <p className="text-xs text-text-secondary">
            Enterprise Operations & Decision Support Console
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl bg-surface border border-border-subtle shadow-elevation space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-text-primary">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-text-muted">
              Authenticate against the FastAPI JWT RBAC mechanism.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-secondary border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-secondary border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500/60"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              className="w-full shadow-glow-emerald"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick 1-Click Demo Personas */}
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span>Quick 1-Click Demo Personas:</span>
              <span className="text-purple-700 font-semibold">Password: demo123</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(DEMO_PERSONAS).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleQuickPersona(key as any)}
                  className="p-2.5 rounded-xl bg-surface-secondary/70 border border-border-subtle hover:border-purple-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary group-hover:text-purple-700">
                      {p.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted block truncate mt-0.5">
                    {p.name}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-700 font-medium block mt-0.5">
                    {p.thresholdLimit}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-text-muted">
          <Link href="/" className="hover:text-text-primary transition-colors">
            ← Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
