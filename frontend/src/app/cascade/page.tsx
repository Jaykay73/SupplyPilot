"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { useGuideTour } from "@/context/GuideTourContext";
import { TourHighlightWrapper } from "@/components/shared/TourSpotlight";
import { CascadeReport } from "@/types/api";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { formatCurrency } from "@/lib/utils";
import {
  Play,
  ArrowRight,
  AlertTriangle,
  Boxes,
  Factory,
  ShoppingCart,
  Building2,
  CheckCircle2,
  RotateCcw,
  Bot,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DisruptionCascadePage() {
  const router = useRouter();
  const { advanceTo, isStep } = useGuideTour();

  const [simulated, setSimulated] = useState(true); // Default true so arriving visitor immediately sees the story
  const [activeStep, setActiveStep] = useState(6);
  const [isSimulating, setIsSimulating] = useState(false);

  // Allow re-triggering simulation
  const handleReSimulate = async () => {
    setIsSimulating(true);
    setActiveStep(1);
    try {
      await api.events.simulateDelay();
      toast.warning("Supplier delay injected", {
        description: "Tracing cascade shockwave...",
      });
      // Step-by-step animation
      for (let s = 1; s <= 6; s++) {
        await new Promise((r) => setTimeout(r, 350));
        setActiveStep(s);
      }
    } catch (err: any) {
      toast.error("Failed to run simulation", { description: err.message });
      setActiveStep(6);
    } finally {
      setIsSimulating(false);
      setSimulated(true);
    }
  };

  const handleInvestigate = () => {
    advanceTo("copilot-ask");
    const prompt = encodeURIComponent(
      "Can we fulfill Medix's order ORD-1847 by October 20?"
    );
    router.push(`/agent?order=ORD-1847&prompt=${prompt}`);
  };

  const cascadeSteps = [
    {
      step: 1,
      title: "Supplier Delay",
      subtitle: "BioSynth Europe",
      detail: "Transit delay +5 days on PO-9912",
      status: "warning", // amber
      badge: "+5 DAYS DELAY",
      icon: Building2,
    },
    {
      step: 2,
      title: "API-004 Delayed",
      subtitle: "Paracetamol Active Ingredient",
      detail: "Delivery pushed from Oct 14 to Oct 19",
      status: "warning", // amber
      badge: "ETA OCT 19",
      icon: Clock,
    },
    {
      step: 3,
      title: "700 kg Shortage",
      subtitle: "Sterile Vault C-4",
      detail: "Available stock plunges below zero (-700 kg)",
      status: "critical", // red
      badge: "DEFICIT: -700 KG",
      icon: Boxes,
    },
    {
      step: 4,
      title: "Batch BATCH-104 Stalled",
      subtitle: "Cleanroom Line 1",
      detail: "Compounding blocked: 48hr freeze violated",
      status: "critical", // red
      badge: "FREEZE BREACH",
      icon: Factory,
    },
    {
      step: 5,
      title: "ORD-1847 At Risk",
      subtitle: "Medix Hospital Solutions",
      detail: "10,000 vials cannot ship by October 20",
      status: "critical", // red
      badge: "DELIVERY THREAT",
      icon: ShoppingCart,
    },
    {
      step: 6,
      title: "Customer Impact",
      subtitle: "€38,500 Contract Value",
      detail: "Impending penalty of €1,500 / day default",
      status: "critical", // red
      badge: "ACTION REQUIRED",
      icon: AlertTriangle,
    },
  ];

  return (
    <AppShell
      title="Disruption Cascade Visualizer"
      subtitle="How one supplier problem ripples through production to customer orders"
      headerActions={
        <Button
          variant="outline"
          size="sm"
          isLoading={isSimulating}
          onClick={handleReSimulate}
          leftIcon={<RotateCcw className="w-3.5 h-3.5 text-amber-600" />}
          className="text-xs"
        >
          Re-Simulate Delay
        </Button>
      }
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Visual Story Summary Banner */}
        <div className="p-6 rounded-2xl bg-surface border border-border-subtle shadow-subtle text-center space-y-2">
          <Badge variant="red" beacon className="font-mono text-xs">
            LIVE DISRUPTION SHOCKWAVE DETECTED
          </Badge>
          <h2 className="text-2xl font-extrabold text-text-primary">
            One Supplier Problem. Downstream Operational Shockwave.
          </h2>
          <p className="text-xs text-text-secondary max-w-xl mx-auto leading-relaxed">
            SupplyPilot automatically connects warehouse inventory reservations, cleanroom freeze windows, and commercial order commitments.
          </p>
        </div>

        {/* The 6-Stage Visual Story Sequence (Section 9) */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cascadeSteps.map((item, idx) => {
              const isVisible = item.step <= activeStep;
              const isWarning = item.status === "warning";
              const isCritical = item.status === "critical";
              const Icon = item.icon;

              return (
                <div
                  key={item.step}
                  className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isVisible
                      ? isCritical
                        ? "bg-rose-50/40 border-rose-200 shadow-subtle"
                        : "bg-amber-50/40 border-amber-200 shadow-subtle"
                      : "bg-surface-secondary/30 border-border-subtle/50 opacity-40"
                  }`}
                >
                  <div>
                    {/* Header with step number & badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-surface border border-border-subtle flex items-center justify-center font-mono font-bold text-xs text-text-primary">
                          {item.step}
                        </span>
                        <Icon
                          className={`w-4 h-4 ${
                            isCritical ? "text-rose-600" : "text-amber-600"
                          }`}
                        />
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          isCritical
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text-primary mb-0.5">
                      {item.title}
                    </h4>
                    <p className="text-xs text-text-secondary font-medium">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border-subtle/70 text-[11px] font-mono text-text-muted">
                    {item.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The One Obvious Next Action Box (Section 9 & 10) */}
        <div className="p-8 rounded-3xl bg-surface border-2 border-purple-500 shadow-elevation text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
              NEXT STEP · ACTION READY
            </span>
            <h3 className="text-xl font-bold text-text-primary">
              SupplyPilot found 1 affected order: ORD-1847 (Medix)
            </h3>
            <p className="text-xs text-text-secondary max-w-lg mx-auto">
              Ask the AI agent to evaluate warehouse alternatives, SOP procurement policies, and recommend an authorized mitigation.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <TourHighlightWrapper targetId="tour-btn-investigate">
              <Button
                variant="primary"
                size="lg"
                onClick={handleInvestigate}
                leftIcon={<Bot className="w-5 h-5" />}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="px-8 shadow-glow-emerald text-base font-bold"
              >
                Investigate with Copilot
              </Button>
            </TourHighlightWrapper>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
