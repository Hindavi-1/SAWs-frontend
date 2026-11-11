"use client";

import * as React from "react";
import type { Account } from "@/lib/types";
import { FUNNEL_STAGES, STAGE_LABELS } from "@/lib/types";
import {
  loadGoogleMaps,
  isGoogleMapsConfigured,
  getGoogleMapsMapId,
  STAGE_MARKER_COLORS,
  stageMarkerElement,
} from "@/lib/google-maps";
import { MapPinOff, AlertCircle, Loader2 } from "lucide-react";

interface AccountMapProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  className?: string;
}

type MapStatus = "loading" | "ready" | "unconfigured" | "error";

function hasCoords(a: Account): boolean {
  return typeof a.latitude === "number" && typeof a.longitude === "number";
}

/**
 * Renders accounts as markers on a Google map, coloured by funnel stage.
 * Clicking a marker opens the account peek drawer (which links to the detail page).
 * Falls back to a clear message when the browser key is missing or the SDK fails.
 */
export function AccountMap({ accounts, onSelectAccount, className }: AccountMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const markersRef = React.useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [status, setStatus] = React.useState<MapStatus>(
    isGoogleMapsConfigured() ? "loading" : "unconfigured"
  );

  const mappable = React.useMemo(() => accounts.filter(hasCoords), [accounts]);
  const stagesPresent = React.useMemo(() => {
    const present = new Set(mappable.map((a) => a.stage));
    return FUNNEL_STAGES.filter((s) => present.has(s));
  }, [mappable]);

  // Create the map once the SDK is available.
  React.useEffect(() => {
    // Initial state already covers "unconfigured" / "loading".
    if (!isGoogleMapsConfigured()) return;
    let cancelled = false;
    loadGoogleMaps()
      .then((g) => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new g.maps.Map(containerRef.current, {
          center: { lat: 20, lng: 10 },
          zoom: 2,
          mapId: getGoogleMapsMapId(),
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // (Re)draw markers whenever the account set or map readiness changes.
  React.useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) return;

    markersRef.current.forEach((m) => {
      m.map = null;
    });
    markersRef.current = [];
    if (mappable.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    mappable.forEach((acc) => {
      const position = { lat: acc.latitude as number, lng: acc.longitude as number };
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        title: acc.name,
        content: stageMarkerElement(STAGE_MARKER_COLORS[acc.stage] || "#64748b"),
      });
      marker.addListener("click", () => onSelectAccount(acc));
      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (mappable.length === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(13);
    } else {
      map.fitBounds(bounds, 48);
    }
  }, [status, mappable, onSelectAccount]);

  if (status === "unconfigured" || status === "error") {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border-default bg-sunken/30 p-10 text-center ${className || ""}`}
      >
        {status === "unconfigured" ? (
          <MapPinOff className="h-6 w-6 text-text-tertiary" />
        ) : (
          <AlertCircle className="h-6 w-6 text-risk-500" />
        )}
        <p className="text-xs font-medium text-text-secondary">
          {status === "unconfigured" ? "Map view is not configured" : "Map failed to load"}
        </p>
        <p className="max-w-sm text-[11px] text-text-tertiary">
          {status === "unconfigured"
            ? "Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to a referrer-restricted browser key to enable the map view."
            : "The Google Maps SDK could not be loaded. Check the key and your network, then reload."}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-border-default">
        <div ref={containerRef} className="h-[560px] w-full bg-sunken/40" />
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-sunken/50 text-xs text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading map…
          </div>
        )}
        {status === "ready" && mappable.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-raised/85 text-center">
            <MapPinOff className="h-5 w-5 text-text-tertiary" />
            <p className="text-xs font-medium text-text-secondary">No mapped accounts</p>
            <p className="text-[11px] text-text-tertiary">
              None of the filtered accounts have Google Places coordinates yet.
            </p>
          </div>
        )}
      </div>

      {stagesPresent.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {stagesPresent.map((s) => (
            <span key={s} className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border border-white/70"
                style={{ backgroundColor: STAGE_MARKER_COLORS[s] }}
              />
              {STAGE_LABELS[s]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
