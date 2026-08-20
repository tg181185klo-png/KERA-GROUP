"use client";

import { useState } from "react";
import { UserPen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useT } from "@/i18n/LocaleProvider";
import type { Profile } from "@/lib/types/profile";

export function ProfileEditCard({ initialProfile }: { initialProfile: Profile | null }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [firstName, setFirstName] = useState(initialProfile?.first_name ?? "");
  const [lastName, setLastName] = useState(initialProfile?.last_name ?? "");
  const [phone, setPhone] = useState(initialProfile?.phone ?? "");

  if (!profile) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.dashboard.profileSaveError);
        return;
      }

      setProfile(data);
      setFirstName(data.first_name ?? "");
      setLastName(data.last_name ?? "");
      setPhone(data.phone ?? "");
      setSuccess(true);
      setOpen(false);
    } catch {
      setError(t.dashboard.profileSaveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="kera-icon-box shrink-0">
            <UserPen className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {t.dashboard.profileTitle}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {profile.first_name} {profile.last_name} · {profile.email}
              {profile.phone ? ` · ${profile.phone}` : ""}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-kera-blue hover:bg-blue-50"
          onClick={() => {
            setOpen((value) => !value);
            setError(null);
            setSuccess(false);
          }}
        >
          <UserPen className="h-3.5 w-3.5" />
          {open ? t.dashboard.profileCancel : t.dashboard.profileEdit}
        </Button>
      </div>

      {success && !open && (
        <div className="border-t border-emerald-100 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 sm:px-6">
          {t.dashboard.profileSaved}
        </div>
      )}

      {open && (
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6"
        >
          <p className="mb-4 text-sm text-slate-600">{t.dashboard.profileHint}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t.dashboard.profileFirstName}
              name="first_name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
            <Input
              label={t.dashboard.profileLastName}
              name="last_name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
            <Input
              label={t.dashboard.profilePhone}
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+995 5XX XX XX XX"
              className="sm:col-span-2"
            />
            <Input
              label={t.dashboard.profileEmail}
              name="email"
              value={profile.email}
              readOnly
              disabled
              className="sm:col-span-2 opacity-70"
            />
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? t.dashboard.profileSaving : t.dashboard.profileSave}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFirstName(profile.first_name ?? "");
                setLastName(profile.last_name ?? "");
                setPhone(profile.phone ?? "");
                setOpen(false);
                setError(null);
              }}
            >
              {t.dashboard.profileCancel}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
