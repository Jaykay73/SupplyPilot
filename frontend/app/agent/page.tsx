"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Database,
  Cpu,
  Layers,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  runData?: any;
}

const PRESET_QUERIES = [
  {
    label: "Medix Flagship Shortage (ORD-1847)",
    query: "Can we fulfill Medix's order ORD-1847 by October 20?",
    category: "shortage",
  },
  {
    label: "Supplier Recommendation (1,500 kg API-004)",
    query: "Which supplier should we use if we need 1,500 kg of API-004 by Friday?",
    category: "supplier",
  },
  {
    label: "Policy SOP Test (BioSynth Restriction)",
    query: "Can we procure API-004 from BioSynth Corp for the upcoming batch?",
    category: "policy",
  },
  {
    label: "Zero-Hallucination Test (Missing Order)",
    query: "Can we fulfill Order #ORD-9999 by tomorrow morning?",
    category: "hallucination",
  },
];

function AgentChatContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeRunData, setActiveRunData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"plan" | "evidence" | "citations" | "jev" | "rules">("plan");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check URL query param
  useEffect(() => {
    const q = searchParams.get("query");
    if (q) {
      handleSendMessage(q);
    } else if (messages.length === 0) {
      // Welcome message
      setMessages([
        {
          id: "welcome",
          sender: "agent",
          text: "Hello! I am SupplyPilot Operations Copilot. I analyze real-time inventory, calculate BOM material deficits, evaluate supplier scorecards, enforce SOP approval policies, and coordinate human authorization gates. What would you like to investigate today?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(text.trim());
      const agentMsg: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: "agent",
        text: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        runData: response,
      };
      setMessages((prev) => [...prev, agentMsg]);
      setActiveRunData(response);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "agent",
        text: `Error processing request: ${err.message}. Please verify the backend is running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-5 max-w-[1700px] mx-auto">
        {/* Left Panel: Chat Interface (55%) */}
        <div className="flex-1 flex flex-col bg-[#0d121f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  SupplyPilot Copilot
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LangGraph Stateful
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">Zero-hallucination policy guardrails &amp; Jev risk assessment</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMessages([]);
                setActiveRunData(null);
              }}
              title="Reset Conversation"
              className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Preset Prompts Ribbon */}
          <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-900/20 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 font-medium">Quick Prompts:</span>
            {PRESET_QUERIES.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 border border-slate-700/60 text-[11px] text-slate-300 transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                {m.sender === "agent" && (
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-slate-950 font-medium rounded-tr-sm"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {m.runData && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        {m.runData.approval_required ? (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" /> Approval Required
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Fully Compliant
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setActiveRunData(m.runData)}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        Inspect Trace <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <span className={`block text-[10px] mt-1.5 ${m.sender === "user" ? "text-slate-800" : "text-slate-500"}`}>
                    {m.timestamp}
                  </span>
                </div>
                {m.sender === "user" && (
                  <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-slate-400 animate-pulse">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot className="h-4 w-4" />
                </div>
                <span>SupplyPilot is querying operational databases, checking SOP policies, and calculating risk...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about order fulfillment, supplier scoring, policy constraints, or inventory shortages..."
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Execution Trace Inspector (45%) */}
        <div className="w-full lg:w-[45%] flex flex-col bg-[#0d121f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Header & Tabs */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                <Cpu className="h-4 w-4 text-emerald-400" />
                Live Execution Trace Inspector
              </h3>
              {activeRunData?.run_id && (
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[160px]">
                  ID: {activeRunData.run_id.slice(0, 8)}...
                </span>
              )}
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setActiveTab("plan")}
                className={`flex-1 py-1 rounded text-center font-medium transition ${
                  activeTab === "plan" ? "bg-slate-800 text-emerald-400 font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Plan ({activeRunData?.plan?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("evidence")}
                className={`flex-1 py-1 rounded text-center font-medium transition ${
                  activeTab === "evidence" ? "bg-slate-800 text-emerald-400 font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Evidence
              </button>
              <button
                onClick={() => setActiveTab("citations")}
                className={`flex-1 py-1 rounded text-center font-medium transition ${
                  activeTab === "citations" ? "bg-slate-800 text-emerald-400 font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Policies ({activeRunData?.policy_citations?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("jev")}
                className={`flex-1 py-1 rounded text-center font-medium transition ${
                  activeTab === "jev" ? "bg-slate-800 text-emerald-400 font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Jev AI
              </button>
              <button
                onClick={() => setActiveTab("rules")}
                className={`flex-1 py-1 rounded text-center font-medium transition ${
                  activeTab === "rules" ? "bg-slate-800 text-emerald-400 font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Rules Gate
              </button>
            </div>
          </div>

          {/* Trace Content Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {!activeRunData ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Layers className="h-10 w-10 text-slate-700 mb-3" />
                <p className="font-medium text-slate-400 text-xs">No Active Execution Trace</p>
                <p className="text-[11px] mt-1 max-w-xs">
                  Run a query in the chat panel to view real-time planning steps, database evidence, RAG policy citations, Jev risk scores, and deterministic rule evaluations.
                </p>
              </div>
            ) : (
              <>
                {/* TAB 1: EXECUTION PLAN */}
                {activeTab === "plan" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-300">LangGraph Execution Steps</span>
                      <span className="text-[10px] font-mono text-emerald-400">100% Deterministic Execution</span>
                    </div>
                    {activeRunData.plan && activeRunData.plan.length > 0 ? (
                      <div className="space-y-2">
                        {activeRunData.plan.map((step: string, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3"
                          >
                            <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-200 font-medium">{step}</p>
                              <span className="text-[10px] font-mono text-slate-500">Verified by DB / Rule Engine</span>
                            </div>
                            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No planning steps recorded for this message.</p>
                    )}
                  </div>
                )}

                {/* TAB 2: DATABASE EVIDENCE */}
                {activeTab === "evidence" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-300">Transactional Evidence Fetched</span>
                      <span className="text-[10px] font-mono text-blue-400">Read-Only Tools</span>
                    </div>

                    {activeRunData.retrieved_evidence ? (
                      <div className="space-y-3">
                        {/* Order evidence */}
                        {activeRunData.retrieved_evidence.order && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                              Order Evidence (get_order)
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>Order: <span className="font-mono text-slate-200">{activeRunData.retrieved_evidence.order.order_number}</span></div>
                              <div>Customer: <span className="text-slate-200">{activeRunData.retrieved_evidence.order.customer_name}</span></div>
                              <div>Delivery: <span className="text-slate-200">{activeRunData.retrieved_evidence.order.delivery_deadline}</span></div>
                              <div>Status: <span className="text-slate-200">{activeRunData.retrieved_evidence.order.status}</span></div>
                            </div>
                          </div>
                        )}

                        {/* BOM Shortage evidence */}
                        {activeRunData.retrieved_evidence.material_shortage && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                              BOM Calculation (calculate_material_shortage)
                            </span>
                            <div className="text-[11px] space-y-1">
                              <div>Has Shortage: <span className="font-semibold text-amber-300">{activeRunData.retrieved_evidence.material_shortage.has_shortage ? "YES" : "NO"}</span></div>
                              <div>Primary Deficit Material: <span className="font-mono text-slate-200">{activeRunData.retrieved_evidence.material_shortage.primary_shortage_material}</span></div>
                              <div>Required for Batch: <span className="font-mono text-slate-200">{activeRunData.retrieved_evidence.material_shortage.materials?.[0]?.required_quantity} kg</span></div>
                              <div>Available in Stock: <span className="font-mono text-slate-200">{activeRunData.retrieved_evidence.material_shortage.materials?.[0]?.available_quantity} kg</span></div>
                              <div className="text-rose-400 font-semibold">Net Deficit: {activeRunData.retrieved_evidence.material_shortage.materials?.[0]?.shortage_quantity} kg</div>
                            </div>
                          </div>
                        )}

                        {/* Supplier Recommendation */}
                        {activeRunData.retrieved_evidence.supplier_recommendation && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block mb-1">
                              Supplier Scoring (find_suppliers)
                            </span>
                            <div className="text-[11px] space-y-1">
                              <div>Recommended: <span className="text-emerald-400 font-semibold">{activeRunData.retrieved_evidence.supplier_recommendation.recommended_supplier?.supplier_name}</span></div>
                              <div>Supplier Code: <span className="font-mono text-slate-300">{activeRunData.retrieved_evidence.supplier_recommendation.recommended_supplier?.supplier_code}</span></div>
                              <div>Lead Time: <span className="text-slate-200">{activeRunData.retrieved_evidence.supplier_recommendation.recommended_supplier?.lead_time_days} days</span></div>
                              <div>Unit Price: <span className="text-slate-200">€{activeRunData.retrieved_evidence.supplier_recommendation.recommended_supplier?.unit_price} / kg</span></div>
                              <div>Total Cost: <span className="font-mono text-slate-100 font-bold">{formatCurrency(activeRunData.retrieved_evidence.supplier_recommendation.recommended_supplier?.total_cost)}</span></div>
                              <div className="text-[10px] text-slate-400 italic pt-1">{activeRunData.retrieved_evidence.supplier_recommendation.recommended_supplier?.recommendation_reason}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500">No database evidence loaded.</p>
                    )}
                  </div>
                )}

                {/* TAB 3: POLICY CITATIONS */}
                {activeTab === "citations" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-300">Authoritative SOP Citations</span>
                      <span className="text-[10px] font-mono text-emerald-400">RAG Semantic Search</span>
                    </div>

                    {activeRunData.policy_citations && activeRunData.policy_citations.length > 0 ? (
                      <div className="space-y-2">
                        {activeRunData.policy_citations.map((cite: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-[10px] text-emerald-400 font-semibold">{cite.policy_id}</span>
                              <span className="text-[10px] text-slate-400">{cite.document}</span>
                            </div>
                            <h4 className="font-medium text-xs text-slate-200 mb-1">{cite.section_title}</h4>
                            <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded border border-slate-800/80 leading-relaxed">
                              "{cite.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No company policy citations triggered.</p>
                    )}
                  </div>
                )}

                {/* TAB 4: JEV AI PROBABILISTIC ASSESSMENT */}
                {activeTab === "jev" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-300">Vercel AI Gateway: Jev Evaluator</span>
                      <span className="text-[10px] font-mono text-purple-400">Probabilistic Advisory</span>
                    </div>

                    {activeRunData.jev_evaluation ? (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-purple-300">Confidence Score</span>
                            <span className="text-base font-mono font-bold text-purple-400">
                              {(activeRunData.jev_evaluation.confidence_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{ width: `${activeRunData.jev_evaluation.confidence_score * 100}%` }}
                            />
                          </div>

                          <div className="mt-3 pt-3 border-t border-purple-500/20 grid grid-cols-2 gap-2 text-[11px]">
                            <div>Recommendation: <span className="font-semibold text-slate-200">{activeRunData.jev_evaluation.recommended_decision}</span></div>
                            <div>Risk Score: <span className="font-semibold text-slate-200">{activeRunData.jev_evaluation.risk_score}/100</span></div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                            Decision Justification
                          </span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {activeRunData.jev_evaluation.decision_justification}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-500">
                        <p>No high-consequence monetary action evaluated by Jev for this inquiry.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: DETERMINISTIC RULES GATE */}
                {activeTab === "rules" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-300">Rules Engine (Authoritative)</span>
                      <span className="text-[10px] font-mono text-emerald-400">Hard Invariant Check</span>
                    </div>

                    {activeRunData.rule_evaluation ? (
                      <div className="space-y-3">
                        <div
                          className={`p-4 rounded-xl border ${
                            activeRunData.rule_evaluation.requires_human_approval
                              ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">
                              {activeRunData.rule_evaluation.requires_human_approval
                                ? "HUMAN APPROVAL MANDATORY"
                                : "AUTONOMOUS EXECUTION PERMITTED"}
                            </span>
                            <span className="text-xs font-mono font-bold">
                              {activeRunData.rule_evaluation.status}
                            </span>
                          </div>
                          <p className="text-[11px] mt-1 text-slate-300">
                            Required Role: <strong className="text-white capitalize">{activeRunData.rule_evaluation.required_approval_role.replace("_", " ")}</strong>
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                          <div>Policy Rule: <span className="font-mono text-slate-200">SOP-PRC-001 (Section 2.1)</span></div>
                          <div>Precedence Invariant: <span className="text-emerald-400 font-semibold">Strict Rule Supremacy</span></div>
                          <p className="text-slate-400 text-[10px] mt-2">
                            Deterministic rules enforce that probabilistic scores cannot bypass procurement approval gates above €5,000.
                          </p>
                        </div>

                        {activeRunData.approval_required && (
                          <Link
                            href="/approvals"
                            className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition"
                          >
                            <ShieldAlert className="h-4 w-4" /> Go to Approvals Center
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-500">
                        <p>No financial threshold action submitted to the Rules Engine.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function AgentPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading Operations Copilot...
          </div>
        </AppShell>
      }
    >
      <AgentChatContent />
    </Suspense>
  );
}
