/** Status values that appear on the public site and map. */
export const PUBLIC_LISTING_STATUSES = ["active", "approved"] as const;

export type PublicListingStatus = (typeof PUBLIC_LISTING_STATUSES)[number];

export function isPublicListingStatus(
  status: unknown,
): status is PublicListingStatus {
  return (
    typeof status === "string" &&
    PUBLIC_LISTING_STATUSES.includes(status as PublicListingStatus)
  );
}

/** Normalize legacy/alternate status values for display logic. */
export function normalizePublicStatus(status: unknown): "active" | "pending" | "blocked" {
  if (status === "active" || status === "approved") return "active";
  if (status === "blocked" || status === "archived") return "blocked";
  return "pending";
}

export function isPubliclyVisibleListing(status: unknown): boolean {
  return normalizePublicStatus(status) === "active";
}

/** DB filter for Supabase `.in("status", ...)`. */
export function publicStatusFilter(): string[] {
  // DB check constraint uses `active`; `approved` is accepted in app logic only.
  return ["active", "approved"];
}
