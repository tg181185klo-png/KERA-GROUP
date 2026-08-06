import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { DashboardPageContent } from "@/components/dashboard/DashboardPageContent";
import {
  sanitizePropertyRowForClient,
  type PropertyRow,
} from "@/lib/property-normalize";
import { fetchUserDashboardListings } from "@/lib/user-listings";

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
    const rows = await fetchUserDashboardListings(service, user, profile, supabase);
    listings = rows.map(sanitizePropertyRowForClient);
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
