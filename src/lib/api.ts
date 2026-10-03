/**
 * Data adapter layer.
 *
 * Every function here is `async` on purpose, even though the mock
 * implementation is synchronous — this is the seam where real backend
 * calls get wired in later (e.g. `fetch("/api/accounts")`) without
 * changing a single component. Components only ever import from this
 * file, never from `mock-data.ts` directly.
 */
import * as mock from "./mock-data";
import type {
  Account,
  AgentTask,
  ApprovalItem,
  Buyer,
  ComplianceFlag,
  CrmSyncStatus,
  DashboardMetrics,
  EvidenceItem,
  IcpCriterionScore,
  IcpDefinition,
  ModuleStatus,
  Objection,
  OutcomeRecord,
  OutreachMessage,
  PipelineRunRequest,
  PipelineTraceResponse,
  QualificationCriterion,
  Product,
  Company,
  ICPRecord,
  CreateProductInput,
  GenerateICPInput,
  SaveICPInput,
} from "./types";

const latency = <T,>(value: T, ms = 0): Promise<T> =>
  ms > 0 ? new Promise((resolve) => setTimeout(() => resolve(value), ms)) : Promise.resolve(value);

export async function getDashboardMetrics(productId?: string): Promise<DashboardMetrics> {
  try {
    if (!productId) {
      const prods = await getProducts();
      productId = prods.activeProductId || undefined;
    }
    const url = productId
      ? `/api/metrics/dashboard?product_id=${productId}`
      : `/api/metrics/dashboard`;
    const res = await apiFetch(url, { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      return {
        totalAccounts: d.total_accounts ?? 0,
        activeDiscoveryRuns: d.active_discovery_runs ?? 0,
        qualifiedThisWeek: d.qualified_this_week ?? 0,
        avgTimeInStageDays: d.avg_time_in_stage_days ?? 0,
        agentSuccessRate: d.agent_success_rate ?? 0,
        pendingOutreachDrafts: d.pending_outreach_drafts ?? 0,
        buyersIdentified: d.buyers_identified ?? 0,
        avgFitScore: d.avg_fit_score ?? 0,
        funnel: (d.funnel ?? []).map((f: any) => ({
          stage: f.stage,
          count: f.count,
          deltaThisWeek: f.delta_this_week ?? 0,
        })),
      };
    }
  } catch {
    // Fallback: compute locally
  }
  const accounts = await getAccounts(productId);
  const totalAccounts = accounts.length;
  const qualifiedThisWeek = accounts.filter((a) => a.stage === "qualified").length;
  const totalDays = accounts.reduce((acc, curr) => acc + (curr.daysInStage || 0), 0);
  const avgTimeInStageDays = totalAccounts ? Math.round(totalDays / totalAccounts) : 0;
  const agentSuccessRate = totalAccounts ? 100 : 0;
  const stages = { discovered: 0, researched: 0, buyer_identified: 0, outreach_ready: 0, qualified: 0 };
  accounts.forEach((a) => { if (a.stage in stages) stages[a.stage as keyof typeof stages]++; });
  return {
    totalAccounts,
    activeDiscoveryRuns: 0,
    qualifiedThisWeek,
    avgTimeInStageDays,
    agentSuccessRate,
    pendingOutreachDrafts: 0,
    buyersIdentified: 0,
    avgFitScore: totalAccounts ? Math.round(accounts.reduce((s, a) => s + a.fitScore, 0) / totalAccounts) : 0,
    funnel: [
      { stage: "discovered", count: stages.discovered, deltaThisWeek: 0 },
      { stage: "researched", count: stages.researched, deltaThisWeek: 0 },
      { stage: "buyer_identified", count: stages.buyer_identified, deltaThisWeek: 0 },
      { stage: "outreach_ready", count: stages.outreach_ready, deltaThisWeek: 0 },
      { stage: "qualified", count: stages.qualified, deltaThisWeek: 0 },
    ],
  };
}

export async function getAccounts(productId?: string): Promise<Account[]> {
  try {
    if (!productId) {
      const prods = await getProducts();
      productId = prods.activeProductId || undefined;
    }
    const url = productId ? `/api/discovery/accounts?product_id=${productId}` : "/api/discovery/accounts";
    const res = await apiFetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.accounts)) {
        return data.accounts.map((a: any) => {
          const score = typeof a.fit_score === "number" ? a.fit_score : 0;
          const confidence =
            score >= 80 ? "high" : score >= 60 ? "medium" : "low";
          const stageMap: Record<string, Account["stage"]> = {
            verified: "verified",
            discovered: "discovered",
            rejected: "discovered",
            researched: "researched",
            buyer_identified: "buyer_identified",
            outreach_ready: "outreach_ready",
            qualified: "qualified",
          };
          const stage =
            stageMap[a.verification_status as string] ??
            stageMap[a.stage as string] ??
            "discovered";
          return {
            id: a.id,
            name: a.name,
            domain: a.domain,
            industry: a.industry || "Technology",
            employeeRange: a.employee_count
              ? `${a.employee_count}`
              : "500-1000",
            hqLocation: a.region || "North America",
            logoInitial: (a.name || "A")[0].toUpperCase(),
            stage,
            health: "on_track" as const,
            fitScore: score,
            confidence: confidence as Account["confidence"],
            icpId: a.icp_id || "",
            icpName: a.icp_name || "",
            daysInStage: 0,
            discoveredAt: a.created_at || new Date().toISOString(),
            lastActivityAt: a.updated_at || new Date().toISOString(),
            discoveryReasons: a.match_reasons || [],
            tags: [],
          };
        });
      }
    }
  } catch {
    // Fallback to mock data only if fetch fails
  }
  return latency(mock.accounts);
}

