# SAWFs — Sales Intelligence Workspace

A Next.js (App Router + TypeScript + Tailwind v4) frontend for the SAWFs
(Sales Agentic Workflows) platform: one unified sales intelligence workspace
built on top of 12 specialized backend modules/agents.

This is a **frontend-only** build with a realistic mock data layer. It is
structured so that wiring it to your real backend is a matter of editing one
file (`src/lib/api.ts`) — no component needs to change.

---

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. Toggle light/dark/system theme from the top-right
of the app.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

> Note: the build fetches **Manrope** and **IBM Plex Mono** from Google Fonts
> at build time via `next/font/google`. If you're building in an environment
> without internet access, swap the imports in `src/app/layout.tsx` for
> `next/font/local` with self-hosted font files, or a system font stack.

---

## Project structure

```
src/
  app/                        Routes (Next.js App Router)
    page.tsx                  Dashboard
    discovery/page.tsx        Account Discovery (ICP select -> run -> results)
    accounts/page.tsx         Accounts workspace (table + kanban)
    accounts/[id]/page.tsx    Account Detail (identity panel + 8 tabs)
    actions/page.tsx          Cross-account approval / next-best-action queue
    engagement/page.tsx       Outreach + objections across accounts
    module-ops/page.tsx       Secondary tracking view for all 12 modules
    compliance/page.tsx       Compliance & Quality (cross-cutting)
    crm-sync/page.tsx         CRM Integration status (cross-cutting)
    intelligence/page.tsx     Sales Intelligence analytics (cross-cutting)
    icp-outcomes/page.tsx     Customer Outcomes & ICP Optimization
    layout.tsx, globals.css   Root layout, fonts, design tokens

  components/
    ui/                       Generic primitives: Button, Badge, Card, Tabs,
                               Drawer, Stepper, RadialScore, EmptyState
    layout/                   Sidebar, Topbar, AppShell, PageHeader
    features/                 Domain components: FunnelBar, AccountCard,
                               AccountTable, AgentActivityFeed, ApprovalCard,
                               EvidenceList, MetricCard, ModuleStatusCard
    theme/                    ThemeProvider (next-themes), ThemeToggle

  lib/
    types.ts                  Domain model - the contract for the whole app
    mock-data.ts               Fixture data matching types.ts
    api.ts                     Data adapter - ALL components import from here
    stage-meta.ts              Shared color/label metadata for stages & signals
    utils.ts                   cn(), date/number formatting helpers
```

---

## How the pieces map to your 12 backend modules

The UI intentionally does **not** have 12 separate module pages. Modules are
represented three ways:

1. **As data, everywhere** - every record (`Account`, `EvidenceItem`,
   `AgentTask`, `ApprovalItem`, ...) carries a `moduleId` field
   (see `ModuleId` in `types.ts`), so any list or feed can show which module
   produced it without needing a dedicated page per module.
2. **As tabs on the Account Detail page** - Research, Buyers, Qualification,
   Outreach & Engagement, Activity/Agent Trace, and Next Best Action are all
   lenses on one account, backed by different modules.
3. **As a secondary Module Ops view** (`/module-ops`) - for RevOps/platform
   owners who need to see throughput, dependencies, and error rates per
   module. This is deliberately visually distinct (denser, more table-like)
   from the account-centric main experience.

Cross-cutting modules (Compliance & Quality, CRM Integration, Sales
Intelligence, Objection Handling, Customer Outcomes & ICP Optimization) are
not funnel stages - see their placement in `/compliance`, `/crm-sync`,
`/intelligence`, `/icp-outcomes`, and inline within the Account Detail
"Outreach & Engagement" tab (objections) respectively.

---

## Wiring up your real backend

Everything the UI reads goes through `src/lib/api.ts`. Every function there
currently does this:

```ts
export async function getAccounts(): Promise<Account[]> {
  return latency(mock.accounts);
}
```

To connect a real backend, replace the body with a fetch call that returns
data shaped like the types in `types.ts`:

```ts
export async function getAccounts(): Promise<Account[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}
```

No component imports `mock-data.ts` directly for its primary data, so this
swap is fully localized to `api.ts`. If your backend's JSON shape differs
from `types.ts`, map it inside the relevant `api.ts` function rather than
changing the type - that keeps every component's contract stable.

A couple of pages (Discovery's evidence drawer, Engagement's grouped lists)
currently reach into `mock-data.ts` directly for small side-lookups that
don't yet have a page wired to an `api.ts` getter - grep for
`from "@/lib/mock-data"` if you want to route 100% of reads through `api.ts`
as you build out real endpoints.

### Suggested real endpoints (mirrors `api.ts` 1:1)

| Function | Suggested endpoint |
|---|---|
| `getDashboardMetrics` | `GET /dashboard/metrics` |
| `getAccounts` / `getAccount(id)` | `GET /accounts`, `GET /accounts/:id` |
| `getIcps` | `GET /icps` |
| `getEvidenceForAccount` | `GET /accounts/:id/evidence` |
| `getIcpFitForAccount` | `GET /accounts/:id/icp-fit` |
| `getBuyersForAccount` | `GET /accounts/:id/buyers` |
| `getQualificationForAccount` | `GET /accounts/:id/qualification` |
| `getOutreachForAccount` | `GET /accounts/:id/outreach` |
| `getObjectionsForAccount` | `GET /accounts/:id/objections` |
| `getAgentTasks` / `getAgentTasksForAccount` | `GET /agent-tasks`, `GET /accounts/:id/agent-tasks` |
| `getApprovalQueue` | `GET /approvals` |
| `getModuleStatuses` | `GET /modules/status` |
| `getComplianceFlags` | `GET /compliance/flags` |
| `getCrmSyncStatus` | `GET /crm/status` |
| `getOutcomeRecords` | `GET /outcomes` |

For mutations (approve/reject an item, start a discovery run, advance a
stage), add new functions to `api.ts` following the same pattern - e.g.
`approveItem(id: string)` - and call them from the `onClick` handlers already
stubbed in `ApprovalCard` and the Discovery page's "Start Discovery Run"
button.

---

## Design system

- **Theme**: light/dark via `next-themes`, class-based (`.dark` on `<html>`),
  toggle in the top bar (light / dark / system).
- **Tokens**: defined in `src/app/globals.css` as CSS variables, exposed to
  Tailwind via `@theme inline` (Tailwind v4). Change a variable once - every
  component using `bg-canvas`, `text-primary`, `border-subtle`,
  `bg-positive-50`, etc. updates automatically in both themes.
- **Semantic colors** are consistent everywhere: green = verified/positive,
  amber = caution/nurture, red = risk/error/compliance hold, indigo = the
  one brand/action accent. See `src/lib/stage-meta.ts`.
- **Type**: Manrope (UI text) + IBM Plex Mono (scores, timestamps, counts -
  anywhere a number needs to align and read as data rather than prose).

---

## Extending it

- New page: add a folder under `src/app/`, use `PageHeader` + `Card` from
  `components/ui` and `components/layout` to stay visually consistent.
- New data type: add it to `types.ts`, add fixtures to `mock-data.ts`, add a
  getter to `api.ts`, then build a `components/features/*` component to
  render it - this is the same three-step pattern every existing feature
  follows.
