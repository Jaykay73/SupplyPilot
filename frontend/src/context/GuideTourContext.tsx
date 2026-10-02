"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type TourStepId =
  | "dashboard-simulate"     // Step 1: Click "Simulate Supplier Delay"
  | "cascade-investigate"    // Step 2: Click "Investigate with Copilot"
  | "copilot-ask"            // Step 3: Click "Ask SupplyPilot"
  | "copilot-recommendation" // Step 4: Click "Review & Authorize Action"
  | "approval-authorize"     // Step 5: Click "Authorize Action"
  | "activity-complete";     // Step 6: View Activity & Complete

export interface TourStepConfig {
  stepNumber: number;
  totalSteps: number;
  id: TourStepId;
  route: string;
  title: string;
  instruction: string;
  actionHint: string;
  targetId: string; // data-tour-id or id on the element
}

export const TOUR_STEPS: Record<TourStepId, TourStepConfig> = {
  "dashboard-simulate": {
    stepNumber: 1,
    totalSteps: 6,
    id: "dashboard-simulate",
    route: "/dashboard",
    title: "Simulate a Supplier Delay",
    instruction: "See how SupplyPilot detects and connects the downstream effects of a supplier disruption.",
    actionHint: "Click \"Simulate Supplier Delay\"",
    targetId: "tour-btn-simulate",
  },
  "cascade-investigate": {
    stepNumber: 2,
    totalSteps: 6,
    id: "cascade-investigate",
    route: "/cascade",
    title: "See the Disruption Cascade",
    instruction: "SupplyPilot tracked the 5-day delay from warehouse reserves to Cleanroom 1 and customer order ORD-1847.",
    actionHint: "Click \"Investigate with Copilot\"",
    targetId: "tour-btn-investigate",
  },
  "copilot-ask": {
    stepNumber: 3,
    totalSteps: 6,
    id: "copilot-ask",
    route: "/agent",
    title: "Ask SupplyPilot to Investigate",
    instruction: "The flagship operational inquiry is pre-filled. Ask the AI agent to verify stock, production, and alternative vendors.",
    actionHint: "Click \"Ask SupplyPilot\"",
    targetId: "tour-btn-ask",
  },
  "copilot-recommendation": {
    stepNumber: 4,
    totalSteps: 6,
    id: "copilot-recommendation",
    route: "/agent",
    title: "Review the Recommendation",
    instruction: "SupplyPilot identified a 700 kg deficit and proposed a compliant purchase from a qualified alternative supplier.",
    actionHint: "Click \"Review & Authorize Action\"",
    targetId: "tour-btn-review-action",
  },
  "approval-authorize": {
    stepNumber: 5,
    totalSteps: 6,
    id: "approval-authorize",
    route: "/approvals",
    title: "Authorize the Procurement",
    instruction: "This action requires human approval. You are logged in with authority to sign off on this requisition.",
    actionHint: "Click \"Authorize Action\"",
    targetId: "tour-btn-authorize",
  },
  "activity-complete": {
    stepNumber: 6,
    totalSteps: 6,
    id: "activity-complete",
    route: "/audit",
    title: "View the Activity Trail",
    instruction: "The full operational loop is complete: from disruption detection to AI investigation, human sign-off, and audit trail.",
    actionHint: "Click \"Complete Guided Demo\"",
    targetId: "tour-btn-complete",
  },
};

interface GuideTourContextType {
  isActive: boolean;
  currentStep: TourStepId | null;
  stepConfig: TourStepConfig | null;
  startTour: () => void;
  advanceTo: (step: TourStepId) => void;
  endTour: () => void;
  isStep: (step: TourStepId) => boolean;
}

const GuideTourContext = createContext<GuideTourContextType | null>(null);

export function GuideTourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<TourStepId | null>(null);

  // Initialize from session / URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("supplypilot_tour_active");
      const savedStep = sessionStorage.getItem("supplypilot_tour_step") as TourStepId | null;
      if (saved === "true" && savedStep && TOUR_STEPS[savedStep]) {
        setIsActive(true);
        setCurrentStep(savedStep);
      }
    }
  }, []);

  const startTour = () => {
    setIsActive(true);
    setCurrentStep("dashboard-simulate");
    if (typeof window !== "undefined") {
      sessionStorage.setItem("supplypilot_tour_active", "true");
      sessionStorage.setItem("supplypilot_tour_step", "dashboard-simulate");
      localStorage.setItem("supplypilot_tour_dismissed", "true");
    }
    router.push("/dashboard");
  };

  const advanceTo = (step: TourStepId) => {
    if (!isActive) return;
    setCurrentStep(step);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("supplypilot_tour_step", step);
    }
    const targetRoute = TOUR_STEPS[step]?.route;
    if (targetRoute && pathname !== targetRoute) {
      router.push(targetRoute);
    }
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("supplypilot_tour_active");
      sessionStorage.removeItem("supplypilot_tour_step");
      localStorage.setItem("supplypilot_tour_dismissed", "true");
    }
  };

  const isStep = (step: TourStepId) => {
    return isActive && currentStep === step;
  };

  const stepConfig = currentStep ? TOUR_STEPS[currentStep] || null : null;

  return (
    <GuideTourContext.Provider
      value={{
        isActive,
        currentStep,
        stepConfig,
        startTour,
        advanceTo,
        endTour,
        isStep,
      }}
    >
      {children}
    </GuideTourContext.Provider>
  );
}

export function useGuideTour() {
  const context = useContext(GuideTourContext);
  if (!context) {
    throw new Error("useGuideTour must be used within a GuideTourProvider");
  }
  return context;
}
