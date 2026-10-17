"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const AUTH_ROUTES = ["/login", "/signup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isFullScreenApp = pathname === "/outreach-review";

  // Redirect unauthenticated visitors to the login page.
  React.useEffect(() => {
    if (!isAuthRoute && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthRoute, isLoading, isAuthenticated, router]);

  // Login / signup render standalone, without the app chrome.
  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-canvas">
        <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main
          className={cn(
            "flex-1 min-h-0",
            isFullScreenApp ? "overflow-hidden flex flex-col" : "overflow-y-auto"
          )}
        >
          {isFullScreenApp ? (
            children
          ) : (
            <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
