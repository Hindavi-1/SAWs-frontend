/**
 * Lazy loader for the Google Maps JavaScript API.
 *
 * Uses a separate, referrer-restricted browser key supplied through
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. This key is only ever used to render maps in
 * the browser — Places *lookups* go through the backend proxy, which owns the
 * server-side key. The SDK is injected on first use so pages that never open a
 * map never download it.
 */

import type { FunnelStage } from "./types";

const SCRIPT_ID = "google-maps-js-sdk";

let loadPromise: Promise<typeof google> | null = null;

export function getGoogleMapsApiKey(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
}

/** Optional region bias (e.g. "IN") so maps/geocoding favour the ICP's geography. */
export function getGoogleMapsRegion(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_REGION || "").trim();
}

/**
 * Map ID used to render the map. Advanced markers require a map ID; Google's
 * shared DEMO_MAP_ID works with no setup, and a real (styled) ID can be supplied
 * through NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID for production.
 */
export function getGoogleMapsMapId(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "").trim() || "DEMO_MAP_ID";
}

/** True when a browser key is configured; the UI shows a fallback otherwise. */
export function isGoogleMapsConfigured(): boolean {
  return getGoogleMapsApiKey().length > 0;
}

/**
 * Resolve to the `google` namespace, injecting the SDK script on first call.
 * Rejects with a clear message when the key is missing or the script fails.
 */
export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser."));
  }
  if ((window as unknown as { google?: typeof google }).google?.maps) {
    return Promise.resolve((window as unknown as { google: typeof google }).google);
  }
  if (loadPromise) return loadPromise;

  const key = getGoogleMapsApiKey();
  if (!key) {
    return Promise.reject(
      new Error("Google Maps is not configured (set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).")
    );
  }

  loadPromise = new Promise<typeof google>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () =>
        resolve((window as unknown as { google: typeof google }).google)
      );
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps.")));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    const region = getGoogleMapsRegion();
    // `loading=async` avoids the "loaded directly without loading=async" warning;
    // `libraries=marker` makes AdvancedMarkerElement available on load.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&libraries=marker${
      region ? `&region=${encodeURIComponent(region)}` : ""
    }`;
    script.onload = () => resolve((window as unknown as { google: typeof google }).google);
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Fill colour per funnel stage so map markers stay visually distinguishable. */
export const STAGE_MARKER_COLORS: Record<FunnelStage, string> = {
  discovered: "#64748b",
  verified: "#0ea5e9",
  fit_evaluated: "#6366f1",
  buyer_identified: "#8b5cf6",
  account_researched: "#a855f7",
  outreach_ready: "#f59e0b",
  qualified: "#10b981",
  engaged: "#22c55e",
  nurture: "#14b8a6",
  next_action: "#ef4444",
};

/**
 * A colored circular pin as a DOM element, used as the `content` of an
 * AdvancedMarkerElement (the recommended replacement for the deprecated
 * google.maps.Marker).
 */
export function stageMarkerElement(color: string): HTMLElement {
  const el = document.createElement("div");
  el.style.width = "18px";
  el.style.height = "18px";
  el.style.borderRadius = "50%";
  el.style.background = color;
  el.style.border = "2.5px solid #ffffff";
  el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.35)";
  return el;
}
