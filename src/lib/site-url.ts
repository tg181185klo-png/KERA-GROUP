/** Canonical public site origin (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://www.keragroup.ge";
}

/** Client-side origin for auth redirects — prefers env to match Supabase allow list. */
export function getClientSiteUrl(): string {
  if (typeof window === "undefined") return getSiteUrl();
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return window.location.origin.replace(/\/$/, "");
}

export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export function authCallbackUrl(next: string): string {
  const path = safeRedirectPath(next);
  return `${getClientSiteUrl()}/auth/callback?next=${encodeURIComponent(path)}`;
}

/** Supabase redirect URLs to allow in dashboard (documentation helper). */
export const SUPABASE_REDIRECT_URLS = [
  "https://www.keragroup.ge/auth/callback",
  "https://keragroup.ge/auth/callback",
  "https://www.keragroup.ge/**",
  "https://keragroup.ge/**",
] as const;
