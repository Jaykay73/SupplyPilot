import React from "react";
import { CheckCircle2, AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: "check" | "warning" | "inbox";
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const icons = {
    check: <CheckCircle2 className="w-10 h-10 text-emerald-600" />,
    warning: <AlertTriangle className="w-10 h-10 text-amber-600" />,
    inbox: <Inbox className="w-10 h-10 text-text-muted" />,
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-surface/50 border border-dashed border-border-subtle",
        className
      )}
    >
      <div className="p-3 rounded-full bg-surface-secondary border border-border-subtle mb-4">
        {icons[icon]}
      </div>
      <h3 className="text-base font-semibold text-text-primary tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-text-secondary max-w-md leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
