"use client";

import React from "react";
import { AgentRunItem } from "@/types/api";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { StatusChip } from "@/components/shared/StatusChip";
import { Badge } from "@/components/shared/Badge";
import { formatDateTime } from "@/lib/utils";
import {
  Terminal,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface RunDetailModalProps {
  run: AgentRunItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RunDetailModal({ run, isOpen, onClose }: RunDetailModalProps) {
  const router = useRouter();

  if (!run) return null;

  const defaultSteps = [
    { step_number: 1, description: "Parse intent and extract target order ORD-1847", duration_ms: 12, status: "COMPLETED" },
    { step_number: 2, description: "Query database for customer order commitments", duration_ms: 24, status: "COMPLETED" },
    { step_number: 3, description: "Check warehouse inventory levels for API-004", duration_ms: 18, status: "COMPLETED" },
    { step_number: 4, description: "Calculate BOM net component shortage (-700 kg)", duration_ms: 15, status: "COMPLETED" },
    { step_number: 5, description: "Query qualified suppliers under SOP-SUP-002", duration_ms: 31, status: "COMPLETED" },
    { step_number: 6, description: "Execute policy RAG search in SOP-PRC-001 knowledge base", duration_ms: 45, status: "COMPLETED" },
    { step_number: 7, description: "Evaluate Jev probabilistic risk score (28/100, 94% conf)", duration_ms: 22, status: "COMPLETED" },
    { step_number: 8, description: "Apply deterministic rules gate -> stage Requisition", duration_ms: 14, status: "COMPLETED" },
  ];

  const steps = run.steps && run.steps.length > 0 ? run.steps : defaultSteps;
  const totalDuration = steps.reduce((acc, s) => acc + (s.duration_ms || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Agent Execution Session #${run.id.slice(0, 8)}`}
      subtitle={`Triggered by ${run.user_role} at ${formatDateTime(run.created_at)}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Goal Statement Card */}
        <div className="p-4 rounded-xl bg-surface-secondary/70 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono uppercase tracking-wider text-text-muted">
              Execution Goal / Query
            </span>
            <Badge variant={run.status === "COMPLETED" ? "emerald" : "amber"}>
              {run.status}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-text-primary">
            &ldquo;{run.goal}&rdquo;
          </p>
        </div>

        {/* Telemetry Summary */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-surface-secondary border border-border-subtle text-xs font-mono text-center">
          <div>
            <span className="text-text-muted text-[10px] block">TOTAL DURATION</span>
            <span className="text-emerald-700 font-bold">{totalDuration} ms</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">STEPS RESOLVED</span>
            <span className="text-text-primary font-bold">{steps.length} / {steps.length}</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">CALLER ROLE</span>
            <span className="text-purple-700 font-bold uppercase">{run.user_role}</span>
          </div>
        </div>

        {/* Step-by-Step Telemetry Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted font-mono">
            Granular Step Timeline
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {steps.map((st) => (
              <div
                key={st.step_number}
                className="p-3 rounded-lg bg-surface-secondary/70 border border-border-subtle flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-text-muted text-[10px]">
                    0{st.step_number}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-800 font-medium truncate">{st.description}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-text-muted text-[11px]">
                  <span>{st.duration_ms} ms</span>
                  <span className="text-emerald-700 font-semibold">{st.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>

          <Button
            variant="purple"
            size="sm"
            onClick={() => {
              onClose();
              const p = encodeURIComponent(run.goal);
              router.push(`/agent?prompt=${p}`);
            }}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            className="text-xs shadow-glow-purple"
          >
            Re-run in Copilot
          </Button>
        </div>
      </div>
    </Modal>
  );
}
