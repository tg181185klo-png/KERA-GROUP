import type { SupabaseClient } from "@supabase/supabase-js";

/** Days a listing stays on the map after admin approval. */
export const MAP_VISIBLE_DAYS = 30;

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function parseTimestamp(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getMapExpiresAt(approvedAt: Date): Date {
  return addDays(approvedAt, MAP_VISIBLE_DAYS);
}

export function getListingMapExpiresAt(row: Record<string, unknown>): Date | null {
  const explicit = parseTimestamp(row.map_expires_at);
  if (explicit) return explicit;

  const approved = parseTimestamp(row.approved_at);
  if (approved) return getMapExpiresAt(approved);

  return null;
}

export function isActiveListingStatus(status: unknown): boolean {
  return status === "active" || status === "approved";
}

/** True when listing is approved and still within the 30-day map window. */
export function isListingMapPeriodActive(row: Record<string, unknown>): boolean {
  if (!isActiveListingStatus(row.status)) return false;

  const expires = getListingMapExpiresAt(row);
  if (!expires) {
    // Legacy rows without expiry metadata — visible until backfill/cron runs.
    return true;
  }

  return expires.getTime() > Date.now();
}

/** Owner edit sends listing back to moderation only when not currently on the map. */
export function shouldRequireModerationOnEdit(row: Record<string, unknown>): boolean {
  const status = String(row.status ?? "");

  if (status === "expired") return true;
  if (status === "pending") return true;
  if (status === "blocked" || status === "archived") return false;

  if (isActiveListingStatus(status)) {
    return !isListingMapPeriodActive(row);
  }

  return true;
}

export function buildApprovalTimestamps(): {
  approved_at: string;
  map_expires_at: string;
} {
  const now = new Date();
  return {
    approved_at: now.toISOString(),
    map_expires_at: getMapExpiresAt(now).toISOString(),
  };
}

export async function expireStaleMapListings(service: SupabaseClient): Promise<void> {
  const now = new Date().toISOString();

  await service
    .from("properties")
    .update({ status: "expired" })
    .eq("status", "active")
    .not("map_expires_at", "is", null)
    .lt("map_expires_at", now);
}
