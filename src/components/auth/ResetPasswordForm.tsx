"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { KeraLogo } from "@/components/brand/KeraLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

    function finish(hasValidSession: boolean) {
      if (resolved) return;
      resolved = true;
      setHasSession(hasValidSession);
      setChecking(false);
      if (!hasValidSession) {
        router.replace("/login?error=auth");
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finish(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session || event === "PASSWORD_RECOVERY") {
        finish(true);
      }
    });

    const timer = window.setTimeout(() => finish(false), 4000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, [router]);

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

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?reset=success");
    router.refresh();
  }

  if (checking) {
    return (
      <Card className="mx-auto w-full max-w-md p-8 text-center text-sm text-slate-500">
        {t.common.loading}
      </Card>
    );
  }

  if (!hasSession) {
    return null;
  }

  return (
    <Card className="mx-auto w-full max-w-md p-8">
      <div className="mb-6 flex justify-center">
        <KeraLogo size="lg" showText={false} />
      </div>
      <h1 className="kera-page-header mb-2 text-center">{t.auth.resetTitle}</h1>
      <p className="mb-6 text-center text-sm text-slate-500">{t.auth.resetSubtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.auth.newPassword}
          name="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label={t.auth.confirmPassword}
          name="confirm_password"
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t.auth.loading : t.auth.savePassword}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="kera-link">
          {t.auth.backToLogin}
        </Link>
      </p>
    </Card>
  );
}
