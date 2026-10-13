import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "accent" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-white/5 text-neutral-300 border-white/10",
    success: "bg-emerald-950/40 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-950/40 text-amber-400 border-amber-500/20",
    accent: "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30",
    outline: "bg-transparent text-neutral-400 border-white/10",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 text-xs font-mono rounded-sm border uppercase tracking-wider",
        variantStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
