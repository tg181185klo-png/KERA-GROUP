import { downloadCsv } from "@/lib/export-csv";
import type { Profile } from "@/lib/types/profile";
import type { UserListingStats } from "@/lib/admin-users";
import type { ListingExportRow } from "@/lib/export-listings";
import {
  DEAL_TYPE_LABELS,
  LISTING_STATUS_LABELS,
} from "@/lib/types/property-listing";

export function exportUsersToExcel(
  users: Profile[],
  statsByUserId: Map<string, UserListingStats>,
): void {
  if (users.length === 0) return;

  downloadCsv(
    `kera-users-${new Date().toISOString().slice(0, 10)}.csv`,
    [
      "ID",
      "სახელი",
      "გვარი",
      "ელ-ფოსტა",
      "ტელეფონი",
      "როლი",
      "სტატუსი",
      "განცხადები (სულ)",
      "მოლოდინში",
      "აქტიური",
      "დაბლოკილი",
      "რეგისტრაცია",
    ],
    users.map((user) => {
      const stats = statsByUserId.get(user.id) ?? {
        total: 0,
        pending: 0,
        active: 0,
        blocked: 0,
      };

      return [
        user.id,
        user.first_name,
        user.last_name,
        user.email,
        user.phone ?? "",
        user.role,
        user.is_blocked ? "დაბლოკილი" : "აქტიური",
        stats.total,
        stats.pending,
        stats.active,
        stats.blocked,
        new Date(user.created_at).toLocaleString("ka-GE"),
      ];
    }),
  );
}

export function exportUsersWithListingsToExcel(
  users: Profile[],
  listings: ListingExportRow[],
): void {
  if (listings.length === 0) {
    exportUsersToExcel(users, new Map());
    return;
  }

  const usersById = new Map(users.map((user) => [user.id, user]));
  const usersByEmail = new Map(
    users.map((user) => [user.email.trim().toLowerCase(), user]),
  );

  downloadCsv(
    `kera-users-listings-${new Date().toISOString().slice(0, 10)}.csv`,
    [
      "user_id",
      "მომხმარებელი (სახელი)",
      "მომხმარებელი (გვარი)",
      "მომხმარებლის ელ-ფოსტა",
      "მომხმარებლის ტელეფონი",
      "განცხადის ID",
      "სათაური",
      "აღწერა",
      "კად. კოდი",
      "მფლობელი (სახელი)",
      "მფლობელი (გვარი)",
      "მისამართი",
      "ტელეფონი (განცხადა)",
      "ფასი (USD)",
      "ფართობი (მ²)",
      "გარიგების ტიპი",
      "სტატუსი",
      "ფოტოები",
      "შექმნა",
    ],
    listings.map((item) => {
      const profile =
        usersById.get(item.user_id) ||
        usersByEmail.get(String(item.user_email ?? "").trim().toLowerCase());

      return [
        profile?.id ?? item.user_id,
        profile?.first_name ?? item.owner_first_name,
        profile?.last_name ?? item.owner_last_name,
        profile?.email ?? item.user_email ?? "",
        profile?.phone ?? "",
        item.id,
        item.title,
        item.description,
        item.cadastral_code,
        item.owner_first_name,
        item.owner_last_name,
        item.address,
        item.phone_number,
        item.total_price,
        item.area_sqm,
        item.deal_type
          ? (DEAL_TYPE_LABELS[item.deal_type] ?? item.deal_type)
          : "",
        LISTING_STATUS_LABELS[item.status] ?? item.status,
        item.images.join("; "),
        item.created_at
          ? new Date(item.created_at).toLocaleString("ka-GE")
          : "",
      ];
    }),
  );
}
