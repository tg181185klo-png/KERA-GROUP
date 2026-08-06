import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/profile";
import {
  fetchListingsByOwnerEmail,
  type PropertyRow,
} from "@/lib/property-normalize";

function isMissingColumnError(message: string, column: string): boolean {
  return new RegExp(`Could not find the '${column}' column`, "i").test(message);
}

function isMissingRpcError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("get_dashboard_listings") &&
    (m.includes("could not find") || m.includes("does not exist") || m.includes("schema cache"))
  );
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

function namesMatch(
  ownerName: string | null | undefined,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): boolean {
  const owner = String(ownerName ?? "").trim().toLowerCase();
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim().toLowerCase();
  return owner.length > 0 && full.length > 0 && owner === full;
}

function listingPhone(row: PropertyRow): string {
  return String(row.phone_number ?? row.owner_phone ?? "");
}

/** Whether a property row belongs to the signed-in user (user_id, email, phone, or name). */
export function isListingOwnedByUser(
  row: PropertyRow,
  user: Pick<User, "id" | "email">,
  profile?: Pick<Profile, "phone" | "first_name" | "last_name"> | null,
): boolean {
  if (row.user_id && String(row.user_id) === user.id) return true;
  if (emailsMatch(String(row.owner_email ?? ""), user.email)) return true;

  const profilePhone = profile?.phone ?? "";
  const phone = listingPhone(row);
  if (profilePhone && phonesMatch(phone, profilePhone)) return true;

  if (
    namesMatch(
      String(row.owner_name ?? ""),
      profile?.first_name,
      profile?.last_name,
    )
  ) {
    return true;
  }

  const modernOwner = `${row.owner_first_name ?? ""} ${row.owner_last_name ?? ""}`.trim();
  if (namesMatch(modernOwner, profile?.first_name, profile?.last_name)) {
    return true;
  }

  return false;
}

async function fetchListingsByUserId(
  client: SupabaseClient,
  userId: string,
): Promise<PropertyRow[]> {
  const { data, error } = await client
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
  client: SupabaseClient,
  phone: string,
): Promise<PropertyRow[]> {
  const digits = normalizePhoneDigits(phone);
  if (digits.length < 9) return [];

  const pattern = `%${digits}%`;
  const queries = await Promise.all([
    client
      .from("properties")
      .select("*")
      .ilike("owner_phone", pattern)
      .order("created_at", { ascending: false }),
    client
      .from("properties")
      .select("*")
      .ilike("phone_number", pattern)
      .order("created_at", { ascending: false }),
  ]);

  const merged = new Map<string, PropertyRow>();

  for (const { data, error } of queries) {
    if (error) {
      if (
        isMissingColumnError(error.message, "owner_phone") ||
        isMissingColumnError(error.message, "phone_number")
      ) {
        continue;
      }
      throw new Error(error.message);
    }

    for (const row of (data ?? []) as PropertyRow[]) {
      if (phonesMatch(listingPhone(row), phone)) {
        merged.set(String(row.id), row);
      }
    }
  }

  return Array.from(merged.values());
}

async function fetchListingsByOwnerName(
  client: SupabaseClient,
  firstName: string,
  lastName: string,
): Promise<PropertyRow[]> {
  const full = `${firstName} ${lastName}`.trim();
  if (!full) return [];

  const { data, error } = await client
    .from("properties")
    .select("*")
    .ilike("owner_name", full)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingColumnError(error.message, "owner_name")) {
      return [];
    }
    throw new Error(error.message);
  }

  return ((data ?? []) as PropertyRow[]).filter((row) =>
    namesMatch(String(row.owner_name ?? ""), firstName, lastName),
  );
}

