"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Play, GitFork, ArrowRight, AlertOctagon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { toast } from "sonner";

export function DisruptionSimulatorCard() {
  const router = useRouter();
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const report = await api.events.simulateDelay();
      toast.warning("Supplier Delay Disruption Activated", {
        description: `BioSynth Corp delayed API-004 by 5 days. Impacting Batch BATCH-104 and Order ORD-1847.`,
      });
      router.push("/cascade");
    } catch (err: any) {
      toast.error("Failed to run delay simulation", {
        description: err.message,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border-subtle shadow-subtle relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-700">
              DISRUPTION CASCADE ENGINE
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
            DELAY-2026-001
          </span>
        </div>

        <h4 className="text-base font-bold text-text-primary mb-1.5">
          Simulate Flagship Upstream Disruption
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          Inject a 5-day transit delay on API-004 from BioSynth Europe. Watch the
          shockwave propagate through warehouse lot reservations, cleanroom line
          freezes, and customer delivery commitments.
        </p>

        <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle text-[11px] font-mono space-y-1 mb-5">
          <div className="flex justify-between text-text-muted">
            <span>Delayed Material:</span>
            <span className="text-text-primary font-bold">API-004 (Paracetamol)</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>Affected Line:</span>
            <span className="text-text-primary font-bold">Cleanroom 1 (BATCH-104)</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>Threatened Order:</span>
            <span className="text-amber-700 font-bold">ORD-1847 (Medix Logistics)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          isLoading={isSimulating}
          onClick={handleSimulate}
          leftIcon={<Play className="w-3.5 h-3.5 text-amber-600" />}
          className="border-amber-300 text-amber-800 hover:bg-amber-50 flex-1 text-xs"
        >
          Inject Disruption
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push("/cascade")}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          View Cascade
        </Button>
      </div>
    </div>
  );
}
