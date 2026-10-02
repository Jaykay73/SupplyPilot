"use client";

import React, { useState } from "react";
import { ChatMessageResponse } from "@/types/api";
import { PlanTab } from "./PlanTab";
import { EvidenceTab } from "./EvidenceTab";
import { PoliciesTab } from "./PoliciesTab";
import { JevTab } from "./JevTab";
import { RulesTab } from "./RulesTab";
import {
  ListChecks,
  Database,
  FileText,
  BrainCircuit,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionTraceInspectorProps {
  traceData?: ChatMessageResponse | null;
  isLoading?: boolean;
}

type TabType = "plan" | "evidence" | "policies" | "jev" | "rules";

export function ExecutionTraceInspector({
  traceData,
  isLoading,
}: ExecutionTraceInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("plan");

  const tabs = [
    { id: "plan", label: "Plan", icon: ListChecks },
    { id: "evidence", label: "Evidence", icon: Database },
    { id: "policies", label: "Policies", icon: FileText },
    { id: "jev", label: "Jev AI", icon: BrainCircuit },
    { id: "rules", label: "Rules Gate", icon: ShieldCheck },
  ];

  return (
    <div className="h-full flex flex-col rounded-2xl bg-surface border border-border-subtle shadow-elevation overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle bg-surface-secondary/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent-purple" />
          <h3 className="text-sm font-bold text-text-primary">
            Execution Trace Inspector
          </h3>
        </div>

        {traceData?.run_id && (
          <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded bg-surface border border-border-subtle">
            Run: {traceData.run_id.slice(0, 8)}
          </span>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center border-b border-border-subtle bg-surface px-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap",
                isActive
                  ? "border-accent-purple text-text-primary font-bold bg-surface-secondary/40"
                  : "border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-secondary/20"
              )}
            >
              <Icon
                className={cn(
                  "w-3.5 h-3.5",
                  isActive ? "text-accent-purple" : "text-text-muted"
                )}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "plan" && (
          <PlanTab plan={traceData?.plan} isLoading={isLoading} />
        )}
        {activeTab === "evidence" && (
          <EvidenceTab evidence={traceData?.retrieved_evidence} />
        )}
        {activeTab === "policies" && (
          <PoliciesTab citations={traceData?.policy_citations} />
        )}
        {activeTab === "jev" && (
          <JevTab jev={traceData?.jev_evaluation} />
        )}
        {activeTab === "rules" && (
          <RulesTab
            ruleEvaluation={traceData?.rule_evaluation}
            proposedAction={traceData?.proposed_action}
          />
        )}
      </div>
    </div>
  );
}
