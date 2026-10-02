"use client";

import React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanTabProps {
  plan?: string[];
  isLoading?: boolean;
}

export function PlanTab({ plan, isLoading }: PlanTabProps) {
  const steps = plan && plan.length > 0 ? plan : [
    "Retrieve customer order specifications and target delivery deadline",
    "Inspect finished-product inventory reserves and active batch commitments",
    "Evaluate cleanroom production line capacity and scheduled freeze window",
    "Calculate raw material component shortages against bill of materials (BOM)",
    "Discover qualified dual-sourcing suppliers meeting GMP specifications",
    "Retrieve corporate standard operating procedures and financial approval thresholds",
    "Evaluate action risk score via Jev Probabilistic Decision Support",
    "Apply deterministic rules engine gate and stage procurement requisition",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-text-muted pb-2 border-b border-border-subtle font-mono">
        <span>Autonomous Workflow Sequence</span>
        <span className="text-emerald-600 font-semibold">
          {isLoading ? "Executing..." : `${steps.length}/${steps.length} Steps Complete`}
        </span>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          return (
            <div
              key={idx}
              className={cn(
                "p-3 rounded-xl border transition-all flex items-start gap-3 text-xs shadow-subtle",
                "bg-surface border-border-subtle hover:border-slate-300"
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-muted">
                    STEP 0{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                    RESOLVED
                  </span>
                </div>
                <p className="text-text-primary font-medium leading-relaxed">
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
