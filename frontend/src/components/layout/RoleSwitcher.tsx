"use client";

import React from "react";
import { useAuth, DEMO_PERSONAS } from "@/context/AuthContext";
import { ShieldCheck, UserCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RoleSwitcherProps {
  compact?: boolean;
}

export function RoleSwitcher({ compact = false }: RoleSwitcherProps) {
  const { user, loginAs, isLoading } = useAuth();
  const currentRole = user?.roles?.[0] || "procurement_officer";

  const handleSelectRole = async (key: keyof typeof DEMO_PERSONAS) => {
    if (isLoading || key === currentRole) return;
    await loginAs(key);
    const p = DEMO_PERSONAS[key];
    toast.success(`Switched role to ${p.title}`, {
      description: `Active as ${p.name} (${p.department}) · ${p.thresholdLimit}`,
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-surface-secondary/80 p-1 rounded-lg border border-border-subtle">
        {Object.entries(DEMO_PERSONAS).map(([key, persona]) => {
          const isActive = key === currentRole;
          return (
            <button
              key={key}
              onClick={() => handleSelectRole(key)}
              title={`${persona.title} (${persona.thresholdLimit})`}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                isActive
                  ? "bg-surface text-text-primary shadow-subtle border border-border font-semibold"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-tertiary"
              )}
            >
              {persona.title.split(" ")[0]}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent-purple" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Role Switcher (RBAC)
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
          Demo
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {Object.entries(DEMO_PERSONAS).map(([key, persona]) => {
          const isActive = key === currentRole;
          return (
            <button
              key={key}
              onClick={() => handleSelectRole(key)}
              className={cn(
                "flex flex-col items-start p-2 rounded-lg text-left transition-all border",
                isActive
                  ? "bg-purple-50 border-purple-300 text-text-primary shadow-subtle"
                  : "bg-surface border-border-subtle text-text-muted hover:text-text-secondary hover:bg-surface hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-medium text-text-primary truncate">
                  {persona.title}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
                )}
              </div>
              <span className="text-[10px] text-text-muted truncate mt-0.5">
                {persona.thresholdLimit}
              </span>
            </button>
          );
        })}
      </div>

      {user && (
        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
          <span className="truncate">Active: <span className="text-text-primary font-medium">{user.full_name}</span></span>
          <span className="text-[10px] font-mono text-emerald-600 font-semibold">Authenticated</span>
        </div>
      )}
    </div>
  );
}
