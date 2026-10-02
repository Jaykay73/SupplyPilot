import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: "default" | "critical" | "warning" | "success" | "purple";
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  variant = "default",
  className,
  onClick,
}: MetricCardProps) {
  const borderStyles = {
    default: "border-border-subtle hover:border-slate-300 shadow-subtle",
    critical: "border-rose-200 hover:border-rose-300 bg-rose-50/60 shadow-subtle",
    warning: "border-amber-200 hover:border-amber-300 bg-amber-50/60 shadow-subtle",
    success: "border-emerald-200 hover:border-emerald-300 bg-emerald-50/60 shadow-subtle",
    purple: "border-purple-200 hover:border-purple-300 bg-purple-50/60 shadow-subtle",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-5 rounded-xl bg-surface border transition-all duration-200 group",
        borderStyles[variant],
        onClick && "cursor-pointer hover:bg-surface-secondary active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {badge}
          {icon && <span className="text-text-muted group-hover:text-text-secondary transition-colors">{icon}</span>}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-tight text-text-primary font-mono">
          {value}
        </div>
      </div>
      {subtitle && (
        <p className="mt-1.5 text-xs text-text-muted leading-relaxed line-clamp-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
