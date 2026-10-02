"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { useGuideTour } from "@/context/GuideTourContext";
import { TourHighlightWrapper } from "@/components/shared/TourSpotlight";
import { AuditItem } from "@/types/api";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { RawJsonDrawer } from "@/components/agent/RawJsonDrawer";
import { formatDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Compass,
  ArrowRight,
  Eye,
  Search,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Bot,
  Building2,
} from "lucide-react";

export default function ActivityAuditPage() {
  const router = useRouter();
  const { isActive, endTour } = useGuideTour();

  const [search, setSearch] = useState("");
  const [showFullLedger, setShowFullLedger] = useState(false);
  const [selectedAuditPayload, setSelectedAuditPayload] = useState<any | null>(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => api.audit.list(100),
    refetchInterval: 10000,
  });

  const filtered = logs.filter((item) => {
    return (
      item.action.toLowerCase().includes(search.toLowerCase()) ||
      item.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      item.target_type.toLowerCase().includes(search.toLowerCase()) ||
      item.reason.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Recent representative timeline steps (Section 19)
  const timelineSteps = [
    {
      time: "10:31",
      title: "Supplier Delay Detected",
      description: "BioSynth Europe reported +5 days transit delay on PO-9912 (API-004 Paracetamol).",
      actor: "Event Trigger / Ingestion",
      icon: Building2,
      badge: "DISRUPTION DETECTED",
      badgeVariant: "amber" as const,
    },
    {
      time: "10:32",
      title: "Order Impact Identified",
      description: "Warehouse deficit of -700 kg projected to breach Cleanroom Line 1 freeze window and stall ORD-1847 (Medix).",
      actor: "Cascade Engine",
      icon: AlertTriangle,
      badge: "SHOCKWAVE TRACED",
      badgeVariant: "red" as const,
    },
    {
      time: "10:33",
      title: "Procurement Recommendation Created",
      description: "LangGraph Copilot queried SOP-PRC-002, evaluated Jev risk (28/100, 94% conf), and staged €8,400 requisition.",
      actor: "SupplyPilot AI Copilot",
      icon: Bot,
      badge: "MITIGATION STAGED",
      badgeVariant: "purple" as const,
    },
    {
      time: "10:34",
      title: "Human Approval Granted",
      description: "Procurement Officer reviewed mitigating supplier and electronically signed purchase requisition.",
      actor: "Elena Rostova (Procurement Officer)",
      icon: FileCheck,
      badge: "HUMAN SIGN-OFF",
      badgeVariant: "emerald" as const,
    },
    {
      time: "10:34",
      title: "Action Recorded in Immutable Ledger",
      description: "Append-only state diff immutably saved with cryptographic hash under SOC-2 / FDA 21 CFR Part 11 requirements.",
      actor: "Compliance Ledger",
      icon: ShieldCheck,
      badge: "AUDIT LOGGED",
      badgeVariant: "emerald" as const,
    },
  ];

  return (
    <AppShell
      title="Activity & Compliance Ledger"
      subtitle="Complete chronological timeline of operational disruptions, agent proposals & human decisions"
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Guided Demo Completion Card (Section 20) */}
        {isActive && (
          <div className="p-8 rounded-3xl bg-surface border-2 border-emerald-500 shadow-elevation text-center space-y-6 relative overflow-hidden animate-in fade-in duration-300">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                DEMONSTRATION COMPLETE
              </span>
              <h2 className="text-2xl font-extrabold text-text-primary">
                You&apos;ve Seen the Core of SupplyPilot
              </h2>
              <p className="text-xs text-text-secondary max-w-lg mx-auto leading-relaxed">
                One complete, transparent operational loop from unexpected supplier delay to deterministic execution.
              </p>
            </div>

            {/* Loop Chain Graphic */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-text-primary max-w-2xl mx-auto py-2">
              <span className="px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-subtle">
                Supplier Disruption
              </span>
              <span>→</span>
              <span className="px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-subtle">
                Impact Detection
              </span>
              <span>→</span>
              <span className="px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-subtle">
                AI Investigation
              </span>
              <span>→</span>
              <span className="px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-subtle">
                Evidence + Policy
              </span>
              <span>→</span>
              <span className="px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-subtle">
                Decision Support
              </span>
              <span>→</span>
              <span className="px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-subtle">
                Human Approval
              </span>
              <span>→</span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
                Action + Audit Trail
              </span>
            </div>

            <div className="pt-2 flex justify-center">
              <TourHighlightWrapper targetId="tour-btn-complete">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    endTour();
                    router.push("/dashboard");
                  }}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="shadow-glow-emerald px-8 font-bold"
                >
                  Explore SupplyPilot
                </Button>
              </TourHighlightWrapper>
            </div>
          </div>
        )}

        {/* The Clean Activity Timeline (Section 19) */}
        <div className="rounded-3xl bg-surface border border-border-subtle shadow-subtle p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Operational Event Timeline
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Proves the entire automated detection and resolution loop worked.
              </p>
            </div>

            <Badge variant="emerald" beacon className="text-xs font-mono">
              Live Stream Active
            </Badge>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-border-subtle">
            {timelineSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative flex items-start gap-5 group">
                  <div className="w-10 h-10 rounded-xl bg-surface border-2 border-border-subtle group-hover:border-purple-500 transition-colors flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                    <Icon className="w-4 h-4 text-text-primary" />
                  </div>

                  <div className="flex-1 p-4 rounded-2xl bg-surface-secondary/50 border border-border-subtle/80 space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-text-primary">
                          {item.time}
                        </span>
                        <span className="text-text-muted">·</span>
                        <h4 className="text-sm font-bold text-text-primary">
                          {item.title}
                        </h4>
                      </div>

                      <Badge variant={item.badgeVariant} className="text-[10px] font-mono">
                        {item.badge}
                      </Badge>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.description}
                    </p>

                    <div className="text-[11px] font-mono text-text-muted pt-1">
                      Actor: <span className="font-semibold text-text-primary">{item.actor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expandable Technical Audit Ledger (Section 19 & 34) */}
        <div className="rounded-2xl bg-surface border border-border-subtle p-6 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Technical Audit Ledger & Cryptographic Verification
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                SOC-2 Type II & FDA 21 CFR Part 11 compliant append-only ledger ({logs.length} raw entries).
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullLedger(!showFullLedger)}
              rightIcon={showFullLedger ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              className="text-xs"
            >
              {showFullLedger ? "Hide Full Ledger" : "Inspect Full Ledger"}
            </Button>
          </div>

          {showFullLedger && (
            <div className="space-y-4 pt-3 border-t border-border-subtle animate-in fade-in duration-300">
              {/* Search */}
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search raw ledger actions..."
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-surface-secondary border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-border-subtle">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-secondary text-text-muted border-b border-border-subtle uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Target</th>
                      <th className="p-3 text-right">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {filtered.slice(0, 10).map((log) => (
                      <tr key={log.id} className="hover:bg-surface-secondary/40">
                        <td className="p-3 text-text-muted">{formatDateTime(log.created_at)}</td>
                        <td className="p-3 font-bold text-text-primary">{log.action}</td>
                        <td className="p-3 text-text-secondary">{log.actor_name}</td>
                        <td className="p-3 text-purple-700">{log.target_type}</td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAuditPayload(log)}
                            className="text-xs h-6 px-2 text-text-muted hover:text-text-primary"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw Payload Drawer */}
      <RawJsonDrawer
        isOpen={Boolean(selectedAuditPayload)}
        onClose={() => setSelectedAuditPayload(null)}
        title="Audit Event State Snapshot"
        data={selectedAuditPayload}
      />
    </AppShell>
  );
}
