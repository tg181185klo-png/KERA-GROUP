import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, ProfileFormData, ProfileField } from "@/lib/types/profile";
import { normalizePhoneDigits } from "@/lib/user-listings";

const TRACKED_FIELDS: ProfileField[] = ["first_name", "last_name", "phone"];

export function normalizeProfilePhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";
  const digits = normalizePhoneDigits(trimmed);
  if (digits.length < 9) return trimmed;
  return digits;
}

export function validateProfileForm(data: ProfileFormData): string | null {
  if (!data.first_name.trim()) return "სახელი სავალდებულოა";
  if (!data.last_name.trim()) return "გვარი სავალდებულოა";
  if (data.phone.trim()) {
    const digits = normalizePhoneDigits(data.phone);
    if (digits.length < 9) return "ტელეფონის ნომერი არასწორია";
  }
  return null;
}

function fieldValue(profile: Profile, field: ProfileField): string {
  if (field === "phone") return profile.phone ?? "";
  return profile[field] ?? "";
}

export async function updateUserProfile(
  service: SupabaseClient,
  userId: string,
  current: Profile,
  input: ProfileFormData,
): Promise<Profile> {
  const next = {
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    phone: normalizeProfilePhone(input.phone) || null,
  };

  const changeRows: Array<{
    user_id: string;
    field: ProfileField;
    old_value: string | null;
    new_value: string | null;
    changed_by: string;
  }> = [];

  for (const field of TRACKED_FIELDS) {
    const oldValue = fieldValue(current, field);
    const newValue = field === "phone" ? (next.phone ?? "") : next[field];
    if (oldValue === newValue) continue;

    changeRows.push({
      user_id: userId,
      field,
      old_value: oldValue || null,
      new_value: newValue || null,
      changed_by: userId,
    });
  }

  if (changeRows.length === 0) {
    return current;
  }

  const { data: updated, error: updateError } = await service
    .from("profiles")
    .update({
      first_name: next.first_name,
      last_name: next.last_name,
      phone: next.phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: historyError } = await service
    .from("profile_changes")
    .insert(changeRows);

  if (historyError) {
    throw new Error(historyError.message);
  }

  return updated as Profile;
}
