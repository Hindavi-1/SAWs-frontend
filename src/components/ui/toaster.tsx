"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-raised group-[.toaster]:text-text-primary group-[.toaster]:border-border-default group-[.toaster]:shadow-lg group-[.toaster]:rounded-[var(--radius-md)]",
          description: "group-[.toast]:text-text-tertiary",
          actionButton:
            "group-[.toast]:bg-accent-500 group-[.toast]:text-white font-semibold",
          cancelButton:
            "group-[.toast]:bg-sunken group-[.toast]:text-text-secondary",
        },
      }}
    />
  );
}

export { toast } from "sonner";
