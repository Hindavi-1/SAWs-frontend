"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreenApp = pathname === "/outreach-review";

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
