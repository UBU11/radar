import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "terminal" | "accent" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "terminal", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors select-none disabled:opacity-40 disabled:pointer-events-none rounded-sm border focus:outline-none";

    const variantStyles = {
      terminal: "bg-[#111111] text-neutral-200 border-white/10 hover:bg-[#1a1a1a] hover:border-white/20 active:bg-[#0c0c0c]",
      accent: "bg-[#00F0FF] text-black border-[#00F0FF] hover:bg-[#00D4E0] active:bg-[#00B4C0] font-semibold",
      ghost: "bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-white/5",
      destructive: "bg-red-950/40 text-red-400 border-red-500/30 hover:bg-red-900/40 active:bg-red-950",
    }[variant];

    const sizeStyles = {
      sm: "h-7 px-2.5 text-xs",
      md: "h-9 px-3.5 text-sm",
      lg: "h-11 px-5 text-base",
    }[size];

    return (
      <button ref={ref} className={cn(baseStyles, variantStyles, sizeStyles, className)} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
