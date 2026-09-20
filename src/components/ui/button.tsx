import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-accent-500 to-accent-600 text-accent-contrast shadow-[0_4px_14px_-2px_rgba(74,95,220,0.55)] hover:from-accent-400 hover:to-accent-500 hover:shadow-[0_6px_18px_-2px_rgba(74,95,220,0.65)] hover:-translate-y-0.5",
        secondary:
          "bg-raised border border-border-default text-text-primary hover:bg-sunken hover:border-border-strong hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5",
        ghost:
          "text-text-secondary hover:bg-sunken hover:text-text-primary",
        danger:
          "bg-gradient-to-b from-risk-500 to-risk-600 text-white shadow-[0_4px_14px_-2px_rgba(201,58,58,0.55)] hover:from-risk-400 hover:to-risk-500 hover:shadow-[0_6px_18px_-2px_rgba(201,58,58,0.65)] hover:-translate-y-0.5",
        success:
          "bg-gradient-to-b from-positive-500 to-positive-600 text-white shadow-[0_4px_14px_-2px_rgba(20,160,108,0.55)] hover:from-positive-400 hover:to-positive-500 hover:shadow-[0_6px_18px_-2px_rgba(20,160,108,0.65)] hover:-translate-y-0.5",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-[13px]",
        lg: "h-11 px-5 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
