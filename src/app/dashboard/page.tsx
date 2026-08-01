import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { DashboardPageContent } from "@/components/dashboard/DashboardPageContent";
import {
  fetchListingsByOwnerEmail,
  sanitizePropertyRowForClient,
  type PropertyRow,
} from "@/lib/property-normalize";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; edited?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let profile = null;
  let listings: PropertyRow[] = [];

  try {
    profile = await getProfile(user.id);
    const service = createServiceClient();

    const { data: byUserId, error: byUserError } = await service
      .from("properties")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (byUserError) {
      throw new Error(byUserError.message);
    }

    const byEmail = await fetchListingsByOwnerEmail(service, user.email ?? "");

    const merged = new Map<string, PropertyRow>();
    for (const row of [...(byUserId ?? []), ...byEmail]) {
      merged.set(String(row.id), row as PropertyRow);
    }
    listings = Array.from(merged.values()).map(sanitizePropertyRowForClient);
  } catch (error) {
    console.error("Dashboard listings fetch failed:", error);
    listings = [];
  }

  return (
    <DashboardPageContent
      profile={profile}
      listings={listings}
      submittedPending={params.submitted === "pending"}
      editedListing={params.edited === "1"}
    />
  );
}
