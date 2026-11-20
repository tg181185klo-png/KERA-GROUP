const PUBLIC_SITE = "https://www.keragroup.ge";

function withoutSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function isVercelHost(value: string): boolean {
  try {
    return new URL(value).hostname.endsWith(".vercel.app");
  } catch {
    return value.includes("vercel.app");
  }
}

/** Canonical public site origin. Never a Vercel deployment host. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && !isVercelHost(fromEnv)) return withoutSlash(fromEnv);
  return PUBLIC_SITE;
}

/** Client-side origin for auth redirects — localhost stays local; public links use keragroup.ge. */
export function getClientSiteUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return withoutSlash(window.location.origin);
    }
  }
  return getSiteUrl();
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
