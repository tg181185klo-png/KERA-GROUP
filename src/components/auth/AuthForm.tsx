"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type Mode = "login" | "signup";

export function AuthForm({ mode: initialMode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

    const supabase = createClient();

    if (mode === "signup") {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.first_name,
            last_name: form.last_name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (signUpData.user && !signUpData.session) {
        setError(
          "რეგისტრაცია წარმატებულია. გთხოვთ დაადასტუროთ ელ-ფოსტა, შემდეგ შედით სისტემაში."
        );
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

  return (
    <Card className="mx-auto w-full max-w-md p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        {mode === "login" ? "შესვლა" : "რეგისტრაცია"}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        {mode === "login"
          ? "შედით თქვენს ანგარიშში"
          : "შექმენით ანგარიში ქონების განთავსებისთვის"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="სახელი"
              name="first_name"
              required
              value={form.first_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, first_name: e.target.value }))
              }
            />
            <Input
              label="გვარი"
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
          label="ელ-ფოსტა"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />

        <Input
          label="პაროლი"
          name="password"
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "იტვირთება..."
            : mode === "login"
              ? "შესვლა"
              : "რეგისტრაცია"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            არ გაქვთ ანგარიში?{" "}
            <Link href="/signup" className="font-medium text-kera-blue hover:underline">
              რეგისტრაცია
            </Link>
          </>
        ) : (
          <>
            უკვე გაქვთ ანგარიში?{" "}
            <Link href="/login" className="font-medium text-kera-blue hover:underline">
              შესვლა
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}