export async function getAccount(id: string): Promise<Account | undefined> {
  try {
    const res = await apiFetch(`/api/discovery/accounts/${id}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.account) {
        const a = data.account;
        const score = typeof a.fit_score === "number" ? a.fit_score : 0;
        const confidence =
          score >= 80 ? "high" : score >= 60 ? "medium" : "low";
        const stageMap: Record<string, Account["stage"]> = {
          verified: "verified",
          discovered: "discovered",
          rejected: "discovered",
          researched: "researched",
          buyer_identified: "buyer_identified",
          outreach_ready: "outreach_ready",
          qualified: "qualified",
        };
        const stage =
          stageMap[a.verification_status as string] ??
          stageMap[a.stage as string] ??
          "discovered";
        return {
          id: a.id,
          name: a.name,
          domain: a.domain,
          industry: a.industry || "Technology",
          employeeRange: a.employee_count
            ? `${a.employee_count}`
            : "500-1000",
          hqLocation: a.region || "North America",
          logoInitial: (a.name || "A")[0].toUpperCase(),
          stage,
          health: "on_track" as const,
          fitScore: score,
          confidence: confidence as Account["confidence"],
          icpId: a.icp_id || "",
          icpName: a.icp_name || "",
          daysInStage: 0,
          discoveredAt: a.created_at || new Date().toISOString(),
          lastActivityAt: a.updated_at || new Date().toISOString(),
          discoveryReasons: a.match_reasons || [],
          tags: [],
        };
      }
    }
  } catch {
    // Fallback
  }
  return latency(mock.accounts.find((a) => a.id === id));
}

export async function getIcps(productId?: string): Promise<IcpDefinition[]> {
  try {
    if (!productId) {
      const prods = await getProducts();
      productId = prods.activeProductId || undefined;
    }
    if (productId) {
      const res = await apiFetch(`/api/icp/list?product_id=${productId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.icps)) {
          return data.icps.map((icp: any) => ({
            id: icp.id,
            name: icp.name,
            description: icp.description || "",
            productId: icp.product_id,
            criteria: Array.isArray(icp.criteria?.buyingSignals)
              ? icp.criteria.buyingSignals
              : (icp.criteria?.companyProfile?.industries || ["Enterprise Tech"]),
            matchingAccounts: 0,
            criteriaCount: Object.keys(icp.criteria || {}).length,
            rawCriteria: icp.criteria,
            createdAt: icp.created_at,
          }));
        }
      }
    }
  } catch {
    // Fallback to empty list
  }
  return [];
}

