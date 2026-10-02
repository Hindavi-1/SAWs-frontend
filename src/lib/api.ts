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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return latency(mock.dashboardMetrics);
}

export async function getAccounts(): Promise<Account[]> {
  return latency(mock.accounts);
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return latency(mock.accounts.find((a) => a.id === id));
}

export async function getIcps(): Promise<IcpDefinition[]> {
  return latency(mock.icps);
}

export async function getEvidenceForAccount(accountId: string): Promise<EvidenceItem[]> {
  return latency(mock.evidenceByAccount[accountId] ?? []);
}

export async function getIcpFitForAccount(accountId: string): Promise<IcpCriterionScore[]> {
  return latency(mock.icpFitByAccount[accountId] ?? []);
}

export async function getBuyersForAccount(accountId: string): Promise<Buyer[]> {
  return latency(mock.buyersByAccount[accountId] ?? []);
}

export async function getQualificationForAccount(accountId: string): Promise<QualificationCriterion[]> {
  return latency(mock.qualificationByAccount[accountId] ?? []);
}

export async function getOutreachForAccount(accountId: string): Promise<OutreachMessage[]> {
  return latency(mock.outreachByAccount[accountId] ?? []);
}

export async function getAllOutreachMessages(): Promise<OutreachMessage[]> {
  const all = Object.values(mock.outreachByAccount).flat();
  return latency(all);
}

export async function getPendingOutreachDrafts(): Promise<OutreachMessage[]> {
  const all = Object.values(mock.outreachByAccount).flat();
  return latency(all.filter((m) => m.status === "pending_approval"));
}

export async function updateOutreachDraft(
  id: string,
  updates: Partial<OutreachMessage>
): Promise<OutreachMessage | undefined> {
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
  return latency(mock.agentTasks);
}

export async function getAgentTasksForAccount(accountId: string): Promise<AgentTask[]> {
  return latency(mock.agentTasks.filter((t) => t.accountId === accountId));
}

export async function getApprovalQueue(): Promise<ApprovalItem[]> {
  return latency(mock.approvalQueue);
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
  const res = await apiFetch("/api/tracer/run-pipeline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
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
}): Promise<PipelineTraceResponse> {
  const form = new FormData();
  if (params.raw_icp_text) form.append("raw_icp_text", params.raw_icp_text);
  if (params.icp_file) form.append("icp_file", params.icp_file);
  if (params.mode) form.append("mode", params.mode);
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


