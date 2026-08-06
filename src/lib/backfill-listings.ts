import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/profile";
import type { PropertyRow } from "@/lib/property-normalize";
import {
  isListingOwnedByUser,
  normalizePhoneDigits,
} from "@/lib/user-listings";

function listingPhone(row: PropertyRow): string {
  return String(row.phone_number ?? row.owner_phone ?? "");
}

function resolveOwnerUserId(
  row: PropertyRow,
  profiles: Profile[],
): string | null {
  for (const profile of profiles) {
    if (
      isListingOwnedByUser(
        row,
        { id: profile.id, email: profile.email },
        profile,
      )
    ) {
      return profile.id;
    }
  }
  return null;
}

export type BackfillListingsResult = {
  scanned: number;
  linked: number;
  alreadyLinked: number;
  unmatched: number;
  errors: string[];
};

/** Link orphan listings to profiles by email, phone, or owner name. */
export async function backfillAllListingUserIds(
  service: SupabaseClient,
): Promise<BackfillListingsResult> {
  const result: BackfillListingsResult = {
    scanned: 0,
    linked: 0,
    alreadyLinked: 0,
    unmatched: 0,
    errors: [],
  };

  const [{ data: properties, error: propertiesError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      service.from("properties").select("*").order("created_at", { ascending: false }),
      service.from("profiles").select("*"),
    ]);

  if (propertiesError) {
    result.errors.push(propertiesError.message);
    return result;
  }

  if (profilesError) {
    result.errors.push(profilesError.message);
    return result;
  }

  const profileList = (profiles ?? []) as Profile[];
  const rows = (properties ?? []) as PropertyRow[];
  result.scanned = rows.length;

  for (const row of rows) {
    if (row.user_id) {
      result.alreadyLinked += 1;
      continue;
    }

    const userId = resolveOwnerUserId(row, profileList);
    if (!userId) {
      result.unmatched += 1;
      continue;
    }

    const { error } = await service
      .from("properties")
      .update({ user_id: userId })
      .eq("id", String(row.id))
      .is("user_id", null);

    if (error) {
      if (error.message.toLowerCase().includes("user_id")) {
        result.errors.push("user_id column missing on properties table");
        break;
      }
      result.errors.push(`${String(row.id)}: ${error.message}`);
      continue;
    }

    result.linked += 1;

    const phone = listingPhone(row);
    const profile = profileList.find((item) => item.id === userId);
    if (profile && !profile.phone?.trim() && normalizePhoneDigits(phone).length >= 9) {
      await service
        .from("profiles")
        .update({ phone: phone.trim() })
        .eq("id", userId)
        .is("phone", null);
      profile.phone = phone.trim();
    }
  }

  return result;
}
