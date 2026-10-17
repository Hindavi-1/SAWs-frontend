"use client";

import * as React from "react";
import * as api from "@/lib/api";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
  type AuthCompany,
  type AuthUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  company: AuthCompany | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: api.SignupInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [company, setCompany] = React.useState<AuthCompany | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Restore the session from a stored token on first mount.
  React.useEffect(() => {
    let active = true;
    (async () => {
      const token = getAuthToken();
      if (!token) {
        if (active) setIsLoading(false);
        return;
      }
      try {
        const session = await api.getCurrentSession();
        if (!active) return;
        if (session) {
          setUser(session.user);
          setCompany(session.company);
        } else {
          clearAuthToken();
        }
      } catch {
        if (active) clearAuthToken();
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const session = await api.login(email, password);
    setAuthToken(session.token);
    setUser(session.user);
    setCompany(session.company);
  }, []);

  const signup = React.useCallback(async (input: api.SignupInput) => {
    const session = await api.signup(input);
    setAuthToken(session.token);
    setUser(session.user);
    setCompany(session.company);
  }, []);

  const logout = React.useCallback(() => {
    clearAuthToken();
    setUser(null);
    setCompany(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      company,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, company, isLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
