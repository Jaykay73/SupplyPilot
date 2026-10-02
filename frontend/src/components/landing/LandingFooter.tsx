"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, ShieldCheck } from "lucide-react";
import { Button } from "@/components/shared/Button";

export function LandingFooter() {
  return (
    <footer className="bg-background border-t border-border-subtle py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Final CTA Box */}
        <div className="w-full max-w-4xl p-10 sm:p-14 rounded-3xl bg-surface border border-border-subtle shadow-elevation relative overflow-hidden mb-16">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-accent-emerald block font-semibold">
              Enterprise Operations Console
            </span>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
              Turn fragmented operations
              <br />
              into one intelligent chain.
            </h3>
            <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
              Connect inventory, production, procurement, and orders in one
              intelligent, verifiable workflow.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-8 shadow-glow-emerald"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Open SupplyPilot Console
                </Button>
              </Link>
              <Link href="/agent">
                <Button variant="secondary" size="lg" className="px-7">
                  Test Copilot Reasoning
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Brand & Copyright */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted font-mono pt-6 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Layers className="w-3 h-3" />
            </div>
            <span className="text-text-primary font-bold">SupplyPilot</span>
            <span>· Engineered for PharmaPulse Synthetics</span>
          </div>

          <div className="flex items-center gap-6">
            <span>FastAPI + LangGraph + Jev AI</span>
            <span>Deterministic Business Gates</span>
            <span className="text-emerald-600 font-semibold">SOC-2 / GMP Compliant Boundary</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