export async function getEvidenceForAccount(accountId: string): Promise<EvidenceItem[]> {
  return latency(mock.evidenceByAccount[accountId] ?? []);
}

export async function getIcpFitForAccount(accountId: string): Promise<IcpCriterionScore[]> {
  return latency(mock.icpFitByAccount[accountId] ?? []);
}

export async function getBuyersForAccount(accountId: string): Promise<Buyer[]> {
  try {
    const res = await apiFetch(`/api/buyers/${accountId}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.buyers)) {
        return data.buyers.map((b: any) => ({
          id: b.id,
          accountId: b.account_id,
          name: b.name,
          title: b.title,
          seniority: (b.seniority as Buyer["seniority"]) || "Director",
          relevanceScore: 80,
          email: b.email,
          linkedinUrl: b.linkedin_url,
          engagementState: "not_contacted" as const,
        }));
      }
    }
  } catch {
    // Fallback
  }
  return latency(mock.buyersByAccount[accountId] ?? []);
}

export async function getQualificationForAccount(accountId: string): Promise<QualificationCriterion[]> {
  try {
    const res = await apiFetch(`/api/qualification/${accountId}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.criteria)) {
        return data.criteria.map((c: any) => {
          const score = typeof c.score === "number" ? c.score : 0;
          const status: QualificationCriterion["status"] =
            score >= 70 ? "met" : score >= 40 ? "unclear" : "unmet";
          return {
            id: c.id,
            label: c.label,
            status,
            agentRationale: `Qualification score: ${score}/100. Risk: ${c.risk || "unclear"}.`,
            evidenceIds: [],
          };
        });
      }
    }
  } catch {
    // Fallback to mock data
  }
  return latency(mock.qualificationByAccount[accountId] ?? []);
}

export async function getOutreachForAccount(accountId: string): Promise<OutreachMessage[]> {
  try {
    const res = await apiFetch(`/api/outreach/${accountId}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        return data.messages.map((m: any) => ({
          id: m.id,
          accountId: m.account_id,
          buyerId: m.buyer_id,
          sequenceStep: m.step_number || 0,
          channel: (m.channel as OutreachMessage["channel"]) || "email",
          subject: m.subject,
          body: m.body,
          status: m.status as OutreachMessage["status"],
          rejectionReason: m.rejection_reason,
          lastEditedAt: m.last_edited_at,
          createdAt: m.created_at,
        }));
      }
    }
  } catch {
    // Fallback
  }
  return latency(mock.outreachByAccount[accountId] ?? []);
}

export async function getAllOutreachMessages(productId?: string): Promise<OutreachMessage[]> {
  try {
    if (!productId) {
      const prods = await getProducts();
      productId = prods.activeProductId || undefined;
    }
    const url = productId ? `/api/outreach?product_id=${productId}` : "/api/outreach";
    const res = await apiFetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        return data.messages.map((m: any) => ({
          id: m.id,
          accountId: m.account_id,
          buyerId: m.buyer_id,
          sequenceStep: m.step_number || 0,
          channel: (m.channel as OutreachMessage["channel"]) || "email",
          subject: m.subject,
          body: m.body,
          status: m.status as OutreachMessage["status"],
          rejectionReason: m.rejection_reason,
          lastEditedAt: m.last_edited_at,
          createdAt: m.created_at,
        }));
      }
    }
  } catch {
    // Fallback
  }
  const all = Object.values(mock.outreachByAccount).flat();
  return latency(all);
}

export async function getPendingOutreachDrafts(productId?: string): Promise<OutreachMessage[]> {
  const all = await getAllOutreachMessages(productId);
  return all.filter((m) => m.status === "pending_approval");
}

export async function updateOutreachDraft(
  id: string,
  updates: Partial<OutreachMessage>
): Promise<OutreachMessage | undefined> {
  try {
    const res = await apiFetch(`/api/outreach/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: updates.status || "pending_approval",
        body: updates.body,
        subject: updates.subject,
        rejection_reason: updates.rejectionReason,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const m = data.message;
      return {
        id: m.id,
        accountId: m.account_id,
        buyerId: m.buyer_id,
        sequenceStep: m.step_number || 0,
        channel: (m.channel as OutreachMessage["channel"]) || "email",
        subject: m.subject,
        body: m.body,
        status: m.status as OutreachMessage["status"],
        rejectionReason: m.rejection_reason,
        lastEditedAt: m.last_edited_at,
        createdAt: m.created_at,
      };
    }
  } catch {
    // Fallback
  }

  for (const accountId in mock.outreachByAccount) {
    const list = mock.outreachByAccount[accountId];
    const index = list.findIndex((m) => m.id === id);
    if (index !== -1) {
      mock.outreachByAccount[accountId][index] = {
        ...list[index],
        ...updates,
        lastEditedAt: new Date().toISOString(),
      };
      return latency(mock.outreachByAccount[accountId][index]);
    }
  }
  return latency(undefined);
}

