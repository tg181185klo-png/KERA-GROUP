import type { Messages } from "@/i18n/messages";

/** Map Supabase / auth API messages to friendly copy. */
export function getAuthErrorMessage(message: string, t: Messages): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid email or password")
  ) {
    return t.auth.invalidCredentials;
  }

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already been registered")
  ) {
    return t.auth.emailAlreadyRegistered;
  }

  if (normalized.includes("email not confirmed")) {
    return t.auth.emailNotConfirmed;
  }

  if (normalized.includes("invalid email")) {
    return t.auth.invalidEmail;
  }

  if (
    normalized.includes("password should be at least") ||
    normalized.includes("at least 6 characters")
  ) {
    return t.auth.passwordMinLength;
  }

  if (
    normalized.includes("session") &&
    (normalized.includes("expired") || normalized.includes("invalid"))
  ) {
    return t.auth.resetLinkExpired;
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return t.auth.rateLimited;
  }

  return t.auth.genericError;
}

export function splitFullName(fullName: string): {
  first_name: string;
  last_name: string;
} {
  const trimmed = fullName.trim();
  if (!trimmed) return { first_name: "", last_name: "" };

  const space = trimmed.indexOf(" ");
  if (space === -1) {
    return { first_name: trimmed, last_name: "" };
  }

  return {
    first_name: trimmed.slice(0, space).trim(),
    last_name: trimmed.slice(space + 1).trim(),
  };
}

export function buildAuthHref(path: string, redirect: string): string {
  if (!redirect || redirect === "/dashboard") {
    return path;
  }
  return `${path}?redirect=${encodeURIComponent(redirect)}`;
}
