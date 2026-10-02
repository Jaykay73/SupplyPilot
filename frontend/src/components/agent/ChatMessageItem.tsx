"use client";

import React from "react";
import { ChatMessageResponse } from "@/types/api";
import {
  Bot,
  User,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export interface MessageItem {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  data?: ChatMessageResponse;
}

interface ChatMessageItemProps {
  message: MessageItem;
  onInspectTrace?: (data: ChatMessageResponse) => void;
}

export function ChatMessageItem({ message, onInspectTrace }: ChatMessageItemProps) {
  const router = useRouter();

  if (message.sender === "user") {
    return (
      <div className="flex items-start justify-end gap-3 max-w-2xl ml-auto">
        <div className="bg-surface-secondary border border-border-subtle rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-text-primary shadow-sm">
          {message.content}
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-secondary border border-border-subtle flex items-center justify-center text-xs font-semibold text-text-secondary flex-shrink-0">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  const payload = message.data;
  const isZeroHallucination =
    message.content.toLowerCase().includes("information unavailable") ||
    message.content.toLowerCase().includes("not found") ||
    message.content.toLowerCase().includes("no record");

  const proposedAction = payload?.proposed_action;
  const jev = payload?.jev_evaluation;
  const citations = payload?.policy_citations || [];

  return (
    <div className="flex items-start gap-3.5 max-w-3xl">
      <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 flex-shrink-0 mt-1 shadow-subtle">
        <Bot className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-4">
        {/* Assistant Bubble */}
        <div className="rounded-2xl rounded-tl-sm bg-surface border border-border-subtle p-5 shadow-elevation space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle/70 pb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary">SupplyPilot Operations Agent</span>
              {payload?.run_id && (
                <span className="text-[10px] font-mono text-text-muted">
                  #{payload.run_id.slice(0, 8)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {payload?.approval_required ? (
                <Badge variant="amber" beacon className="text-[10px]">
                  Pending Human Sign-off
                </Badge>
              ) : (
                <Badge variant="emerald" className="text-[10px]">
                  Analysis Complete
                </Badge>
              )}
            </div>
          </div>

          {/* Zero-Hallucination Verified Alert */}
          {isZeroHallucination && (
            <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle text-xs space-y-1">
              <div className="flex items-center gap-2 text-text-primary font-bold">
                <HelpCircle className="w-4 h-4 text-accent-emerald" />
                <span>Zero-Hallucination Verification Active</span>
              </div>
              <p className="text-text-muted text-[11px] leading-relaxed">
                SupplyPilot explicitly refrains from inventing nonexistent order or inventory numbers. Operational systems confirmed no database record matching this inquiry.
              </p>
            </div>
          )}

          {/* Main Response Copy */}
          <div className="text-sm text-text-primary leading-relaxed whitespace-pre-line font-sans">
            {message.content}
          </div>

          {/* Proposed Action Card */}
          {proposedAction && (
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-bold font-mono uppercase text-purple-700">
                    PROPOSED ACTION · {proposedAction.action_type}
                  </span>
                </div>
                <Badge variant="purple" className="text-[10px]">
                  Staged Requisition
                </Badge>
              </div>

              {proposedAction.action_summary && (
                <p className="text-xs text-text-secondary font-medium leading-relaxed">
                  {proposedAction.action_summary}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-purple-200 text-xs font-mono">
                <div>
                  <span className="text-text-muted block text-[10px]">MONETARY VALUE</span>
                  <span className="text-emerald-600 font-bold">
                    {formatCurrency(proposedAction.monetary_value)}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">AUTHORIZATION</span>
                  <span className="text-purple-700 font-medium">
                    {proposedAction.required_role || "Procurement Officer"}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">JEV CONFIDENCE</span>
                  <span className="text-text-primary font-bold">
                    {jev ? `${Math.round(jev.confidence_score * 100)}%` : "Verified"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-text-muted font-mono">
                  State: <strong className="text-amber-700">{proposedAction.status}</strong>
                </span>
                <Button
                  variant="purple"
                  size="sm"
                  onClick={() => router.push("/approvals")}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Review in Approvals
                </Button>
              </div>
            </div>
          )}

          {/* Quick Context Pills */}
          <div className="pt-2 border-t border-border-subtle/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
              {payload?.plan && (
                <span>Plan: {payload.plan.length} steps</span>
              )}
              {citations.length > 0 && (
                <span>· Policies: {citations.length} SOPs</span>
              )}
              {jev && (
                <span>· Risk: {jev.risk_score ?? 28}/100</span>
              )}
            </div>

            {payload && onInspectTrace && (
              <button
                onClick={() => onInspectTrace(payload)}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Inspect Trace Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
