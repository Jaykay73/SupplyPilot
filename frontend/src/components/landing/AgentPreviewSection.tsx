"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileText,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";

const STEPS = [
  { id: 1, label: "Retrieve order & verify delivery deadline (ORD-1847)", done: true },
  { id: 2, label: "Inspect finished stock: 0 vials available in Vault-C4", done: true },
  { id: 3, label: "Evaluate Cleanroom Line A schedule & freeze window", done: true },
  { id: 4, label: "Calculate BOM component deficit: 700 kg shortage on API-004", done: true },
  { id: 5, label: "Discover qualified suppliers: Apex BioChem vs BioSynth", done: true },
  { id: 6, label: "Review Corporate Policy SOP-PRC-001 (Section 2.1)", done: true },
  { id: 7, label: "Evaluate Jev risk (28/100) & prepare Procurement Requisition", done: true },
];

export function AgentPreviewSection() {
  const [activeStep, setActiveStep] = useState(7);

  return (
    <section id="agent" className="py-24 px-6 border-b border-border-subtle bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial & Description */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-accent-purple block">
              Autonomous Operations Agent
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
              Ask the question.
              <br />
              <span className="text-text-secondary">
                SupplyPilot finds the answer.
              </span>
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              Pharmaceutical operations cannot afford trial-and-error reasoning.
              SupplyPilot’s agent executes controlled database queries, verifies
              inventory reservations, parses SOP governance documents, and calculates
              action feasibility in seconds.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Zero Hallucinations:</strong>{" "}
                  Explicit declaration of missing records instead of inventing lot numbers.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Policy Grounded:</strong> RAG
                  verification against corporate Standard Operating Procedures.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/agent">
                <Button
                  variant="purple"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Launch AI Copilot Console
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Realistic Miniature Agent Terminal */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-surface border border-border-subtle shadow-elevation overflow-hidden">
              {/* Window Header */}
              <div className="p-4 border-b border-border-subtle bg-surface-secondary/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono text-text-muted">
                    agent-session-live / ORD-1847
                  </span>
                </div>
                <Badge variant="purple" beacon>
                  LangGraph Agent Active
                </Badge>
              </div>

              {/* Chat & Trace Split Mockup */}
              <div className="p-6 space-y-5">
                {/* User Prompt */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-surface-secondary border border-border-subtle flex items-center justify-center text-xs font-semibold text-text-primary flex-shrink-0">
                    U
                  </div>
                  <div className="bg-surface-secondary px-4 py-2.5 rounded-xl border border-border-subtle text-sm text-text-primary">
                    Can we fulfill Medix&apos;s order ORD-1847 by October 20?
                  </div>
                </div>

                {/* Agent Plan Progress */}
                <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-text-muted mb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent-purple" />
                      AUTONOMOUS REASONING TRACE
                    </span>
                    <span className="text-emerald-600 font-semibold">7/7 Steps Resolved</span>
                  </div>

                  <div className="space-y-1.5">
                    {STEPS.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2 text-xs font-mono text-text-secondary"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Structured Result Card */}
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
                        ORDER AT RISK · API-004 DEFICIT
                      </span>
                    </div>
                    <Badge variant="purple">Jev Confidence: 94%</Badge>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    Medix&apos;s order ORD-1847 requires 5,000 vials of PRD-004. Current stock
                    is reserved. A BOM deficit of 700 kg was detected on API-004. Primary
                    vendor BioSynth is delayed (+5 days).
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-purple-200 text-xs font-mono">
                    <div>
                      <span className="text-text-muted block text-[10px]">
                        RECOMMENDED VENDOR
                      </span>
                      <span className="text-text-primary font-bold">Apex BioChem</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">
                        ESTIMATED COST
                      </span>
                      <span className="text-emerald-600 font-bold">€8,400.00</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">LEAD TIME</span>
                      <span className="text-text-primary font-bold">3–5 Days</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">GOVERNANCE</span>
                      <span className="text-purple-600 font-bold">Procurement Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
