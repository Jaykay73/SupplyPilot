"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  ArrowDown,
  ArrowRight,
  Boxes,
  Factory,
  ShoppingCart,
  Send,
  Sparkles,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { cn } from "@/lib/utils";

const CASCADE_STEPS = [
  {
    step: "01",
    title: "Supplier Disruption",
    subtitle: "BioSynth Europe (SUP-007)",
    description: "Reports a 5-day customs transit delay on API-004 (Paracetamol Sterile Grade).",
    status: "TRIGGER",
    color: "border-amber-300 bg-amber-50/90 text-amber-800 shadow-subtle",
  },
  {
    step: "02",
    title: "Component Deficit",
    subtitle: "API-004 Stock Deficit",
    description: "Warehouse stock in Vault-C4 is 800 kg; required 1,500 kg -> Net Deficit: 700 kg.",
    status: "CRITICAL",
    color: "border-rose-300 bg-rose-50/90 text-rose-800 shadow-subtle",
  },
  {
    step: "03",
    title: "Production Impact",
    subtitle: "Cleanroom Line 1 · BATCH-104",
    description: "Batch BATCH-2026-104 cannot initiate compounding. 48hr freeze window activated.",
    status: "BLOCKED",
    color: "border-rose-300 bg-rose-50/90 text-rose-800 shadow-subtle",
  },
  {
    step: "04",
    title: "Customer Order Threat",
    subtitle: "Medix Logistics (ORD-1847)",
    description: "€140,000 order scheduled for Oct 20 at imminent breach without emergency sourcing.",
    status: "AT RISK",
    color: "border-purple-300 bg-purple-50/90 text-purple-800 shadow-subtle",
  },
  {
    step: "05",
    title: "Autonomous Mitigation",
    subtitle: "Dual-Sourcing Requisition",
    description: "Agent identifies Apex BioChem (5-day ETA, €8,400.00). Proactive notice drafted.",
    status: "MITIGATED",
    color: "border-emerald-300 bg-emerald-50/90 text-emerald-800 shadow-subtle",
  },
];

export function DisruptionCascadeSection() {
  const [activeStep, setActiveStep] = useState<number>(4);

  return (
    <section id="cascade" className="py-24 px-6 border-b border-border-subtle bg-surface/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600 mb-3 block font-semibold">
            Deterministic Cascade Analysis
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary mb-4">
            One delay shouldn&apos;t become ten meetings.
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            When a supplier reports a disruption, legacy operations spend days in
            emergency meetings calculating downstream blast radius. SupplyPilot
            automatically propagates the shockwave across ERP, BOM, and MES in milliseconds.
          </p>
        </div>

        {/* Horizontal Visual Cascade Graph */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
          {CASCADE_STEPS.map((item, idx) => {
            const isHighlighted = idx <= activeStep;
            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between cursor-pointer",
                  isHighlighted
                    ? item.color
                    : "bg-surface border-border-subtle opacity-50 hover:opacity-80"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold">{item.step}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-current">
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary mb-1">
                    {item.title}
                  </h4>
                  <div className="text-xs font-mono text-text-secondary mb-2">
                    {item.subtitle}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-current/20 flex items-center justify-between text-[11px] font-mono">
                  <span>Phase {idx + 1}</span>
                  {idx < 4 && <ArrowRight className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout Banner */}
        <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-6 shadow-subtle">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-text-primary">
                Try the Interactive Disruption Simulator
              </h4>
              <p className="text-sm text-text-secondary mt-0.5">
                Simulate the flagship 5-day supplier delay and watch the automated mitigation cascade unfold live.
              </p>
            </div>
          </div>

          <Link href="/cascade">
            <Button
              variant="outline"
              size="md"
              className="border-amber-300 text-amber-700 hover:bg-amber-50 whitespace-nowrap"
              leftIcon={<Play className="w-4 h-4 text-amber-600" />}
            >
              Open Disruption Simulator
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