async function fetchListingsViaRpc(
  authClient: SupabaseClient,
  userId: string,
): Promise<PropertyRow[] | null> {
  const { data, error } = await authClient.rpc("get_dashboard_listings", {
    p_user_id: userId,
  });

  if (error) {
    if (isMissingRpcError(error.message)) {
      return null;
    }
    throw new Error(error.message);
  }

  return (data ?? []) as PropertyRow[];
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

async function syncProfilePhoneFromListings(
  service: SupabaseClient,
  userId: string,
  profile: Pick<Profile, "phone"> | null | undefined,
  listings: PropertyRow[],
): Promise<void> {
  if (profile?.phone?.trim()) return;

  const phone = listings.map(listingPhone).find((value) => normalizePhoneDigits(value).length >= 9);
  if (!phone) return;

  const { error } = await service
    .from("profiles")
    .update({ phone: phone.trim() })
    .eq("id", userId)
    .is("phone", null);

  if (error) {
    console.warn("Profile phone sync failed:", error.message);
  }
}

function mergeOwnedListings(
  rows: PropertyRow[],
  user: Pick<User, "id" | "email">,
  profile?: Pick<Profile, "phone" | "first_name" | "last_name"> | null,
): PropertyRow[] {
  const merged = new Map<string, PropertyRow>();

  for (const row of rows) {
    if (isListingOwnedByUser(row, user, profile)) {
      merged.set(String(row.id), row);
    }
  }

  return Array.from(merged.values()).sort((a, b) => {
    const aTime = Date.parse(String(a.created_at ?? 0));
    const bTime = Date.parse(String(b.created_at ?? 0));
    return bTime - aTime;
  });
}

/** Fetch all listings for a registered user, including legacy rows without user_id. */
export async function fetchUserDashboardListings(
  service: SupabaseClient,
  user: Pick<User, "id" | "email">,
  profile?: Pick<Profile, "phone" | "first_name" | "last_name"> | null,
  authClient?: SupabaseClient,
): Promise<PropertyRow[]> {
  const email = user.email ?? "";
  const profilePhone = profile?.phone ?? "";
  const firstName = profile?.first_name ?? "";
  const lastName = profile?.last_name ?? "";

  if (authClient) {
    try {
      const rpcRows = await fetchListingsViaRpc(authClient, user.id);
      if (rpcRows) {
        await backfillUserId(service, user.id, rpcRows);
        await syncProfilePhoneFromListings(service, user.id, profile, rpcRows);
        return rpcRows;
      }
    } catch (error) {
      console.warn("Dashboard RPC fetch failed, falling back:", error);
    }
  }

  const phoneCandidates = new Set<string>();
  if (profilePhone) phoneCandidates.add(profilePhone);

  const [byUserId, byEmail, byPhone, byName] = await Promise.all([
    fetchListingsByUserId(authClient ?? service, user.id),
    fetchListingsByOwnerEmail(authClient ?? service, email),
    profilePhone
      ? fetchListingsByPhone(authClient ?? service, profilePhone)
      : Promise.resolve([]),
    firstName || lastName
      ? fetchListingsByOwnerName(authClient ?? service, firstName, lastName)
      : Promise.resolve([]),
  ]);

  for (const row of [...byEmail, ...byPhone, ...byName]) {
    const phone = listingPhone(row);
    if (normalizePhoneDigits(phone).length >= 9) {
      phoneCandidates.add(phone);
    }
  }

  let byDiscoveredPhone: PropertyRow[] = [];
  if (!profilePhone && phoneCandidates.size > 0) {
    const extra = await Promise.all(
      Array.from(phoneCandidates).map((phone) =>
        fetchListingsByPhone(authClient ?? service, phone),
      ),
    );
    byDiscoveredPhone = extra.flat();
  }

  const listings = mergeOwnedListings(
    [...byUserId, ...byEmail, ...byPhone, ...byName, ...byDiscoveredPhone],
    user,
    profile,
  );

  await backfillUserId(service, user.id, listings);
  await syncProfilePhoneFromListings(service, user.id, profile, listings);

  return listings;
}
