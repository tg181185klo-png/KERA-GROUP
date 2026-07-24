"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Shield } from "lucide-react";
import { LOGO_IMAGE } from "@/lib/brand";
import { SITE_NAME } from "@/lib/constants";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
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
        throw new Error(data.error ?? "არასწორი პაროლი");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="kera-card mx-auto max-w-md p-8">
      <div className="mb-6 text-center">
        <Image
          src={LOGO_IMAGE}
          alt={SITE_NAME}
          width={56}
          height={56}
          className="mx-auto h-14 w-14 object-contain"
        />
        <div className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-kera-blue/10 text-kera-blue">
          <Shield className="h-5 w-5" />
        </div>
        <h1 className="font-display mt-4 text-xl font-bold text-kera-slate">
          ადმინისტრატორის შესვლა
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          შეიყვანეთ ადმინისტრატორის პაროლი განცხადებების დასადასტურებლად.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            პაროლი
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            autoComplete="current-password"
            placeholder="ადმინისტრატორის პაროლი"
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
              შემოწმება...
            </span>
          ) : (
            "შესვლა ადმინ პანელში"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/" className="text-kera-blue hover:underline">
          ← მთავარ გვერდზე
        </Link>
      </p>
    </div>
  );
}
