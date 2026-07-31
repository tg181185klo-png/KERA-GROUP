"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { KeraLogo } from "@/components/brand/KeraLogo";
import { Button, LinkButton } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card } from "@/components/ui/Card";
import { useT } from "@/i18n/LocaleProvider";

export function ResetPasswordForm() {
  const t = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let resolved = false;

    async function resolveSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (!resolved) {
          resolved = true;
          setHasSession(true);
          setChecking(false);
        }
        return true;
      }
      return false;
    }

    void resolveSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session || event === "PASSWORD_RECOVERY") {
        if (!resolved) {
          resolved = true;
          setHasSession(true);
          setChecking(false);
        }
      }
    });

    const timer = window.setTimeout(async () => {
      if (resolved) return;
      const ok = await resolveSession();
      if (!resolved) {
        resolved = true;
        setHasSession(ok);
        setChecking(false);
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t.auth.passwordMinLength);
      return;
    }

    if (password !== confirm) {
      setError(t.auth.passwordMismatch);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(getAuthErrorMessage(updateError.message, t));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checking) {
    return (
      <Card className="mx-auto w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-kera-primary border-t-transparent" />
        <p className="text-sm text-slate-500">{t.auth.resetChecking}</p>
      </Card>
    );
  }

  if (!hasSession) {
    return (
      <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
        <div className="mb-5 flex justify-center">
          <KeraLogo size="lg" showText={false} />
        </div>
        <h1 className="kera-page-header mb-2 text-center text-xl">
          {t.auth.resetLinkExpiredTitle}
        </h1>
        <p className="mb-6 text-center text-sm leading-relaxed text-slate-600">
          {t.auth.resetLinkExpired}
        </p>
        <div className="flex flex-col gap-2">
          <LinkButton href="/login?forgot=1" variant="secondary" className="w-full">
            {t.auth.sendResetLink}
          </LinkButton>
          <LinkButton href="/login" variant="ghost" className="w-full">
            {t.auth.backToLogin}
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
      <div className="mb-5 flex justify-center sm:mb-6">
        <KeraLogo size="lg" showText={false} />
      </div>
      <h1 className="kera-page-header mb-1.5 text-center text-xl sm:text-2xl">
        {t.auth.resetTitle}
      </h1>
      <p className="mb-5 text-center text-sm text-slate-500 sm:mb-6">
        {t.auth.resetSubtitle}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label={t.auth.newPassword}
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          autoFocus
          hint={t.auth.passwordHint}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          label={t.auth.confirmPassword}
          name="confirm_password"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t.auth.loading : t.auth.savePassword}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        <Link href="/login" className="kera-link font-medium">
          {t.auth.backToLogin}
        </Link>
      </p>
    </Card>
  );
}
