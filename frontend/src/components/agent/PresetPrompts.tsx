"use client";

import React from "react";
import { Sparkles, ShieldAlert, Truck, HelpCircle } from "lucide-react";

interface PresetPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export const PRESET_PROMPTS = [
  {
    icon: Sparkles,
    label: "Can we fulfill Medix's order by October 20?",
    description: "Flagship BOM explosion & dual-sourcing",
    tag: "Flagship Scenario",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    icon: Truck,
    label: "Which supplier should we use for 1,500 kg of API-004?",
    description: "Vendor qualification, lead time & SLA scoring",
    tag: "Supplier Sourcing",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    icon: ShieldAlert,
    label: "Can we procure API-004 from BioSynth Corp?",
    description: "Evaluates restricted status under Policy SOP-SUP-002",
    tag: "Policy Compliance",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    icon: HelpCircle,
    label: "Can we fulfill Order #ORD-9999 by tomorrow morning?",
    description: "Tests zero-hallucination invariant on unrecorded orders",
    tag: "Zero-Hallucination Test",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

export function PresetPrompts({ onSelect, disabled }: PresetPromptsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span className="font-mono uppercase tracking-wider text-[10px]">
          Sample Operational Prompts
        </span>
        <span className="text-[10px] text-purple-600 font-mono font-medium">
          Click to populate & execute
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRESET_PROMPTS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.label}
              disabled={disabled}
              onClick={() => onSelect(p.label)}
              className="p-3 text-left rounded-xl bg-surface border border-border-subtle shadow-subtle hover:border-purple-300 hover:bg-purple-50/40 transition-all duration-150 disabled:opacity-50 group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-text-primary group-hover:text-purple-700 transition-colors line-clamp-1">
                  {p.label}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border flex-shrink-0 font-medium ${p.tagColor}`}
                >
                  {p.tag}
                </span>
              </div>
              <p className="text-[11px] text-text-muted leading-tight line-clamp-1">
                {p.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
