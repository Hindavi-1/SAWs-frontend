"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

const INPUT_CLASS =
  "h-9 w-full rounded-[var(--radius-sm)] border border-border-default bg-sunken/60 px-3 text-xs text-text-primary placeholder:text-text-tertiary outline-none transition-colors focus:border-border-strong focus:ring-2 focus:ring-accent-500";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-accent-500/10 text-accent-600 ring-1 ring-accent-500/20 dark:text-accent-400">
            <Bot className="h-5 w-5" />
          </div>
          <h1 className="text-base font-semibold tracking-tight text-text-primary">
            Sign in to your workspace
          </h1>
          <p className="text-xs text-text-tertiary">
            Track and manage your company&apos;s registered products.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-[var(--radius-lg)] border border-border-subtle bg-raised p-5 shadow-[var(--shadow-xs)]"
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold text-text-secondary">
              Work email <span className="text-risk-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[11px] font-semibold text-text-secondary">
              Password <span className="text-risk-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={INPUT_CLASS}
            />
          </div>

          {error && (
            <p className="rounded-[var(--radius-sm)] border border-risk-500/30 bg-risk-500/10 px-2.5 py-1.5 text-[11px] text-risk-600 dark:text-risk-500">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Sign in
          </Button>

          <p className="pt-1 text-center text-[11px] text-text-tertiary">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-accent-600 hover:underline dark:text-accent-400">
              Create one
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center text-[10px] text-text-tertiary">
          Demo credentials: demo@acme.com / demo1234
        </p>
      </div>
    </div>
  );
}
