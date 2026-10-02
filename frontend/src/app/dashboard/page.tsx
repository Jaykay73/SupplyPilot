"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { useGuideTour } from "@/context/GuideTourContext";
import { TourHighlightWrapper } from "@/components/shared/TourSpotlight";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Play,
  Bot,
  AlertTriangle,
  ArrowRight,
  Compass,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  ShoppingCart,
  Boxes,
  Factory,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { startTour, advanceTo, isActive } = useGuideTour();

  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // First-time visitor check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("supplypilot_welcome_seen");
      if (!seen) {
        setWelcomeModalOpen(true);
      }
    }
  }, []);

  const handleDismissWelcome = () => {
    setWelcomeModalOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("supplypilot_welcome_seen", "true");
    }
  };

  const handleStartGuidedFromWelcome = () => {
    handleDismissWelcome();
    startTour();
  };

  // Live summary from FastAPI backend
  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.dashboard.getSummary(),
    refetchInterval: 10000,
  });

  // Handle Simulate Supplier Delay
  const handleSimulateDelay = async () => {
    setIsSimulating(true);
    try {
      await api.events.simulateDelay();
      toast.warning("Supplier Delay Disruption Injected", {
        description: "BioSynth Europe delayed API-004 (+5 days). Impacting Batch BATCH-104 and Order ORD-1847.",
      });
      advanceTo("cascade-investigate");
      router.push("/cascade");
    } catch (err: any) {
      toast.error("Simulation failed", {
        description: err.message || "Failed to trigger supplier disruption",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const totalOrders = summary?.total_orders ?? 124;
  const atRiskCount = summary?.at_risk_orders_count ?? 7;
  const pendingApprovalsCount = summary?.pending_approvals_count ?? 1;
  const activeBatchesCount = summary?.active_batches_count ?? 4;

  return (
    <AppShell
      title="Operations Dashboard"
      subtitle="Connected intelligence from supplier to customer"
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Simple Top Banner (Section 7) */}
        <div className="p-8 rounded-3xl bg-surface border border-border-subtle shadow-elevation relative overflow-hidden">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-secondary border border-border-subtle text-xs font-mono text-purple-700 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>SupplyPilot Operations Console</span>
            </div>

            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">
              Connected operations, one intelligent chain.
            </h2>

            <p className="text-sm text-text-secondary leading-relaxed">
              See what changed. Understand the impact. Act with confidence.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={startTour}
                leftIcon={<Compass className="w-4 h-4" />}
                className="shadow-glow-emerald"
              >
                Start Guided Demo
              </Button>

              <span className="text-xs text-text-muted">
                or explore operational risks below
              </span>
            </div>
          </div>
        </div>

        {/* Operations At a Glance: Clean 4-Stat Strip (Section 7) */}
        <div className="rounded-2xl bg-surface border border-border-subtle p-6 shadow-subtle">
          <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-4 font-semibold">
            Your Operations at a Glance
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-border-subtle/70">
            <div className="pt-3 sm:pt-0 sm:pr-6">
              <div className="text-3xl font-extrabold text-text-primary font-mono">
                {isLoading ? "..." : totalOrders}
              </div>
              <div className="text-xs text-text-muted mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Orders in System</span>
              </div>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-6">
              <div className="text-3xl font-extrabold text-amber-600 font-mono">
                {isLoading ? "..." : atRiskCount}
              </div>
              <div className="text-xs text-amber-700 font-medium mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Orders at Risk</span>
              </div>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-6">
              <div className="text-3xl font-extrabold text-purple-700 font-mono">
                {isLoading ? "..." : pendingApprovalsCount}
              </div>
              <div className="text-xs text-purple-700 font-medium mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Approval</span>
              </div>
            </div>

            <div className="pt-3 sm:pt-0 sm:pl-6">
              <div className="text-3xl font-extrabold text-emerald-700 font-mono">
                {isLoading ? "..." : activeBatchesCount}
              </div>
              <div className="text-xs text-text-muted mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Factory className="w-3.5 h-3.5" />
                <span>Active Batches</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Main Cards: Simulate Problem & Dominant Risk Card (Section 7 & 8) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Simulate Supplier Delay (Section 8) */}
          <div className="rounded-2xl bg-surface border border-border-subtle p-7 shadow-subtle flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  FLAGSHIP SCENARIO
                </span>
                <span className="text-xs text-text-muted font-mono">POST /api/v1/events/simulate-delay</span>
              </div>

              <h3 className="text-xl font-bold text-text-primary">
                Simulate Supplier Delay
              </h3>

              <p className="text-xs text-text-secondary leading-relaxed">
                See how SupplyPilot detects and connects the downstream effects of a supplier disruption across warehouse reserves, cleanroom freeze windows, and customer orders.
              </p>

              <div className="p-3 rounded-xl bg-surface-secondary text-xs font-mono text-text-muted space-y-1">
                <div className="flex justify-between">
                  <span>Delayed Material:</span>
                  <span className="font-bold text-text-primary">API-004 (Paracetamol)</span>
                </div>
                <div className="flex justify-between">
                  <span>Supplier:</span>
                  <span className="font-bold text-text-primary">BioSynth Europe (+5 days)</span>
                </div>
              </div>
            </div>

            <TourHighlightWrapper targetId="tour-btn-simulate">
              <Button
                variant="outline"
                size="lg"
                isLoading={isSimulating}
                onClick={handleSimulateDelay}
                leftIcon={<Play className="w-4 h-4 text-amber-600" />}
                className="w-full border-amber-300 text-amber-900 hover:bg-amber-50 font-bold text-sm shadow-subtle"
              >
                {isSimulating ? "Simulating supplier delay..." : "Simulate Supplier Delay"}
              </Button>
            </TourHighlightWrapper>
          </div>

          {/* Card 2: Dominant Active Supply Risk Card (Section 7) */}
          <div className="rounded-2xl bg-surface border border-rose-200 p-7 shadow-subtle flex flex-col justify-between space-y-5 bg-gradient-to-b from-white to-rose-50/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  <span className="text-xs font-mono uppercase tracking-wider text-rose-700 font-bold">
                    ACTIVE SUPPLY RISK
                  </span>
                </div>
                <Badge variant="red" className="font-mono text-xs">
                  Risk 72 · HIGH
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary">
                  ORD-1847
                </h3>
                <p className="text-xs text-text-secondary font-medium">
                  Medix Hospital Solutions · Contract Value: {formatCurrency(38500)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-xs font-mono space-y-1.5 shadow-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Primary Risk Driver:</span>
                  <span className="font-bold text-rose-700">Raw Material Deficit (API-004)</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Required Delivery:</span>
                  <span>October 20, 2026</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Stalled Cleanroom:</span>
                  <span>Batch BATCH-104 (Freeze Violated)</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                const prompt = encodeURIComponent("Can we fulfill Medix's order ORD-1847 by October 20?");
                router.push(`/agent?order=ORD-1847&prompt=${prompt}`);
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full text-sm font-bold shadow-glow-emerald"
            >
              Investigate with SupplyPilot
            </Button>
          </div>
        </div>
      </div>

      {/* First-Time User Experience Modal (Section 26) */}
      <Modal
        isOpen={welcomeModalOpen}
        onClose={handleDismissWelcome}
        title="Welcome to SupplyPilot"
        subtitle="Connected operational intelligence for pharmaceutical manufacturing"
        maxWidth="md"
      >
        <div className="space-y-5 text-center sm:text-left">
          <p className="text-sm text-text-secondary leading-relaxed">
            SupplyPilot connects the dots between supplier delays, warehouse reserves, cleanroom freeze windows, and customer orders.
          </p>

          <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle text-xs space-y-2 text-text-secondary">
            <div className="font-bold text-text-primary">The 6-Step Demonstration:</div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-left">
              <div>1. Simulate delay</div>
              <div>4. Review AI recommendation</div>
              <div>2. Trace impact cascade</div>
              <div>5. Authorize action</div>
              <div>3. Ask Copilot</div>
              <div>6. View activity trail</div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissWelcome}
              className="w-full sm:w-auto text-xs"
            >
              Explore Dashboard
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleStartGuidedFromWelcome}
              rightIcon={<Compass className="w-4 h-4" />}
              className="w-full sm:w-auto text-xs shadow-glow-emerald"
            >
              Start Guided Demo
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
