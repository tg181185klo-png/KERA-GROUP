import { isAdmin } from "@/lib/auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";

/** Supabase profile admin or legacy cookie admin */
export async function canManageListings(userId?: string | null) {
  if (userId && (await isAdmin(userId))) return true;
  return isAdminAuthenticated();
}
