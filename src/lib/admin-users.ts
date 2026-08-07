import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/profile";

/** Ensure every auth.users row has a matching profiles row. */
export async function syncProfilesFromAuth(
  service: SupabaseClient,
): Promise<void> {
  const authUsers: Array<{
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  }> = [];

  let page = 1;
  const perPage = 200;

  while (page <= 20) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(error.message);
    }

    authUsers.push(...(data.users ?? []));
    if ((data.users ?? []).length < perPage) break;
    page += 1;
  }

  if (!authUsers.length) return;

  const rows = authUsers.map((user) => ({
    id: user.id,
    email: user.email ?? "",
    first_name: String(user.user_metadata?.first_name ?? ""),
    last_name: String(user.user_metadata?.last_name ?? ""),
  }));

  const { error: upsertError } = await service.from("profiles").upsert(rows, {
    onConflict: "id",
  });

  if (upsertError) {
    throw new Error(upsertError.message);
  }
}

export async function fetchAdminProfiles(
  service: SupabaseClient,
): Promise<Profile[]> {
  await syncProfilesFromAuth(service);

  const { data, error } = await service
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Profile[];
}

export type UserListingStats = {
  total: number;
  pending: number;
  active: number;
  blocked: number;
};

export function buildUserListingStats(
  listings: {
    user_id?: string | null;
    owner_email?: string | null;
    user_email?: string | null;
    status?: string | null;
  }[],
  profiles: Profile[],
): Map<string, UserListingStats> {
  const emailToUserId = new Map(
    profiles.map((profile) => [profile.email.trim().toLowerCase(), profile.id]),
  );

  const stats = new Map<string, UserListingStats>();

  for (const profile of profiles) {
    stats.set(profile.id, { total: 0, pending: 0, active: 0, blocked: 0 });
  }

  for (const listing of listings) {
    const listingEmail = String(
      listing.user_email ?? listing.owner_email ?? "",
    )
      .trim()
      .toLowerCase();

    const userId =
      (listing.user_id && String(listing.user_id)) ||
      (listingEmail ? emailToUserId.get(listingEmail) : undefined) ||
      "";

    if (!userId) continue;

    const current = stats.get(userId) ?? { total: 0, pending: 0, active: 0, blocked: 0 };
    current.total += 1;
    const status = String(listing.status ?? "pending");
    if (status === "active" || status === "approved") current.active += 1;
    else if (status === "blocked" || status === "archived") current.blocked += 1;
    else current.pending += 1;
    stats.set(userId, current);
  }

  return stats;
}
