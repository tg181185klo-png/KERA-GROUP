import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/profile";
import {
  fetchListingsByOwnerEmail,
  type PropertyRow,
} from "@/lib/property-normalize";

function isMissingColumnError(message: string, column: string): boolean {
  return new RegExp(`Could not find the '${column}' column`, "i").test(message);
}

/** Normalize phone to last 9 digits for Georgian mobile matching. */
export function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 9) return digits;
  return digits.slice(-9);
}

function emailsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function phonesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const da = normalizePhoneDigits(String(a ?? ""));
  const db = normalizePhoneDigits(String(b ?? ""));
  return da.length >= 9 && db.length >= 9 && da === db;
}

function listingPhone(row: PropertyRow): string {
  return String(row.phone_number ?? row.owner_phone ?? "");
}

/** Whether a property row belongs to the signed-in user (user_id, email, or phone). */
export function isListingOwnedByUser(
  row: PropertyRow,
  user: Pick<User, "id" | "email">,
  profile?: Pick<Profile, "phone"> | null,
): boolean {
  if (row.user_id && String(row.user_id) === user.id) return true;
  if (emailsMatch(String(row.owner_email ?? ""), user.email)) return true;

  const profilePhone = profile?.phone ?? "";
  const phone = listingPhone(row);
  if (profilePhone && phonesMatch(phone, profilePhone)) return true;

  return false;
}

async function fetchListingsByUserId(
  service: SupabaseClient,
  userId: string,
): Promise<PropertyRow[]> {
  const { data, error } = await service
    .from("properties")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingColumnError(error.message, "user_id")) {
      return [];
    }
    throw new Error(error.message);
  }

  return (data ?? []) as PropertyRow[];
}

async function fetchListingsByPhone(
  service: SupabaseClient,
  phone: string,
): Promise<PropertyRow[]> {
  const digits = normalizePhoneDigits(phone);
  if (digits.length < 9) return [];

  const pattern = `%${digits}%`;
  const { data, error } = await service
    .from("properties")
    .select("*")
    .or(`owner_phone.ilike.${pattern},phone_number.ilike.${pattern}`)
    .order("created_at", { ascending: false });

  if (error) {
    const missingOwnerPhone = isMissingColumnError(error.message, "owner_phone");
    const missingPhoneNumber = isMissingColumnError(error.message, "phone_number");
    if (missingOwnerPhone || missingPhoneNumber) {
      const column = missingOwnerPhone ? "owner_phone" : "phone_number";
      const { data: fallback, error: fallbackError } = await service
        .from("properties")
        .select("*")
        .ilike(column, pattern)
        .order("created_at", { ascending: false });

      if (fallbackError) {
        if (isMissingColumnError(fallbackError.message, column)) return [];
        throw new Error(fallbackError.message);
      }

      return ((fallback ?? []) as PropertyRow[]).filter((row) =>
        phonesMatch(listingPhone(row), phone),
      );
    }
    throw new Error(error.message);
  }

  return ((data ?? []) as PropertyRow[]).filter((row) =>
    phonesMatch(listingPhone(row), phone),
  );
}

async function backfillUserId(
  service: SupabaseClient,
  userId: string,
  rows: PropertyRow[],
): Promise<void> {
  const orphanIds = rows
    .filter((row) => !row.user_id)
    .map((row) => String(row.id));

  if (!orphanIds.length) return;

  const { error } = await service
    .from("properties")
    .update({ user_id: userId })
    .in("id", orphanIds)
    .is("user_id", null);

  if (error && !isMissingColumnError(error.message, "user_id")) {
    console.warn("Listing user_id backfill failed:", error.message);
  }
}

/** Fetch all listings for a registered user, including legacy rows without user_id. */
export async function fetchUserDashboardListings(
  service: SupabaseClient,
  user: Pick<User, "id" | "email">,
  profile?: Pick<Profile, "phone"> | null,
): Promise<PropertyRow[]> {
  const email = user.email ?? "";
  const profilePhone = profile?.phone ?? "";

  const [byUserId, byEmail, byPhone] = await Promise.all([
    fetchListingsByUserId(service, user.id),
    fetchListingsByOwnerEmail(service, email),
    profilePhone ? fetchListingsByPhone(service, profilePhone) : Promise.resolve([]),
  ]);

  const merged = new Map<string, PropertyRow>();

  for (const row of [...byUserId, ...byEmail, ...byPhone]) {
    if (isListingOwnedByUser(row, user, profile)) {
      merged.set(String(row.id), row);
    }
  }

  const listings = Array.from(merged.values()).sort((a, b) => {
    const aTime = Date.parse(String(a.created_at ?? 0));
    const bTime = Date.parse(String(b.created_at ?? 0));
    return bTime - aTime;
  });

  await backfillUserId(service, user.id, listings);

  return listings;
}
