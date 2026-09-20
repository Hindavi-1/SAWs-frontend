import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const MODULE_CONFIG = [
  { id: "m01", label: "ICP Management", icon: "🎯", color: "violet", endpoint: "/api/icp/parse", method: "POST", description: "Parse raw ICP description into structured Canonical ICP." },
  { id: "m02", label: "Account Discovery", icon: "🔍", color: "blue", endpoint: "/api/discovery/run", method: "POST", description: "Discover candidate accounts matching an ICP using AI web search." },
  { id: "m03", label: "Verification", icon: "✅", color: "cyan", endpoint: "/api/verification/run", method: "POST", description: "Fact-check candidate accounts against live web data." },
  { id: "m04", label: "Fit Evaluation", icon: "📊", color: "emerald", endpoint: "/api/fit/evaluate", method: "POST", description: "Evaluate and score each account's ICP fit across dimensions." },
  { id: "m05", label: "Buyer Identification", icon: "👤", color: "amber", endpoint: "/api/buyers/identify", method: "POST", description: "Find key decision makers and enrich with contact intelligence." },
];

const COLOR_MAP: Record<string, { badge: string; border: string; bg: string; text: string }> = {
  violet: { badge: "bg-violet-500/20 text-violet-400 border-violet-500/30", border: "border-violet-500/20", bg: "from-violet-950/30 to-slate-900/80", text: "text-violet-400" },
  blue:   { badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",     border: "border-blue-500/20",   bg: "from-blue-950/30 to-slate-900/80",   text: "text-blue-400" },
  cyan:   { badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",     border: "border-cyan-500/20",   bg: "from-cyan-950/30 to-slate-900/80",   text: "text-cyan-400" },
  emerald:{ badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", border: "border-emerald-500/20", bg: "from-emerald-950/30 to-slate-900/80", text: "text-emerald-400" },
  amber:  { badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", border: "border-amber-500/20",  bg: "from-amber-950/30 to-slate-900/80",  text: "text-amber-400" },
};

// Check health on the backend
async function getApiHealth() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/health", { cache: "no-store" });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
}

export default async function TracerPage() {
  const health = await getApiHealth();
  const isOnline = !!health;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-400">
            <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            Backend API {isOnline ? "Online" : "Offline"} · http://127.0.0.1:8000
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">Module Tracer</h1>
          <p className="mt-1 text-sm text-slate-400">
            Inspect each AI module's API endpoints, inputs, outputs, and documentation.
            Run the live pipeline from the{" "}
            <Link href="/discovery" className="text-violet-400 underline underline-offset-2 hover:text-violet-300">
              Discovery page
            </Link>.
          </p>
        </div>

        {/* Status banner */}
        {!isOnline && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-400">Backend API is offline</p>
              <p className="mt-1 text-xs text-red-300/70">
                Start the FastAPI server from the <code className="rounded bg-black/20 px-1 py-0.5">backend</code> directory:
              </p>
              <pre className="mt-2 rounded-lg border border-red-500/20 bg-black/30 p-3 text-[11px] text-slate-300">
                venv\Scripts\activate
                uvicorn api.main:app --reload
              </pre>
            </div>
          </div>
        )}

        {/* Module cards grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {MODULE_CONFIG.map((mod, idx) => {
            const colors = COLOR_MAP[mod.color];
            return (
              <div
                key={mod.id}
                className={`relative overflow-hidden rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-5 transition-all hover:scale-[1.02] hover:shadow-2xl`}
              >
                {/* Step number watermark */}
                <div className="absolute right-4 top-4 font-mono text-5xl font-black opacity-5 text-white select-none">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                {/* Icon + badge */}
                <div className="mb-4 flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colors.border} bg-black/20 text-2xl`}>
                    {mod.icon}
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${colors.badge}`}>
                    {mod.id.toUpperCase()}
                  </span>
                </div>

                {/* Name + description */}
                <h3 className="text-base font-bold text-white">{mod.label}</h3>
                <p className="mt-1 text-[12px] text-slate-400 leading-relaxed">{mod.description}</p>

                {/* Endpoint info */}
                <div className="mt-4 rounded-lg border border-white/5 bg-black/30 p-3">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${colors.badge}`}>
                      {mod.method}
                    </span>
                    <code className="font-mono text-[11px] text-slate-400">{mod.endpoint}</code>
                  </div>
                </div>

                {/* Status indicator */}
                {isOnline && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Ready
                  </div>
                )}
              </div>
            );
          })}

          {/* Swagger docs card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/80 p-5 transition-all hover:scale-[1.02] hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-black/20 text-2xl">
              📚
            </div>
            <h3 className="text-base font-bold text-white">Interactive API Docs</h3>
            <p className="mt-1 text-[12px] text-slate-400">Explore all endpoints, schemas, and test requests in real-time using the FastAPI Swagger UI.</p>
            <div className="mt-4">
              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-700"
              >
                Open Swagger UI →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
