"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { HeroVideoBackground } from "./HeroVideoBackground";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Boxes,
  Factory,
} from "lucide-react";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";

export function HeroSection() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.dashboard.getSummary(),
  });

  const totalOrders = summary?.total_orders ?? 124;
  const atRiskCount = summary?.at_risk_orders_count ?? 7;
  const pendingApprovals = summary?.pending_approvals_count ?? 1;
  const activeBatches = summary?.active_batches_count ?? 4;

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-border-subtle">
      {/* Background layer */}
      <HeroVideoBackground />

      {/* Top Navbar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600 flex items-center justify-center shadow-glow-emerald">
            <Layers className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-text-primary">
                SupplyPilot
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-secondary text-text-muted border border-border-subtle">
                AI Ops OS
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-text-secondary">
          <a href="#chain" className="hover:text-text-primary transition-colors">
            Operational Chain
          </a>
          <a href="#agent" className="hover:text-text-primary transition-colors">
            AI Operations Agent
          </a>
          <a href="#cascade" className="hover:text-text-primary transition-colors">
            Disruption Cascade
          </a>
          <a href="#governance" className="hover:text-text-primary transition-colors">
            Human-in-the-Loop
          </a>
          <a href="#evidence" className="hover:text-text-primary transition-colors">
            Grounded Trust
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <RoleSwitcher compact />
          </div>

          <Link href="/dashboard">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Console
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Body */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-12 text-center flex-1 flex flex-col items-center justify-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-secondary/80 border border-border-subtle mb-6 backdrop-blur-md shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-emerald" />
          <span className="text-xs font-medium text-text-secondary">
            PharmaPulse Synthetics Operations Network
          </span>
          <span className="text-text-muted">·</span>
          <span className="text-xs font-mono text-purple-600 font-semibold">
            Jev AI 94% Precision
          </span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-text-primary uppercase leading-[1.08] mb-6">
          Your Operations.
          <br />
          <span>Now Connected.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed mb-10 font-normal">
          One intelligent chain from supplier to production to customer.
          SupplyPilot connects operational data, identifies disruptions, and helps
          teams act before problems become delays.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 shadow-glow-emerald"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Open Operations Console
            </Button>
          </Link>
          <Link href="/agent" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto px-7 border-purple-300 hover:border-purple-400 hover:bg-purple-50"
              leftIcon={<Sparkles className="w-4 h-4 text-purple-600" />}
            >
              Explore AI Copilot
            </Button>
          </Link>
        </div>
      </div>

      {/* Floating Live Operational Status Bar */}
      <div className="relative z-10 w-full border-t border-border-subtle bg-surface/80 backdrop-blur-md py-4 px-6 shadow-subtle">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-text-primary font-mono">
              SYSTEM OPERATIONAL
            </span>
            <span className="text-xs text-text-muted hidden sm:inline">
              · Real-time ERP / MES synchronization
            </span>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Orders Monitored:</span>
              <span className="text-text-primary font-bold">{totalOrders}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Supply Risks:</span>
              <span className="text-amber-600 font-bold">{atRiskCount} detected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Pending Approvals:</span>
              <span className="text-purple-600 font-bold">{pendingApprovals}</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-text-muted">Active Batches:</span>
              <span className="text-emerald-600 font-bold">{activeBatches}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
