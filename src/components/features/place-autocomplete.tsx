"use client";

import * as React from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlacesAutocomplete, type PlaceSuggestion } from "@/lib/api";

interface PlaceAutocompleteProps {
  /** Selected city / region values (clean, canonical strings). */
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

/**
 * City / region input backed by Google Places autocomplete (through the backend
 * proxy, so the server-side key never reaches the browser). Values are picked
 * from real Places suggestions so geography stays clean and consistent; users
 * can still type a value manually when Places is unavailable.
 */
export function PlaceAutocomplete({
  value,
  onChange,
  label = "Target Cities & Regions",
  placeholder = "Search a city or region (e.g. Hyderabad, London)…",
  helpText,
  className,
}: PlaceAutocompleteProps) {
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = (raw: string) => {
    setQuery(raw);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!raw.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await getPlacesAutocomplete(raw, 6);
      setSuggestions(results);
      setHighlight(0);
      setOpen(results.length > 0);
      setLoading(false);
    }, 250);
  };

  const addLocation = (loc: string) => {
    const clean = loc.trim();
    if (!clean) return;
    if (!value.some((v) => v.toLowerCase() === clean.toLowerCase())) {
      onChange([...value, clean]);
    }
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  };

  const removeLocation = (loc: string) => onChange(value.filter((v) => v !== loc));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && suggestions[highlight]) addLocation(suggestions[highlight].description);
      else addLocation(query);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={className} ref={boxRef}>
      <label className="block text-xs font-semibold text-text-secondary mb-1">{label}</label>

      {value.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {value.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-sunken px-2.5 py-0.5 text-[11px] text-text-secondary"
            >
              <MapPin className="h-3 w-3 text-accent-500" />
              {loc}
              <button
                type="button"
                aria-label={`Remove ${loc}`}
                onClick={() => removeLocation(loc)}
                className="text-text-tertiary hover:text-risk-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-md border border-border-default bg-sunken/40 py-2 pl-8 pr-8 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-text-tertiary" />
        )}

        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border-default bg-raised shadow-lg">
            {suggestions.map((s, idx) => (
              <li key={s.place_id || s.description}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => addLocation(s.description)}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2 text-left text-xs transition-colors",
                    idx === highlight ? "bg-sunken text-text-primary" : "text-text-secondary"
                  )}
                >
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-accent-500" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-text-primary">{s.main_text}</span>
                    {s.secondary_text && (
                      <span className="block truncate text-[11px] text-text-tertiary">
                        {s.secondary_text}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-1 text-[10px] text-text-tertiary">
        {helpText || "Pick from Google Places suggestions, or press Enter to add your own."}
      </p>
    </div>
  );
}
