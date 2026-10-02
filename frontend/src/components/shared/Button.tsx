import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "purple" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-45 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    const variantStyles = {
      primary:
        "bg-emerald-600 text-white font-semibold hover:bg-emerald-500 hover:shadow-glow-emerald border border-emerald-600",
      secondary:
        "bg-surface text-text-primary hover:bg-surface-secondary border border-border-subtle hover:border-slate-300 shadow-subtle",
      purple:
        "bg-purple-600 text-white font-medium hover:bg-purple-500 hover:shadow-glow-purple border border-purple-600",
      danger:
        "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200",
      ghost:
        "text-text-secondary hover:text-text-primary hover:bg-surface-secondary",
      outline:
        "border border-border-subtle bg-surface text-text-primary hover:bg-surface-secondary shadow-subtle",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
