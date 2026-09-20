import { cn } from "@/lib/utils";
import * as React from "react";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "group relative rounded-[var(--radius-lg)] border border-border-subtle bg-raised shadow-[var(--shadow-sm)] transition-all duration-300",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[var(--radius-lg)] before:opacity-0 before:transition-opacity before:duration-300",
        "before:bg-[linear-gradient(135deg,rgba(74,95,220,0.14),rgba(14,127,157,0.10)_40%,rgba(20,160,108,0.08)_70%,transparent)]",
        "hover:before:opacity-100",
        "hover:-translate-y-0.5 hover:border-accent-500/20 hover:shadow-[var(--shadow-md)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4.5",
        "after:pointer-events-none after:absolute after:left-5 after:right-5 after:bottom-0 after:h-px after:opacity-0 after:transition-opacity after:duration-300",
        "after:bg-[linear-gradient(90deg,transparent,rgba(74,95,220,0.4)_30%,rgba(14,127,157,0.35)_60%,transparent)]",
        "group-hover:after:opacity-100",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[15px] font-bold tracking-tight text-text-primary transition-colors duration-200 group-hover:text-text-inherit",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-0.5 text-xs font-medium text-text-tertiary", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative px-5 py-4.5", className)} {...props} />;
}
