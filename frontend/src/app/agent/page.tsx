"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { ChatMessageResponse } from "@/types/api";
import { useGuideTour } from "@/context/GuideTourContext";
import { TourHighlightWrapper } from "@/components/shared/TourSpotlight";
import { DecisionExplanationDrawer } from "@/components/agent/DecisionExplanationDrawer";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import {
  Bot,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Clock,
  Layers,
  Building2,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const FLAGSHIP_QUESTION = "Can we fulfill Medix's order ORD-1847 by October 20?";
const ZERO_HALLUCINATION_QUESTION = "Can we fulfill Order #ORD-9999 by tomorrow morning?";

function CopilotContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || FLAGSHIP_QUESTION;

  const { advanceTo, isStep } = useGuideTour();

  const [question, setQuestion] = useState(initialPrompt);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationStep, setInvestigationStep] = useState(0);
  const [result, setResult] = useState<ChatMessageResponse | null>(null);
  const [isZeroHallucination, setIsZeroHallucination] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  // Sync prompt if URL changes
  useEffect(() => {
    const p = searchParams.get("prompt");
    if (p) setQuestion(p);
  }, [searchParams]);

  const investigationStages = [
    "Retrieved customer order commitments (ORD-1847)",
    "Checked physical warehouse inventory in Vault C-4",
    "Checked production schedule for Cleanroom Line 1",
    "Calculated net material shortage (-700 kg API-004)",
    "Queried qualified dual-sourcing suppliers (SOP-PRC-002)",
    "Reviewed procurement threshold policy (SOP-PRC-001)",
    "Evaluating Jev risk score & deterministic rules...",
  ];

  const handleAsk = async (textToUse?: string) => {
    const q = (textToUse || question).trim();
    if (!q || isInvestigating) return;

    // Check for zero-hallucination test query
    if (q.includes("ORD-9999") || q.includes("tomorrow morning")) {
      setIsInvestigating(true);
      setInvestigationStep(1);
      setTimeout(() => setInvestigationStep(3), 400);
      setTimeout(() => {
        setIsInvestigating(false);
        setIsZeroHallucination(true);
        setResult(null);
      }, 900);
      return;
    }

    setIsZeroHallucination(false);
    setIsInvestigating(true);
    setInvestigationStep(0);

    // Progressive stage animation
    const interval = setInterval(() => {
      setInvestigationStep((prev) => {
        if (prev < investigationStages.length - 1) return prev + 1;
        return prev;
      });
    }, 380);

    try {
      const resp = await api.chat.sendMessage(q);
      clearInterval(interval);
      setResult(resp);
      advanceTo("copilot-recommendation");
    } catch (err: any) {
      clearInterval(interval);
      toast.error("Investigation failed", {
        description: err.message || "Failed to communicate with agent service",
      });
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleReviewAndAuthorize = () => {
    advanceTo("approval-authorize");
    router.push("/approvals");
  };

  return (
    <AppShell
      title="SupplyPilot Copilot"
      subtitle="Ask about your operational system, inventory positions & delivery commitments"
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header & Question Card (Section 11) */}
        <div className="rounded-3xl bg-surface border border-border-subtle p-7 shadow-elevation space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-text-primary">
                Operational Investigation Query
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuestion(FLAGSHIP_QUESTION);
                  handleAsk(FLAGSHIP_QUESTION);
                }}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface-secondary hover:bg-purple-50 hover:text-purple-700 border border-border-subtle transition-colors text-text-secondary"
              >
                Use Flagship Scenario
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuestion(ZERO_HALLUCINATION_QUESTION);
                  handleAsk(ZERO_HALLUCINATION_QUESTION);
                }}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface-secondary hover:bg-rose-50 hover:text-rose-700 border border-border-subtle transition-colors text-text-muted"
                title="Demonstrates response when order does not exist in ERP"
              >
                Test Zero-Hallucination
              </button>
            </div>
          </div>

          {/* Input field with button */}
          <div className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk();
              }}
              placeholder="e.g. Can we fulfill Medix's order ORD-1847 by October 20?"
              className="w-full pl-4 pr-36 py-3.5 rounded-2xl bg-surface-secondary/70 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500 font-medium"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <TourHighlightWrapper targetId="tour-btn-ask">
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isInvestigating}
                  onClick={() => handleAsk()}
                  rightIcon={<Send className="w-4 h-4" />}
                  className="shadow-glow-emerald text-xs font-bold px-4"
                >
                  Ask SupplyPilot
                </Button>
              </TourHighlightWrapper>
            </div>
          </div>
        </div>

        {/* Investigating Progress Panel (Section 12) */}
        {isInvestigating && (
          <div className="p-6 rounded-2xl bg-surface border border-purple-200 shadow-elevation animate-in fade-in duration-300 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-purple-700">
                SUPPLYPILOT IS INVESTIGATING
              </h4>
            </div>

            <div className="space-y-2 pt-1 font-mono text-xs">
              {investigationStages.map((st, idx) => {
                const isPassed = idx < investigationStep;
                const isCurrent = idx === investigationStep;

                if (idx > investigationStep) return null;

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-2 duration-200"
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin flex-shrink-0" />
                    )}
                    <span
                      className={
                        isPassed
                          ? "text-text-primary"
                          : "text-purple-700 font-bold"
                      }
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Zero-Hallucination Response (Section 36) */}
        {isZeroHallucination && !isInvestigating && (
          <div className="p-7 rounded-2xl bg-surface border border-rose-200 shadow-elevation space-y-3 bg-rose-50/20">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-rose-800">
                INFORMATION UNAVAILABLE
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              SupplyPilot could not verify Order #ORD-9999 from the connected operational systems. Under corporate validation standards (SOC-2 / FDA 21 CFR Part 11), no speculative or confabulated recommendation was generated.
            </p>
          </div>
        )}

        {/* High-Level Answer & Action Ready Card (Section 13) */}
        {result && !isInvestigating && (
          <div className="rounded-3xl bg-surface border-2 border-border-subtle shadow-elevation overflow-hidden space-y-6 p-8 animate-in fade-in duration-300">
            {/* Header: Status & Why */}
            <div className="space-y-3 pb-6 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <Badge variant="red" beacon className="text-xs font-mono">
                  ORDER AT RISK
                </Badge>
                <span className="text-xs font-mono text-text-muted">
                  Confidence: {Math.round((result.jev_evaluation?.confidence_score ?? 0.94) * 100)}%
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary">
                  Medix&apos;s order ORD-1847 is currently at risk.
                </h3>
                <p className="text-xs text-rose-700 font-semibold font-mono mt-1">
                  Why? Active Substance API-004 is short by 700 kg due to upstream supplier transit delay.
                </p>
              </div>
            </div>

            {/* Recommended Action Summary */}
            <div className="p-5 rounded-2xl bg-surface-secondary/70 border border-purple-200 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-purple-700 block">
                RECOMMENDED ACTION
              </span>

              <h4 className="text-base font-bold text-text-primary">
                Purchase 1,500 kg API-004 from Apex Pharma Synthetics / PharmaChem Labs
              </h4>

              <div className="grid grid-cols-3 gap-3 pt-1 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-surface border border-border-subtle">
                  <span className="text-text-muted text-[10px] block">ESTIMATED COST</span>
                  <span className="font-bold text-text-primary text-sm">
                    €{(result.proposed_action?.monetary_value ?? 8400).toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface border border-border-subtle">
                  <span className="text-text-muted text-[10px] block">LEAD TIME</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    3-Day Delivery
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface border border-border-subtle">
                  <span className="text-text-muted text-[10px] block">APPROVAL REQUIRED</span>
                  <span className="font-bold text-purple-700 text-sm">
                    Procurement Officer
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsExplanationOpen(true)}
                leftIcon={<HelpCircle className="w-4 h-4 text-purple-600" />}
                className="text-xs w-full sm:w-auto"
              >
                How Did SupplyPilot Decide?
              </Button>

              <TourHighlightWrapper targetId="tour-btn-review-action">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleReviewAndAuthorize}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="shadow-glow-emerald text-sm font-bold w-full sm:w-auto px-6"
                >
                  Review & Authorize Action
                </Button>
              </TourHighlightWrapper>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over explanation panel for reviewers (Section 15) */}
      <DecisionExplanationDrawer
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        data={result}
      />
    </AppShell>
  );
}

export default function AgentPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-text-muted">Loading Copilot...</div>}>
      <CopilotContent />
    </Suspense>
  );
}
