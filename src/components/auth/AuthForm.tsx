"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl } from "@/lib/site-url";
import { KeraLogo } from "@/components/brand/KeraLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useT } from "@/i18n/LocaleProvider";

type Mode = "login" | "signup" | "forgot";

export function AuthForm({ mode: initialMode }: { mode: "login" | "signup" }) {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const resetSuccess = searchParams.get("reset") === "success";
  const authFailed = searchParams.get("error") === "auth";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    if (mode === "forgot") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        form.email,
        {
          redirectTo: authCallbackUrl("/reset-password"),
        },
      );

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSuccess(t.auth.resetSent);
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.first_name,
            last_name: form.last_name,
          },
          emailRedirectTo: authCallbackUrl(redirect),
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (signUpData.user && !signUpData.session) {
        setError(t.auth.verifyEmail);
        setLoading(false);
        return;
      }

      if (signUpData.user) {
        await supabase.from("profiles").upsert({
          id: signUpData.user.id,
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
        });
      }

      router.push("/dashboard");
      router.refresh();
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    }
  }

  const isForgot = mode === "forgot";

  return (
    <Card className="mx-auto w-full max-w-md p-8">
      <div className="mb-6 flex justify-center">
        <KeraLogo size="lg" showText={false} />
      </div>

      {isForgot && (
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
            setSuccess("");
          }}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-kera-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.auth.backToLogin}
        </button>
      )}

      <h1 className="kera-page-header mb-2 text-center">
        {isForgot
          ? t.auth.forgotTitle
          : mode === "login"
            ? t.auth.login
            : t.auth.signup}
      </h1>
      <p className="mb-6 text-center text-sm text-slate-500">
        {isForgot
          ? t.auth.forgotSubtitle
          : mode === "login"
            ? t.auth.loginSubtitle
            : t.auth.signupSubtitle}
      </p>

      {resetSuccess && mode === "login" && !isForgot && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-700">
          {t.auth.resetSuccess}
        </p>
      )}

      {authFailed && mode === "login" && !isForgot && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
          {t.auth.authError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t.auth.firstName}
              name="first_name"
              required
              value={form.first_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, first_name: e.target.value }))
              }
            />
            <Input
              label={t.auth.lastName}
              name="last_name"
              required
              value={form.last_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, last_name: e.target.value }))
              }
            />
          </div>
        )}

        <Input
          label={t.auth.email}
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />

        {!isForgot && (
          <div>
            <Input
              label={t.auth.password}
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
            {mode === "login" && (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setSuccess("");
                }}
                className="mt-2 text-sm text-kera-primary transition hover:underline"
              >
                {t.auth.forgotPassword}
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading || !!success}>
          {loading
            ? t.auth.loading
            : isForgot
              ? t.auth.sendResetLink
              : mode === "login"
                ? t.auth.login
                : t.auth.signup}
        </Button>
      </form>

      {!isForgot && (
        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === "login" ? (
            <>
              {t.auth.noAccount}{" "}
              <Link href="/signup" className="kera-link">
                {t.auth.signup}
              </Link>
            </>
          ) : (
            <>
              {t.auth.hasAccount}{" "}
              <Link href="/login" className="kera-link">
                {t.auth.login}
              </Link>
            </>
          )}
        </p>
      )}
    </Card>
  );
}
