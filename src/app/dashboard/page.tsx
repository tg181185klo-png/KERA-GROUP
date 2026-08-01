import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { DashboardPageContent } from "@/components/dashboard/DashboardPageContent";
import { type PropertyRow } from "@/lib/property-normalize";

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

  const profile = await getProfile(user.id);
  const service = createServiceClient();

  const email = user.email ?? "";
  const { data: byUserId } = await service
    .from("properties")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: byEmail } = email
    ? await service
        .from("properties")
        .select("*")
        .eq("owner_email", email)
        .order("created_at", { ascending: false })
    : { data: [] };

  const merged = new Map<string, PropertyRow>();
  for (const row of [...(byUserId ?? []), ...(byEmail ?? [])]) {
    merged.set(String(row.id), row as PropertyRow);
  }
  const listings = Array.from(merged.values());

  return (
    <DashboardPageContent
      profile={profile}
      listings={listings}
      submittedPending={params.submitted === "pending"}
      editedListing={params.edited === "1"}
    />
  );
}
