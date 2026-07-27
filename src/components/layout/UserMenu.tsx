"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/profile";
import { useT } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

function getInitials(profile: Profile | null, user: User): string {
  const first =
    profile?.first_name ||
    (typeof user.user_metadata?.first_name === "string"
      ? user.user_metadata.first_name
      : "");
  const last =
    profile?.last_name ||
    (typeof user.user_metadata?.last_name === "string"
      ? user.user_metadata.last_name
      : "");

  const initials = `${first.charAt(0)}${last.charAt(0)}`.trim().toUpperCase();
  if (initials) return initials.slice(0, 2);

  const email = user.email ?? "";
  return email.charAt(0).toUpperCase() || "?";
}

function getDisplayName(profile: Profile | null, user: User): string {
  if (profile?.first_name || profile?.last_name) {
    return `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
  }
  const meta = user.user_metadata;
  if (meta?.first_name || meta?.last_name) {
    return `${meta.first_name ?? ""} ${meta.last_name ?? ""}`.trim();
  }
  return user.email?.split("@")[0] ?? "";
}

function getAvatarUrl(user: User): string | null {
  const url = user.user_metadata?.avatar_url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

function UserAvatar({
  user,
  profile,
  size = "md",
}: {
  user: User;
  profile: Profile | null;
  size?: "sm" | "md";
}) {
  const avatarUrl = getAvatarUrl(user);
  const sizeClass = size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={cn(sizeClass, "shrink-0 rounded-full object-cover ring-2 ring-white")}
      />
    );
  }

  return (
    <span
      className={cn(
        sizeClass,
        "flex shrink-0 items-center justify-center rounded-full bg-kera-primary font-bold text-white ring-2 ring-white",
      )}
      aria-hidden
    >
      {getInitials(profile, user)}
    </span>
  );
}

export function UserMenu({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const t = useT();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      if (currentUser) void loadProfile(currentUser.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        void loadProfile(nextUser.id);
      } else {
        setProfile(null);
      }
      setOpen(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-full bg-slate-100",
          variant === "mobile" ? "h-12 w-12" : "h-10 w-10",
        )}
        aria-hidden
      />
    );
  }

  if (!user) return null;

  const displayName = getDisplayName(profile, user);

  if (variant === "mobile") {
    return (
      <div className="rounded-xl border border-slate-100 bg-kera-page p-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} profile={profile} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-kera-slate">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white"
          >
            <LayoutDashboard className="h-4 w-4 text-kera-primary" />
            {t.header.myDashboard}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            {t.dashboard.logout}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition hover:border-slate-300 hover:bg-slate-50",
          open && "border-kera-primary/30 bg-kera-primary-light/30",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t.header.userMenu}
      >
        <UserAvatar user={user} profile={profile} />
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 lg:block">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} profile={profile} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-kera-slate">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <LayoutDashboard className="h-4 w-4 text-kera-primary" />
            {t.header.myDashboard}
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            {t.dashboard.logout}
          </button>
        </div>
      )}
    </div>
  );
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, isLoggedIn: !!user };
}
