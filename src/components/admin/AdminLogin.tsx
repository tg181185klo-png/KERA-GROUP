"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Shield } from "lucide-react";
import { KeraLogo } from "@/components/brand/KeraLogo";
import { useT } from "@/i18n/LocaleProvider";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const t = useT();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t.admin.wrongPassword);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="kera-card mx-auto max-w-md p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <KeraLogo size="lg" showText={false} />
        <div className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-kera-blue/10 text-kera-blue">
          <Shield className="h-5 w-5" />
        </div>
        <h1 className="font-display mt-4 text-xl font-bold text-kera-slate">
          {t.admin.loginTitle}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{t.admin.loginSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {t.admin.password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            autoComplete="current-password"
            placeholder={t.admin.passwordPlaceholder}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-kera-primary focus:ring-2 focus:ring-kera-primary/20"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="kera-btn w-full py-2.5 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.admin.checking}
            </span>
          ) : (
            t.admin.submit
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/" className="text-kera-blue hover:underline">
          {t.admin.backHome}
        </Link>
      </p>
    </div>
  );
}
