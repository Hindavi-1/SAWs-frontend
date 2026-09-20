import { cn } from "@/lib/utils";

export function RadialScore({
  value,
  size = 56,
  strokeWidth = 5,
  label,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color =
    value >= 80
      ? "var(--signal-positive-500)"
      : value >= 60
        ? "var(--signal-caution-500)"
        : "var(--signal-risk-500)";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-raised to-sunken/60 p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-border-subtle/60",
        className
      )}
      style={{ width: size + 4, height: size + 4 }}
    >
      <svg width={size} height={size} className="-rotate-90" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.04))" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id={`radial-grad-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#radial-grad-${value})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center inset-0 justify-center">
        <span
          className="font-mono font-bold leading-none text-text-primary"
          style={{ fontSize: size * 0.28 }}
        >
          {value}
        </span>
        {label && (
          <span className="mt-0.5 font-semibold text-text-tertiary" style={{ fontSize: size * 0.14 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
