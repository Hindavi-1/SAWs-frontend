import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-fade-in-up",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className="relative hidden shrink-0 sm:flex">
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-accent-500/30 via-violet-500/20 to-cyan-500/20 blur-lg opacity-80 animate-pulse-glow" />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 via-violet-500 to-cyan-500 text-white shadow-[0_6px_16px_-3px_rgba(74,95,220,0.5)] ring-1 ring-white/30">
            <svg
              className="h-5 w-5 drop-shadow-sm"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 22V12h6v10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div>
          {eyebrow && (
            <p className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-accent-500/20 bg-accent-50/60 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent-600 dark:bg-accent-500/10 dark:text-accent-400">
              <span className="h-1 w-1 rounded-full bg-accent-500 animate-pulse" />
              {eyebrow}
            </p>
          )}
          <h1 className="text-xl font-extrabold tracking-tight text-text-primary sm:text-[26px] sm:leading-[1.15]">
            <span className="bg-[linear-gradient(120deg,var(--text-primary),var(--accent-500)_45%,var(--ramp-6))] bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-secondary">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 animate-fade-in-up stagger-1">
          {actions}
        </div>
      )}
    </div>
  );
}
