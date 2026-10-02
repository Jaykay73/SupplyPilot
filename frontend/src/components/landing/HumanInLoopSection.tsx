"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileCheck,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { toast } from "sonner";

export function HumanInLoopSection() {
  const [authorized, setAuthorized] = useState(false);

  const handleSimulatedApprove = () => {
    setAuthorized(true);
    toast.success("Action Authorized", {
      description: "Requisition APP-8472 transitioned to APPROVED state via digital signature.",
    });
  };

  return (
    <section id="governance" className="py-24 px-6 border-b border-border-subtle bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Approval Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-surface border border-border-subtle p-6 shadow-elevation relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">
                      PURCHASE REQUISITION #APP-8472
                    </h4>
                    <span className="text-[11px] font-mono text-text-muted">
                      Target Order: ORD-1847 (Medix Logistics)
                    </span>
                  </div>
                </div>

                <Badge variant={authorized ? "emerald" : "amber"} beacon={!authorized}>
                  {authorized ? "APPROVED & STAGED" : "PENDING HUMAN SIGN-OFF"}
                </Badge>
              </div>

              {/* Card Body */}
              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-secondary border border-border-subtle">
                  <div>
                    <span className="text-text-muted block text-[10px]">MATERIAL REQUISITION</span>
                    <span className="text-text-primary font-bold text-sm">
                      API-004 · 1,500 kg
                    </span>
                    <span className="text-text-muted block text-[10px] mt-0.5">
                      Paracetamol Sterile Grade
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">TOTAL MONETARY VALUE</span>
                    <span className="text-emerald-600 font-bold text-sm">
                      €8,400.00 EUR
                    </span>
                    <span className="text-text-muted block text-[10px] mt-0.5">
                      Unit: €5.60 / kg (Apex BioChem)
                    </span>
                  </div>
                </div>

                {/* Governance & Jev Intelligence */}
                <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Jev AI Risk Score:</span>
                    <span className="text-emerald-600 font-bold">28 / 100 (LOW RISK)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Confidence Rating:</span>
                    <span className="text-purple-600 font-bold">94% Certified SLA</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                    <span className="text-text-muted">Policy Gate (SOP-PRC-001):</span>
                    <span className="text-text-primary font-medium">Procurement Officer Review Required</span>
                  </div>
                </div>

                {/* Interactive Action Controls */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  {!authorized ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => toast.error("Rejection simulated with audit log reason recorded")}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Reject Requisition
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSimulatedApprove}
                        leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                      >
                        Authorize Action
                      </Button>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Signed by Sarah Chen (Procurement Officer)
                      </span>
                      <button
                        onClick={() => setAuthorized(false)}
                        className="text-[11px] underline hover:text-emerald-800"
                      >
                        Reset Demo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-accent-purple block">
              Governance & Safeguards
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
              Automation without losing control.
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              SupplyPilot is engineered around the principle of{" "}
              <strong className="text-text-primary">Deterministic Supremacy</strong>.
              While AI excels at discovering bottlenecks and formulating solutions, it
              operates strictly inside an inviolable rules engine.
            </p>

            <div className="space-y-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-surface border border-border-subtle flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-accent-emerald flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-text-primary">
                    Authoritative Financial Gates
                  </h5>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Orders under €5k can execute autonomously. Requisitions up to €25k
                    mandate Procurement Officer sign-off. Major contracts exceeding €25k
                    require Operations Manager authorization.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border-subtle flex items-start gap-3">
                <Lock className="w-5 h-5 text-accent-purple flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-text-primary">
                    Simulation Boundary Protection
                  </h5>
                  <p className="text-xs text-text-secondary mt-0.5">
                    All action proposals are held in staged state (`PENDING_APPROVAL`). Zero
                    unsolicited external communications or vendor purchase orders are emitted
                    without authenticated human signature.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/approvals">
                <Button
                  variant="secondary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  View Approvals Queue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