export async function approveOutreachDraft(
  id: string,
  editedBody?: string,
  editedSubject?: string
): Promise<OutreachMessage | undefined> {
  return updateOutreachDraft(id, {
    status: "approved",
    ...(editedBody !== undefined ? { body: editedBody } : {}),
    ...(editedSubject !== undefined ? { subject: editedSubject } : {}),
  });
}

export async function rejectOutreachDraft(
  id: string,
  reason: string
): Promise<OutreachMessage | undefined> {
  return updateOutreachDraft(id, {
    status: "rejected",
    rejectionReason: reason,
  });
}


export async function getObjectionsForAccount(accountId: string): Promise<Objection[]> {
  return latency(mock.objectionsByAccount[accountId] ?? []);
}

export async function getAgentTasks(): Promise<AgentTask[]> {
  return []; // Removed fake tasks
}

export async function getAgentTasksForAccount(accountId: string): Promise<AgentTask[]> {
  return []; // Removed fake tasks
}

export async function getApprovalQueue(): Promise<ApprovalItem[]> {
  const drafts = await getPendingOutreachDrafts();
  return drafts.map((d) => ({
    id: d.id,
    kind: "outreach_email",
    title: `Review Outreach: ${d.subject || "No Subject"}`,
    description: `Needs review before sending to ${d.buyerId || "Buyer"}`,
    status: "pending",
    createdAt: d.createdAt || new Date().toISOString(),
    requestedAt: d.createdAt || new Date().toISOString(),
    accountId: d.accountId,
    accountName: `Account ID: ${d.accountId.substring(0, 8)}`,
    moduleId: "personalized_outreach",
    urgency: "high",
    actionPath: `/outreach-review`,
  }));
}

export async function getModuleStatuses(): Promise<ModuleStatus[]> {
  return latency(mock.moduleStatuses);
}

export async function getComplianceFlags(): Promise<ComplianceFlag[]> {
  return latency(mock.complianceFlags);
}

export async function getCrmSyncStatus(): Promise<CrmSyncStatus> {
  return latency(mock.crmSyncStatus);
}

export async function getOutcomeRecords(): Promise<OutcomeRecord[]> {
  return latency(mock.outcomeRecords);
}

