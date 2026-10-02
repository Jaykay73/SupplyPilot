"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { HeroVideoBackground } from "@/components/landing/HeroVideoBackground";

export default function SimplifiedLandingPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary selection:bg-purple-500/20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col justify-between overflow-hidden border-b border-border-subtle">
        <HeroVideoBackground />

        {/* Minimal Navbar */}
        <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-text-primary">
                SupplyPilot
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-secondary text-text-muted border border-border-subtle">
                AI Ops Demo
              </span>
            </div>
          </div>

          <Link href="/dashboard">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Enter Live Demo
            </Button>
          </Link>
        </header>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-20 text-center flex-1 flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-secondary border border-border-subtle mb-6 text-xs text-text-secondary font-medium shadow-subtle">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Interactive Operational Demonstration</span>
            <span className="text-text-muted">·</span>
            <span className="font-mono text-purple-700">Ready in 2 Minutes</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary uppercase leading-[1.08] mb-6">
            YOUR OPERATIONS.
            <br />
            <span>NOW CONNECTED.</span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed mb-8">
            SupplyPilot connects the operational chain from supplier to production to customer.
            See disruptions cascade, understand root causes with AI, and act with confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/dashboard">
              <Button
                variant="primary"
                size="lg"
                className="px-8 shadow-sm text-base"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Enter Live Demo
              </Button>
            </Link>
            <Link href="/agent">
              <Button
                variant="secondary"
                size="lg"
                className="px-6 border-border-strong text-base"
                leftIcon={<Sparkles className="w-4 h-4 text-purple-600" />}
              >
                Try Copilot Directly
              </Button>
            </Link>
          </div>
        </div>

        {/* Minimal Live Status Bar */}
        <div className="relative z-10 w-full border-t border-border-subtle bg-surface/90 backdrop-blur-sm py-3.5 px-6">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-text-primary">SYSTEM READY</span>
              <span className="text-text-muted">· Connected to live demo scenario (Medix ORD-1847)</span>
            </div>
            <div className="flex items-center gap-6 font-mono text-text-secondary">
              <span>Orders: <strong className="text-text-primary">124</strong></span>
              <span>At Risk: <strong className="text-amber-600">7</strong></span>
              <span>Pending Approvals: <strong className="text-purple-600">1</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 SIMPLE PILLARS) */}
      <section className="py-20 px-6 border-b border-border-subtle bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-mono uppercase tracking-widest text-purple-600 mb-2 font-bold">
              Autonomous Operations
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Three steps to operational resilience
            </h3>
            <p className="text-text-secondary text-sm sm:text-base mt-2">
              SupplyPilot unifies siloed ERP and MES data to predict and resolve inventory gaps before customer deliveries fail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-secondary border border-border-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h4 className="font-bold text-lg text-text-primary mb-2">See What Changed</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Real-time detection catches supplier delays, port holds, or batch variances the moment they are recorded.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border-subtle text-xs font-mono text-purple-700 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Disruption Cascade Tracking
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-secondary border border-border-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h4 className="font-bold text-lg text-text-primary mb-2">Understand the Impact</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Traces component deficits through Bill of Materials (BOM) to cleanroom lines and specific customer commitments.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border-subtle text-xs font-mono text-purple-700 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Grounded Copilot Investigation
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-secondary border border-border-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h4 className="font-bold text-lg text-text-primary mb-2">Act with Confidence</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Formulates SOP-compliant mitigation with dual-sourcing alternatives and human-in-the-loop governance sign-off.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border-subtle text-xs font-mono text-purple-700 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 1-Click Governance Authorization
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DISRUPTION CASCADE EXAMPLE (FLAGSHIP SCENARIO) */}
      <section className="py-20 px-6 border-b border-border-subtle bg-surface-secondary/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-amber-600 mb-2 font-bold">
              Flagship Scenario Walkthrough
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              From supplier delay to verified mitigation
            </h3>
            <p className="text-text-secondary text-sm sm:text-base mt-2">
              Follow how a 5-day customs delay on Paracetamol API triggers an intelligent end-to-end resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-surface border border-amber-200/80 shadow-subtle flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Trigger
                </span>
                <h5 className="font-bold text-sm text-text-primary mt-3 mb-1">Supplier Delay</h5>
                <p className="text-xs text-text-secondary leading-relaxed">
                  BioSynth Europe reports a 5-day transit delay on API-004 Paracetamol.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] font-mono text-text-muted">
                +5 Days to Arrival
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-rose-200/80 shadow-subtle flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  Deficit
                </span>
                <h5 className="font-bold text-sm text-text-primary mt-3 mb-1">Production Freeze</h5>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Vault-C4 has 800 kg vs 1,500 kg required. Batch 104 compounding halted.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] font-mono text-rose-600 font-semibold">
                700 kg Net Shortage
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-purple-200/80 shadow-subtle flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  Customer Impact
                </span>
                <h5 className="font-bold text-sm text-text-primary mt-3 mb-1">Order #ORD-1847</h5>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Medix Hospital Solutions delivery on Oct 20 at imminent breach risk.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] font-mono text-purple-700 font-semibold">
                $140,000 Value at Risk
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-emerald-200/80 shadow-subtle flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Solution
                </span>
                <h5 className="font-bold text-sm text-text-primary mt-3 mb-1">Dual-Source PO</h5>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Agent locates Apex BioChem (5-day ETA) and drafts expedited PO-2026-088.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Approval
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/cascade">
              <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Full Disruption Cascade Screen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="py-20 px-6 bg-surface text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary mb-3">
            See SupplyPilot in Action
          </h2>
          <p className="text-text-secondary text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Experience the complete guided workflow in just 2 minutes. Simulate a real disruption, investigate with the copilot, and authorize action.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button
                variant="primary"
                size="lg"
                className="px-8 shadow-sm text-base"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Enter Live Demo
              </Button>
            </Link>
          </div>

          <p className="text-xs text-text-muted mt-6">
            No registration or credit card required. Pure interactive operational demonstration.
          </p>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-border-subtle py-6 px-6 bg-surface-secondary text-center text-xs text-text-muted">
        <p>© 2026 SupplyPilot. Connected Operations Intelligence.</p>
      </footer>
    </main>
  );
}
