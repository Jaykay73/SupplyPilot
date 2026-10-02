import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "purple" | "amber" | "red" | "cyan" | "slate" | "outline";
  beacon?: boolean;
}

export function Badge({
  className,
  variant = "slate",
  beacon = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
    purple: "bg-purple-50 text-purple-700 border-purple-200 font-semibold",
    amber: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
    red: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200 font-semibold",
    slate: "bg-surface-secondary text-text-secondary border-border-subtle",
    outline: "border-border-subtle text-text-secondary bg-transparent",
  };

  const beaconColors = {
    emerald: "bg-emerald-500",
    purple: "bg-purple-600",
    amber: "bg-amber-500",
    red: "bg-rose-500",
    cyan: "bg-cyan-500",
    slate: "bg-slate-500",
    outline: "bg-slate-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {beacon && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              beaconColors[variant]
            )}
          />
          <span
            className={cn("relative inline-flex rounded-full h-1.5 w-1.5", beaconColors[variant])}
          />
        </span>
      )}
      {children}
    </span>
  );
}
