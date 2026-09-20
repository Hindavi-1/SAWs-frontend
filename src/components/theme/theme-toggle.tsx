"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex items-center gap-0.5 rounded-2xl border border-border-default bg-sunken/80 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = mounted && theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            title={opt.label}
            aria-label={opt.label}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              active
                ? "bg-raised text-accent-500 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-border-subtle"
                : "text-text-tertiary hover:text-text-secondary hover:bg-raised/60"
            )}
          >
            <Icon className={cn("h-4 w-4 transition-transform duration-300", active && "scale-110")} />
            {active && (
              <span className="pointer-events-none absolute inset-x-1.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-accent-500 to-violet-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
