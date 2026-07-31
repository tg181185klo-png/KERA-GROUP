"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl } from "@/lib/site-url";
import {
  buildAuthHref,
  getAuthErrorMessage,
  splitFullName,
} from "@/lib/auth-errors";
import { KeraLogo } from "@/components/brand/KeraLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
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
  const openForgot = searchParams.get("forgot") === "1";

  const [mode, setMode] = useState<Mode>(
    openForgot ? "forgot" : initialMode,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingVerify, setPendingVerify] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const loginHref = buildAuthHref("/login", redirect);
  const signupHref = buildAuthHref("/signup", redirect);
  const isForgot = mode === "forgot";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setPendingVerify(false);

    const supabase = createClient();

    if (mode === "forgot") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        form.email.trim(),
        {
          redirectTo: authCallbackUrl("/reset-password"),
        },
      );

      setLoading(false);

      if (resetError) {
        setError(getAuthErrorMessage(resetError.message, t));
        return;
      }

      setSuccess(t.auth.resetSent);
      return;
    }

    if (mode === "signup") {
      const { first_name, last_name } = splitFullName(form.fullName);

      if (!first_name.trim()) {
        setError(t.auth.nameRequired);
        setLoading(false);
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { first_name, last_name },
          emailRedirectTo: authCallbackUrl(redirect),
        },
      });

      if (signUpError) {
        setError(getAuthErrorMessage(signUpError.message, t));
        setLoading(false);
        return;
      }

      if (signUpData.user && !signUpData.session) {
        setPendingVerify(true);
        setLoading(false);
        return;
      }

      if (signUpData.user) {
        await supabase.from("profiles").upsert({
          id: signUpData.user.id,
          email: form.email.trim(),
          first_name,
          last_name,
        });
      }

      router.push(redirect);
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    setLoading(false);

    if (signInError) {
      setError(getAuthErrorMessage(signInError.message, t));
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  function switchToForgot() {
    setMode("forgot");
    setError("");
    setSuccess("");
    setPendingVerify(false);
  }

  function switchToLogin() {
    setMode("login");
    setError("");
    setSuccess("");
    setPendingVerify(false);
  }

  if (pendingVerify) {
    return (
      <Card className="mx-auto w-full max-w-md p-8">
        <div className="mb-6 flex justify-center">
          <KeraLogo size="lg" showText={false} />
        </div>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="kera-page-header mb-2 text-center">{t.auth.verifyEmailTitle}</h1>
        <p className="mb-6 text-center text-sm leading-relaxed text-slate-600">
          {t.auth.verifyEmail}
        </p>
        <Button type="button" className="w-full" onClick={() => router.push(loginHref)}>
          {t.auth.continueToLogin}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
      <div className="mb-5 flex justify-center sm:mb-6">
        <KeraLogo size="lg" showText={false} />
      </div>

      {!isForgot && (
        <div
          className="mb-6 flex rounded-xl border border-slate-200 bg-slate-50 p-1"
          role="tablist"
          aria-label={t.auth.login}
        >
          <Link
            href={loginHref}
            role="tab"
            aria-selected={mode === "login"}
            className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition ${
              mode === "login"
                ? "bg-white text-kera-primary shadow-sm"
                : "text-slate-600 hover:text-kera-slate"
            }`}
          >
            {t.auth.login}
          </Link>
          <Link
            href={signupHref}
            role="tab"
            aria-selected={mode === "signup"}
            className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-kera-primary shadow-sm"
                : "text-slate-600 hover:text-kera-slate"
            }`}
          >
            {t.auth.signup}
          </Link>
        </div>
      )}

      {isForgot && (
        <button
          type="button"
          onClick={switchToLogin}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-kera-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.auth.backToLogin}
        </button>
      )}

      <h1 className="kera-page-header mb-1.5 text-center text-xl sm:text-2xl">
        {isForgot
          ? t.auth.forgotTitle
          : mode === "login"
            ? t.auth.login
            : t.auth.signup}
      </h1>
      <p className="mb-5 text-center text-sm text-slate-500 sm:mb-6">
        {isForgot
          ? t.auth.forgotSubtitle
          : mode === "login"
            ? t.auth.loginSubtitle
            : t.auth.signupSubtitle}
      </p>

      {resetSuccess && mode === "login" && !isForgot && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2.5 text-center text-sm text-emerald-700">
          {t.auth.resetSuccess}
        </p>
      )}

      {authFailed && mode === "login" && !isForgot && (
        <p className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-center text-sm text-red-600">
          {t.auth.authError}
        </p>
      )}

      {success && isForgot && (
        <div className="mb-4 space-y-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p>{success}</p>
          <Button type="button" variant="ghost" className="w-full" onClick={switchToLogin}>
            {t.auth.continueToLogin}
          </Button>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <Input
              label={t.auth.fullName}
              name="full_name"
              required
              autoComplete="name"
              placeholder={t.auth.fullNamePlaceholder}
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
            />
          )}

          <Input
            label={t.auth.email}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={t.auth.emailPlaceholder}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />

          {!isForgot && (
            <div>
              <PasswordInput
                label={t.auth.password}
                name="password"
                required
                minLength={6}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                hint={mode === "signup" ? t.auth.passwordHint : undefined}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
              {mode === "login" && (
                <button
                  type="button"
                  onClick={switchToForgot}
                  className="mt-2 text-sm font-medium text-kera-primary transition hover:underline"
                >
                  {t.auth.forgotPassword}
                </button>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? t.auth.loading
              : isForgot
                ? t.auth.sendResetLink
                : mode === "login"
                  ? t.auth.login
                  : t.auth.signup}
          </Button>
        </form>
      )}

      {!isForgot && !success && (
        <p className="mt-5 text-center text-sm text-slate-500">
          {mode === "login" ? (
            <>
              {t.auth.noAccount}{" "}
              <Link href={signupHref} className="kera-link font-medium">
                {t.auth.signup}
              </Link>
            </>
          ) : (
            <>
              {t.auth.hasAccount}{" "}
              <Link href={loginHref} className="kera-link font-medium">
                {t.auth.login}
              </Link>
            </>
          )}
        </p>
      )}
    </Card>
  );
}
