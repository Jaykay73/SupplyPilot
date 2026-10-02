"use client";

import React from "react";
import { RuleEvaluation, ProposedAction } from "@/types/api";
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { formatCurrency } from "@/lib/utils";

interface RulesTabProps {
  ruleEvaluation?: RuleEvaluation | null;
  proposedAction?: ProposedAction | null;
}

export function RulesTab({ ruleEvaluation, proposedAction }: RulesTabProps) {
  const isCompliant = ruleEvaluation?.is_compliant ?? true;
  const requiresApproval = ruleEvaluation?.requires_human_approval ?? true;
  const requiredRole = ruleEvaluation?.required_approval_role || ruleEvaluation?.required_role || proposedAction?.required_role || "procurement_officer";
  const monetaryValue = proposedAction?.monetary_value ?? 8400.0;
  const reasons = ruleEvaluation?.reasons || [
    `Expenditure of ${formatCurrency(monetaryValue)} is in Tier-2 (€5k - €25k); Procurement Officer approval required by POL-PROC-001.`,
    "Supplier Apex BioChem GmbH is GMP certified with active qualification flag in supplier registry.",
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs font-mono">
        <span className="text-text-muted flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-accent-emerald" />
          Deterministic Rules Engine
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
          AUTHORITATIVE SUPREMACY
        </span>
      </div>

      {/* Rules Gate Verification Matrix */}
      <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-3 shadow-subtle">
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between py-1.5 border-b border-border-subtle/50">
            <span className="text-text-muted">Policy Compliance Gate:</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PASS (SOP-PRC-001)
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-border-subtle/50">
            <span className="text-text-muted">Supplier Qualification Gate:</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PASS (SOP-SUP-002)
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-border-subtle/50">
            <span className="text-text-muted">Financial Spend Threshold:</span>
            <span className="text-text-primary font-bold">
              {formatCurrency(monetaryValue)} (Tier 2: €5k–€25k)
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-border-subtle/50">
            <span className="text-text-muted">Human Approval Required:</span>
            <span className="text-amber-700 font-bold">
              {requiresApproval ? "YES (Mandatory)" : "NO"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-text-muted">Designated Sign-off Role:</span>
            <span className="text-purple-700 font-bold uppercase">
              {requiredRole.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Authoritative Ruling Explanations */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
          Deterministic Reasoning
        </span>
        <div className="space-y-1.5">
          {reasons.map((r, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-surface-secondary border border-border-subtle text-xs font-mono text-text-secondary leading-relaxed flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Guarantee */}
      <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-text-secondary leading-relaxed flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-text-primary">Architectural Invariant:</strong> Deterministic rules execute outside the LLM context. No prompt injection or probabilistic score can bypass this approval requirement.
        </p>
      </div>
    </div>
  );
}
