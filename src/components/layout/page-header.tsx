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
        "mb-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border-subtle",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-border-default bg-sunken px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
            <span className="h-1 w-1 rounded-full bg-accent-500" />
            {eyebrow}
          </p>
        )}
        <h1 className="text-lg font-bold tracking-tight text-text-primary sm:text-xl">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-xs text-text-secondary max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
