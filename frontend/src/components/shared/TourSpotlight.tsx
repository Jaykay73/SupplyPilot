"use client";

import React from "react";
import { useGuideTour } from "@/context/GuideTourContext";
import { Sparkles, ArrowRight, X, Compass, ChevronRight } from "lucide-react";

export function TourSpotlight() {
  const { isActive, stepConfig, endTour } = useGuideTour();

  if (!isActive || !stepConfig) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
      <div className="rounded-2xl bg-white border-2 border-purple-500 shadow-2xl p-5 text-text-primary relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-purple-500 to-indigo-500" />

        {/* Header */}
        <div className="flex items-center justify-between mb-2.5 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold font-mono text-[11px]">
              {stepConfig.stepNumber}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-purple-700">
              STEP {stepConfig.stepNumber} OF {stepConfig.totalSteps}
            </span>
          </div>

          <button
            onClick={endTour}
            className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
            title="Exit Guided Demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-text-primary mb-1">
          {stepConfig.title}
        </h4>

        {/* Instruction */}
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          {stepConfig.instruction}
        </p>

        {/* Action Hint Callout */}
        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-purple-800 font-semibold truncate">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping flex-shrink-0" />
            <span className="truncate">{stepConfig.actionHint}</span>
          </div>
          <span className="text-[10px] text-purple-600 font-mono font-medium flex-shrink-0">
            Click highlighted button
          </span>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border-subtle text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className={`h-1.5 rounded-full transition-all ${
                  num === stepConfig.stepNumber
                    ? "w-5 bg-purple-600"
                    : num < stepConfig.stepNumber
                    ? "w-2 bg-emerald-500"
                    : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>

          <button
            onClick={endTour}
            className="hover:text-text-primary text-[10px] font-mono uppercase transition-colors"
          >
            Exit Demo
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Visual pulse callout badge that wraps a target element during the tour
 */
export function TourHighlightWrapper({
  targetId,
  children,
  className = "",
}: {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { isActive, stepConfig } = useGuideTour();
  const isTargeted = isActive && stepConfig?.targetId === targetId;

  return (
    <div className={`relative ${className}`}>
      {children}
      {isTargeted && (
        <div className="absolute -inset-1 rounded-2xl border-2 border-purple-500 ring-4 ring-purple-500/20 pointer-events-none animate-pulse z-30" />
      )}
    </div>
  );
}
