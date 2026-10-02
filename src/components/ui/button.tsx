import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] text-xs font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-500 text-accent-contrast shadow-[var(--shadow-xs)] hover:bg-accent-600 active:bg-accent-700",
        secondary:
          "bg-raised border border-border-default text-text-primary shadow-[var(--shadow-xs)] hover:bg-sunken hover:border-border-strong",
        ghost:
          "text-text-secondary hover:bg-sunken hover:text-text-primary",
        danger:
          "bg-risk-500 text-white shadow-[var(--shadow-xs)] hover:bg-risk-600",
        success:
          "bg-positive-500 text-white shadow-[var(--shadow-xs)] hover:bg-positive-600",
        outline:
          "bg-transparent border border-border-default text-text-primary shadow-[var(--shadow-xs)] hover:bg-sunken hover:border-border-strong",
        agent:
          "bg-[var(--agent-core)] text-white shadow-[0_2px_8px_-2px_var(--agent-glow)] hover:opacity-95 border border-[var(--agent-border)]",
      },
      size: {
        xs: "h-6 px-2 text-[11px]",
        sm: "h-8 px-2.5 text-xs",
        md: "h-9 px-3.5 text-xs",
        lg: "h-10 px-4 text-sm",
        icon: "h-8 w-8",
        "icon-sm": "h-7 w-7",
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
      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

