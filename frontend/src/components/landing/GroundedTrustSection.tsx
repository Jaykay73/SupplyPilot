"use client";

import React from "react";
import { Database, FileText, Factory, BrainCircuit, ShieldAlert, CheckCircle2 } from "lucide-react";

const GROUNDED_SOURCES = [
  {
    layer: "ERP DATABASE",
    icon: Database,
    title: "Real-Time ERP & WMS Records",
    badge: "Verified SQL State",
    citation: "Vault-C4 Inventory: 800.0 kg on hand · Reserved: 800.0 kg · Net Available: 0.0 kg",
    color: "border-blue-500/30 text-blue-400 bg-blue-950/10",
  },
  {
    layer: "CORPORATE SOPs",
    icon: FileText,
    title: "Authoritative Policy RAG",
    badge: "SOP-PRC-001 Section 2.1",
    citation: "Tier-2 Financial Requisition threshold applies for expenditures between €5,000 and €25,000.",
    color: "border-purple-500/30 text-purple-400 bg-purple-950/10",
  },
  {
    layer: "PRODUCTION MES",
    icon: Factory,
    title: "Cleanroom Scheduling & Lines",
    badge: "Line 1 Sterile",
    citation: "Batch BATCH-2026-104 requires 1,500 kg API-004. 48hr line freeze window protects scheduling integrity.",
    color: "border-teal-500/30 text-teal-400 bg-teal-950/10",
  },
  {
    layer: "JEV DECISION GATE",
    icon: BrainCircuit,
    title: "Advisory Probabilistic Scoring",
    badge: "Confidence: 94%",
    citation: "Risk score 28/100. Evaluates supplier historical SLA (96% on-time) and quality cert compliance.",
    color: "border-cyan-500/30 text-cyan-400 bg-cyan-950/10",
  },
  {
    layer: "IMMUTABLE AUDIT",
    icon: ShieldAlert,
    title: "Cryptographic Audit Trail",
    badge: "SHA-256 Event Log",
    citation: "Every tool call, policy snippet query, and human signature is permanently timestamped.",
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-950/10",
  },
];

export function GroundedTrustSection() {
  return (
    <section id="evidence" className="py-24 px-6 border-b border-border-subtle bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-accent-emerald mb-3 block">
            Verifiable Explainability
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary mb-4">
            Every recommendation is grounded.
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            SupplyPilot never invents operational facts. Every proposed lead time,
            price quotation, and batch reschedule is verified directly against
            authoritative enterprise sources.
          </p>
        </div>

        {/* Grid of Grounded Verification Layers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GROUNDED_SOURCES.map((src) => {
            const Icon = src.icon;
            return (
              <div
                key={src.layer}
                className="p-6 rounded-2xl bg-surface border border-border-subtle hover:border-slate-300 transition-all flex flex-col justify-between shadow-subtle"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-text-muted">
                      {src.layer}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-secondary text-text-secondary border border-border-subtle">
                      {src.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-text-primary">
                      {src.title}
                    </h4>
                  </div>

                  <p className="text-xs text-text-secondary font-mono leading-relaxed bg-surface-secondary p-3 rounded-xl border border-border-subtle">
                    &ldquo;{src.citation}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle/50 flex items-center gap-2 text-[11px] text-emerald-600 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ground truth verified</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
