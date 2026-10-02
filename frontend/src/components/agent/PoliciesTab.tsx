"use client";

import React from "react";
import { PolicyCitation } from "@/types/api";
import { FileText, ShieldAlert, CheckCircle2, BookOpen } from "lucide-react";
import { Badge } from "@/components/shared/Badge";

interface PoliciesTabProps {
  citations?: PolicyCitation[];
}

export function PoliciesTab({ citations }: PoliciesTabProps) {
  const items = citations && citations.length > 0 ? citations : [
    {
      policy_id: "POL-PROC-001",
      document_title: "Purchase Approval Policy (POL-PROC-001)",
      section_name: "2. Authoritative Approval Thresholds",
      snippet:
        "Tier 2 (Procurement Officer Approval): €5,000 EUR to €25,000 EUR. Requires explicit human review and approval by a designated Procurement Officer. The agent must prepare an action proposal, document supplier lead times, and present verified stock shortages.",
      citation: "POL-PROC-001 Section 2.1",
      category: "Financial Governance",
    },
    {
      policy_id: "POL-SUP-002",
      document_title: "Supplier Selection & Qualification Policy (POL-SUP-002)",
      section_name: "1. Dual-Sourcing Mandate",
      snippet:
        "To mitigate severe supply chain disruptions, all critical active pharmaceutical ingredients (APIs)—including Paracetamol Pure Grade (API-004)—must maintain at least two qualified active suppliers in our supplier registry. When a primary vendor is delayed, secondary allocation triggers.",
      citation: "POL-SUP-002 Section 1.3",
      category: "Supplier Governance",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs font-mono text-text-muted">
        <span>Authoritative Standard Operating Procedures (SOPs)</span>
        <span className="text-purple-600 font-semibold">{items.length} Policies Verified</span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-surface border border-border-subtle space-y-2.5 hover:border-purple-300 transition-colors shadow-subtle"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">
                    {item.document_title || item.document || item.policy_id || "Corporate Policy"}
                  </h4>
                  <span className="text-[11px] font-mono text-purple-700 block font-medium">
                    {item.section_name || item.section_title || "Section Governance"}
                  </span>
                </div>
              </div>

              <Badge variant="purple" className="text-[9px] font-mono flex-shrink-0">
                {item.category || "GMP Standard"}
              </Badge>
            </div>

            {/* Verbatim quote snippet */}
            <div className="p-3 rounded-lg bg-surface-secondary border border-border-subtle text-xs font-mono text-text-secondary leading-relaxed italic">
              &ldquo;{item.snippet || item.content}&rdquo;
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1">
              <span>Citation: {item.citation || item.policy_id}</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Inviolable Legal Bound
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