// ── Module Pipeline Trace (Backend HTTP calls) ──────────────────────
// Calls FastAPI backend directly (http://127.0.0.1:8000) to prevent Next.js proxy socket hang ups,
// with graceful fallback to relative /api/* if needed.

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "http://127.0.0.1:8000" : "http://127.0.0.1:8000");

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const fullUrl = `${API_BASE}${path}`;
  try {
    const res = await fetch(fullUrl, options);
    return res;
  } catch {
    // If direct backend call fails, try relative proxy
    return await fetch(path, options);
  }
}

export async function getBackendHealth(): Promise<{ status: string; modules: string[] } | null> {
  try {
    const res = await apiFetch("/api/health", { cache: "no-store" });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
}

export async function runPipelineTrace(req: PipelineRunRequest): Promise<PipelineTraceResponse> {
  let productId = req.product_id;
  let companyId = req.company_id;
  if (!productId) {
    try {
      const prods = await getProducts();
      productId = prods.activeProductId || undefined;
      companyId = prods.company?.id || undefined;
    } catch {
      // ignore
    }
  }

  const payload: PipelineRunRequest = {
    ...req,
    product_id: productId,
    company_id: companyId,
  };

  const res = await apiFetch("/api/tracer/run-pipeline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`Pipeline failed (${res.status}): ${errText}`);
  }
  return (await res.json()) as PipelineTraceResponse;
}

export async function runPipelineTraceUpload(params: {
  raw_icp_text?: string;
  icp_file?: File | null;
  run_verification?: boolean;
  run_fit_evaluation?: boolean;
  max_accounts_for_buyer_research?: number;
  mode?: "live" | "mock";
  product_id?: string;
  company_id?: string;
}): Promise<PipelineTraceResponse> {
  // Auto-resolve product_id if not provided
  let productId = params.product_id;
  let companyId = params.company_id;
  if (!productId) {
    try {
      const prods = await getProducts();
      productId = prods.activeProductId || undefined;
      companyId = prods.company?.id || undefined;
    } catch {
      // ignore
    }
  }

  const form = new FormData();
  if (params.raw_icp_text) form.append("raw_icp_text", params.raw_icp_text);
  if (params.icp_file) form.append("icp_file", params.icp_file);
  if (params.mode) form.append("mode", params.mode);
  if (productId) form.append("product_id", productId);
  if (companyId) form.append("company_id", companyId);
  if (params.run_verification !== undefined) {
    form.append("run_verification", String(params.run_verification));
  }
  if (params.run_fit_evaluation !== undefined) {
    form.append("run_fit_evaluation", String(params.run_fit_evaluation));
  }
  if (params.max_accounts_for_buyer_research !== undefined) {
    form.append(
      "max_accounts_for_buyer_research",
      String(params.max_accounts_for_buyer_research)
    );
  }

  const res = await apiFetch("/api/tracer/run-pipeline-upload", {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`Pipeline failed (${res.status}): ${errText}`);
  }
  return (await res.json()) as PipelineTraceResponse;
}

// ── Multi-Tenancy Products & ICPs API ───────────────────────────────

const LOCAL_STORAGE_KEY_PRODUCTS = "sawf_custom_products";
const LOCAL_STORAGE_KEY_ACTIVE_PRODUCT = "sawf_active_product_id";

function getLocalStoredProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStoredProduct(product: Product) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalStoredProducts();
    const updated = [product, ...existing.filter((p) => p.id !== product.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export async function getProducts(companyId?: string): Promise<{
  company: Company;
  activeProductId: string | null;
  products: Product[];
}> {
  try {
    const res = await apiFetch(`/api/products?company_id=${companyId || mock.mockCompany.id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return {
        company: data.company,
        activeProductId: data.active_product_id,
        products: data.products.map((p: any) => ({
          id: p.id,
          companyId: p.company_id,
          name: p.name,
          description: p.description,
          targetMarket: p.target_market,
          valueProposition: p.value_proposition,
          isActive: p.is_active,
          isSelected: p.is_selected,
          icpCount: p.icp_count,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        })),
      };
    }
  } catch {
    // Fall back to mock and local storage
  }

  const custom = getLocalStoredProducts();
  const allProducts = [...custom, ...mock.mockProducts];
  let activeId: string | null = mock.mockCompany.activeProductId;
  if (typeof window !== "undefined") {
    const localActive = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE_PRODUCT);
    if (localActive) activeId = localActive;
  }

  const mapped = allProducts.map((p) => ({
    ...p,
    isSelected: p.id === activeId,
  }));

  return latency({
    company: { ...mock.mockCompany, activeProductId: activeId },
    activeProductId: activeId,
    products: mapped,
  });
}

export async function createProduct(payload: CreateProductInput): Promise<Product> {
  try {
    const res = await apiFetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: payload.companyId || mock.mockCompany.id,
        name: payload.name,
        description: payload.description,
        target_market: payload.targetMarket || "",
        value_proposition: payload.valueProposition || "",
        set_as_active: payload.setAsActive ?? true,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const p = data.product;
      const created: Product = {
        id: p.id,
        companyId: p.company_id,
        name: p.name,
        description: p.description,
        targetMarket: p.target_market,
        valueProposition: p.value_proposition,
        isActive: p.is_active,
        isSelected: payload.setAsActive ?? true,
        icpCount: 0,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
      if (typeof window !== "undefined" && (payload.setAsActive ?? true)) {
        localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_PRODUCT, created.id);
      }
      return created;
    }
  } catch {
    // Fallback to local simulation
  }

  const id = "prod_" + Date.now();
  const newProduct: Product = {
    id,
    companyId: payload.companyId || mock.mockCompany.id,
    name: payload.name,
    description: payload.description,
    targetMarket: payload.targetMarket,
    valueProposition: payload.valueProposition,
    isActive: true,
    isSelected: payload.setAsActive ?? true,
    icpCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveLocalStoredProduct(newProduct);
  if (typeof window !== "undefined" && (payload.setAsActive ?? true)) {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_PRODUCT, id);
  }

  return latency(newProduct, 200);
}

export async function selectActiveProduct(productId: string, companyId?: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_PRODUCT, productId);
  }

  try {
    const res = await apiFetch(`/api/products/${productId}/select`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId || mock.mockCompany.id }),
    });
    if (res.ok) return true;
  } catch {
    // Handled by localStorage fallback
  }

  return latency(true, 100);
}

export async function generateICPFromProduct(payload: GenerateICPInput): Promise<any> {
  try {
    const res = await apiFetch("/api/icp/generate-from-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_name: payload.productName,
        product_description: payload.productDescription,
        target_market: payload.targetMarket || "",
        value_proposition: payload.valueProposition || "",
        company_name: payload.companyName || "Our Company",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.canonical_icp;
    }
  } catch {
    // Fallback
  }

  // Fallback high-fidelity ICP generated from product description
  return latency({
    icpName: `${payload.productName} — Enterprise Target Segment`,
    description: `Targeting organizations actively expanding their software operations that face pain points solvable by ${payload.productName}.`,
    companyProfile: {
      industries: ["B2B Software", "Financial Technology", "Enterprise IT", "Digital Health"],
      subIndustries: ["Cloud Infrastructure", "Cybersecurity", "DevSecOps"],
      employeeRange: { min: 100, max: 2500 },
      revenueRange: { min: 15, max: 250, currency: "USD" },
      companyStages: ["Series B", "Series C", "Growth"],
      businessModels: ["B2B SaaS", "Hybrid Cloud Enterprise"],
    },
    geography: {
      countries: ["United States", "Canada", "United Kingdom"],
      regionsCities: ["San Francisco Bay Area", "New York", "London", "Austin"],
    },
    technology: {
      required: ["Cloud Provider (AWS/Azure/GCP)", "Modern CI/CD Pipeline"],
      preferred: ["Kubernetes", "Datadog", "Terraform"],
      excluded: ["Pure On-Premise Airgapped Mainframe"],
    },
    businessContext: {
      characteristics: ["High engineering velocity", "Security audit requirement within 6 months"],
      departments: ["Engineering", "Security", "DevOps", "Operations"],
      conditions: ["Undergoing rapid hiring or cloud infrastructure migration"],
    },
    problemFit: {
      primaryProblems: [
        "High operational overhead and manual management burdens",
        "Fragmented visibility across disparate tools and point solutions",
        "Compliance friction slowing down production delivery",
      ],
      useCases: ["Unified platform migration", "Cost & risk containment", "Audit prep acceleration"],
      businessImpact: "Up to 60% reduction in configuration time and 40% total cost of ownership savings.",
    },
    targetPersonas: [
      {
        titles: ["Chief Technology Officer", "VP of Engineering"],
        seniority: ["C-Level", "VP"],
        departments: ["Engineering", "Technology"],
        decision_maker_type: "Economic Buyer",
      },
      {
        titles: ["Head of Infrastructure", "Director of DevOps"],
        seniority: ["Director"],
        departments: ["Operations", "DevOps"],
        decision_maker_type: "Champion",
      },
      {
        titles: ["Lead Security Architect", "Staff Systems Engineer"],
        seniority: ["Lead / Staff"],
        departments: ["Security", "Infrastructure"],
        decision_maker_type: "Technical Evaluator",
      },
    ],
    buyingSignals: [
      "Hiring for DevOps, Platform, or Security Engineers",
      "Recent Series B/C funding announcement",
      "Public cloud migration or re-architecture initiatives",
      "Upcoming SOC 2 or ISO 27001 compliance renewal deadline",
    ],
    exclusions: {
      industries: ["B2C eCommerce", "Government / Defense Classified"],
      locations: ["Regions without supported cloud data residency"],
      other: "Organizations with fewer than 10 technical employees",
    },
  }, 900);
}

export async function saveICP(payload: SaveICPInput): Promise<ICPRecord> {
  try {
    const res = await apiFetch("/api/icp/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: payload.companyId || mock.mockCompany.id,
        product_id: payload.productId,
        generation_method: payload.generationMethod,
        name: payload.name,
        description: payload.description || "",
        criteria: payload.criteria,
        raw_document_text: payload.rawDocumentText,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.icp as ICPRecord;
    }
  } catch {
    // Fallback
  }

  const record: ICPRecord = {
    id: "icp_" + Date.now(),
    companyId: payload.companyId || mock.mockCompany.id,
    productId: payload.productId,
    generationMethod: payload.generationMethod,
    name: payload.name,
    description: payload.description,
    criteria: payload.criteria,
    rawDocumentText: payload.rawDocumentText,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  return latency(record, 150);
}

export async function uploadICPDocument(file: File, productId?: string, companyId?: string): Promise<any> {
  const form = new FormData();
  form.append("file", file);
  if (productId) form.append("product_id", productId);
  if (companyId) form.append("company_id", companyId);

  try {
    const res = await apiFetch("/api/icp/upload", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  return latency({
    status: "success",
    filename: file.name,
    extracted_text_snippet: `Extracted ICP document contents from ${file.name}: Enterprise B2B tech customers with cloud operations.`,
    canonical_icp: {
      icpName: `Extracted ICP from ${file.name}`,
      description: "Imported from uploaded specification document.",
      companyProfile: {
        industries: ["Fintech", "Healthcare IT", "Enterprise SaaS"],
        employeeRange: { min: 250, max: 2000 },
        revenueRange: { min: 20, max: 200, currency: "USD" },
      },
      targetPersonas: [
        { titles: ["CISO", "VP of Security"], seniority: ["C-Level", "VP"], decision_maker_type: "Economic Buyer" },
      ],
      buyingSignals: ["Upcoming compliance audit", "Active cloud migration"],
    },
  }, 800);
}





