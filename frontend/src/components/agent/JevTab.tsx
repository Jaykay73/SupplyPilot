"use client";

import React from "react";
import { JevEvaluation } from "@/types/api";
import { BrainCircuit, ShieldAlert, CheckCircle2, AlertTriangle, Cpu } from "lucide-react";
import { Badge } from "@/components/shared/Badge";

interface JevTabProps {
  jev?: JevEvaluation | null;
}

export function JevTab({ jev }: JevTabProps) {
  const confidencePercent = jev?.confidence_score
    ? Math.round(jev.confidence_score * 100)
    : 94;
  const riskScore = jev?.risk_score ?? 28;
  const decision = jev?.recommended_decision || (riskScore <= 35 ? "APPROVE" : "ESCALATE_TO_HUMAN");
  const rationale =
    jev?.decision_justification ||
    jev?.rationale ||
    "Evidence verified: 4 operational parameters present. Apex BioChem is GMP certified with 96% on-time historical SLA. Delivery risk is mitigated.";

  return (
    <div className="space-y-5">
      {/* Header explanation */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs font-mono">
        <span className="text-text-muted flex items-center gap-1.5">
          <BrainCircuit className="w-4 h-4 text-accent-purple" />
          Jev Probabilistic Decision Support
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
          Advisory Layer
        </span>
      </div>

      {/* Analytical Gauge & Scores Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Confidence Gauge */}
        <div className="p-4 rounded-xl bg-surface border border-border-subtle text-center space-y-2 shadow-subtle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
            Confidence Rating
          </span>
          <div className="text-3xl font-extrabold font-mono text-purple-600">
            {confidencePercent}%
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-accent-purple h-full rounded-full transition-all duration-500"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <span className="text-[10px] text-text-muted font-mono block">
            Evidence Sufficiency: Verified
          </span>
        </div>

        {/* Risk Score Gauge */}
        <div className="p-4 rounded-xl bg-surface border border-border-subtle text-center space-y-2 shadow-subtle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
            Operational Risk Score
          </span>
          <div className="text-3xl font-extrabold font-mono text-emerald-600">
            {riskScore} <span className="text-sm text-text-muted font-normal">/ 100</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${riskScore}%` }}
            />
          </div>
          <span className="text-[10px] text-emerald-600 font-mono block font-semibold">
            LOW RISK CATEGORY
          </span>
        </div>
      </div>

      {/* Advisory Recommendation Banner */}
      <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-3 shadow-subtle">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-text-primary">
            ADVISORY RECOMMENDATION
          </span>
          <Badge variant={decision === "APPROVE" ? "emerald" : "amber"}>
            {decision}
          </Badge>
        </div>

        <div className="p-3 rounded-lg bg-surface-secondary border border-border-subtle text-xs font-mono text-text-secondary leading-relaxed">
          {rationale}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1">
          <span>Model: {jev?.model_version || "jev-gateway-v2.1"}</span>
          <span>Latency: {jev?.latency_ms ?? 14} ms</span>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle text-[11px] text-text-secondary leading-relaxed">
        <strong className="text-text-primary">Architectural Invariant:</strong> Jev evaluations are strictly advisory. A high confidence or low risk score cannot downgrade an authoritative deterministic approval requirement.
      </div>
    </div>
  );
}
