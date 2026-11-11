"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import type { Account } from "@/lib/types";
import { loadGoogleMaps, isGoogleMapsConfigured, getGoogleMapsMapId, STAGE_MARKER_COLORS, stageMarkerElement } from "@/lib/google-maps";
import { MapPin, Phone, ExternalLink, Loader2, MapPinOff } from "lucide-react";

interface AccountLocationCardProps {
  account: Account;
}

type MapStatus = "loading" | "ready" | "unconfigured" | "error" | "no-coords";

function mapsSearchUrl(account: Account): string {
  if (account.mapsUrl) return account.mapsUrl;
  if (typeof account.latitude === "number" && typeof account.longitude === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${account.latitude},${account.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    account.formattedAddress || account.hqLocation || account.name
  )}`;
}

/**
 * Small map + address/phone for a single account, shown on the account detail
 * page. Degrades gracefully to address/phone only when Places data or the
 * browser map key is unavailable.
 */
export function AccountLocationCard({ account }: AccountLocationCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hasCoords = typeof account.latitude === "number" && typeof account.longitude === "number";
  const [status, setStatus] = React.useState<MapStatus>(() => {
    if (!hasCoords) return "no-coords";
    return isGoogleMapsConfigured() ? "loading" : "unconfigured";
  });

  React.useEffect(() => {
    // Initial state already covers "no-coords" / "unconfigured" / "loading";
    // only the async SDK result needs to update status here.
    if (!hasCoords || !isGoogleMapsConfigured()) return;
    let cancelled = false;
    loadGoogleMaps()
      .then((g) => {
        if (cancelled || !containerRef.current) return;
        const position = { lat: account.latitude as number, lng: account.longitude as number };
        const map = new g.maps.Map(containerRef.current, {
          center: position,
          zoom: 14,
          mapId: getGoogleMapsMapId(),
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        new g.maps.marker.AdvancedMarkerElement({
          position,
          map,
          title: account.name,
          content: stageMarkerElement(STAGE_MARKER_COLORS[account.stage] || "#64748b"),
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [account.id, account.latitude, account.longitude, account.stage, account.name, hasCoords]);

  const showMap = status === "ready" || status === "loading";
  const hasLocationDetails = account.formattedAddress || account.phone || account.businessStatus;

  if (!hasCoords && !hasLocationDetails) return null;

  return (
    <Card className="p-4 border-border-default">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-accent-500" />
          <p className="text-xs font-semibold text-text-primary">Location</p>
        </div>
        <a
          href={mapsSearchUrl(account)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-accent-500 hover:underline"
        >
          Open in Google Maps <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {showMap && (
        <div className="relative mb-3 overflow-hidden rounded-[var(--radius-sm)] border border-border-subtle">
          <div ref={containerRef} className="h-[200px] w-full bg-sunken/40" />
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-sunken/50">
              <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
            </div>
          )}
        </div>
      )}

      {!showMap && hasCoords && (
        <div className="mb-3 flex items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-border-default bg-sunken/30 px-3 py-4 text-[11px] text-text-tertiary">
          <MapPinOff className="h-3.5 w-3.5" />
          {status === "unconfigured"
            ? "Map preview unavailable (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set)."
            : "Map preview unavailable."}
        </div>
      )}

      <div className="space-y-1.5 text-xs">
        {account.formattedAddress && (
          <div className="flex items-start gap-2 text-text-secondary">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" />
            <span>{account.formattedAddress}</span>
          </div>
        )}
        {account.phone && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Phone className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
            <a href={`tel:${account.phone}`} className="hover:text-accent-500">
              {account.phone}
            </a>
          </div>
        )}
        {account.businessStatus && (
          <div className="pt-0.5">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                account.businessStatus === "OPERATIONAL"
                  ? "border-positive-500/25 bg-positive-50 text-positive-600 dark:bg-positive-500/10 dark:text-positive-400"
                  : "border-caution-500/25 bg-caution-50 text-caution-600 dark:bg-caution-500/10 dark:text-caution-400"
              }`}
            >
              {account.businessStatus.replace(/_/g, " ")}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
