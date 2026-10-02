"use client";

import React, { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { ChatMessageResponse } from "@/types/api";
import {
  Boxes,
  ShieldCheck,
  Cpu,
  Lock,
  Layers,
  Code,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface DecisionExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: ChatMessageResponse | null;
}

export function DecisionExplanationDrawer({
  isOpen,
  onClose,
  data,
}: DecisionExplanationDrawerProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (!data) return null;

  const jev = data.jev_evaluation;
  const rules = data.rule_evaluation;
  const proposal = data.proposed_action;
  const deficit = (data.retrieved_evidence as any)?.bom_deficit_kg ?? 700;
  const orderNumber = (data.retrieved_evidence as any)?.order?.order_number || "ORD-1847";
  const materialCode = (data.retrieved_evidence as any)?.material_needed || "API-004";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How Did SupplyPilot Decide?"
      subtitle="Deterministic business logic, SOP regulations & probabilistic risk verification"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-text-primary text-xs">
        {/* Section 1: Business Data */}
        <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold uppercase text-[11px] text-text-muted">
            <Boxes className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Business Data & Physical Inventory</span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
            <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
              <span className="text-text-muted block text-[10px]">INVENTORY POSITION</span>
              <span className="font-bold text-text-primary">0 Available Units</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
              <span className="text-text-muted block text-[10px]">MATERIAL DEFICIT</span>
              <span className="font-bold text-rose-700">-{deficit} kg ({materialCode})</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
              <span className="text-text-muted block text-[10px]">PRODUCTION LINE</span>
              <span className="font-bold text-amber-700">Batch 104 Blocked</span>
            </div>
          </div>
        </div>

        {/* Section 2: Policy */}
        <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold uppercase text-[11px] text-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Standard Operating Procedure (SOP Policy)</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-text-primary">SOP-PRC-002: Dual-Sourcing Protocol</span>
              <Badge variant="emerald">Compliant</Badge>
            </div>
            <p className="text-text-secondary leading-relaxed text-[11px]">
              &ldquo;When primary suppliers exceed critical delivery thresholds, procurement may stage requisitions with GMP-qualified secondary suppliers holding on-time SLA &gt; 90%.&rdquo;
            </p>
          </div>
        </div>

        {/* Section 3: Decision Support */}
        <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold uppercase text-[11px] text-text-muted">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>3. Jev Decision Support (Probabilistic Verification)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 font-mono">
            <div className="p-3 rounded-lg bg-surface border border-border-subtle flex items-center justify-between">
              <span className="text-text-muted">Jev Confidence Rating:</span>
              <span className="font-bold text-emerald-700 text-sm">
                {jev ? `${Math.round(jev.confidence_score * 100)}%` : "94%"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-border-subtle flex items-center justify-between">
              <span className="text-text-muted">Calculated Risk Score:</span>
              <span className="font-bold text-emerald-700 text-sm">
                {jev ? `${jev.risk_score} / 100` : "28 / 100"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Rules Gate */}
        <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold uppercase text-[11px] text-text-muted">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>4. Deterministic Business Rules (Authoritative Floor)</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1 text-[11px]">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-text-primary">
                Requisition Amount: €{(proposal?.monetary_value ?? 8400).toLocaleString()}
              </span>
              <Badge variant="purple">Human Sign-off Mandatory</Badge>
            </div>
            <p className="text-text-secondary">
              Under corporate threshold rules, purchases exceeding €5,000 cannot be autonomously dispatched and require authorized officer approval.
            </p>
          </div>
        </div>

        {/* Optional Raw JSON inspection for technical reviewers */}
        <div className="pt-2 border-t border-border-subtle">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-1.5 text-text-muted hover:text-text-primary font-mono text-[11px] transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showRaw ? "Hide Raw State Payload" : "View Raw State Payload (Technical Reviewers)"}</span>
            {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRaw && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-56">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            Close Panel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
