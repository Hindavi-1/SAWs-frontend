/**
 * Client-side auth token storage.
 *
 * Kept separate from `api.ts` so that `apiFetch` can read the token without
 * creating a circular import.
 */

export const AUTH_TOKEN_KEY = "sawf_auth_token";

export interface AuthUser {
  id: string;
  company_id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface AuthCompany {
  id: string;
  name: string;
  domain?: string | null;
  active_product_id?: string | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  company: AuthCompany | null;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
