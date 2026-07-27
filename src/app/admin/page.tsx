import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { normalizeToAdminListing } from "@/lib/property-normalize";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const supabaseAdmin = user ? await isAdmin(user.id) : false;
  const legacyAdmin = await isAdminAuthenticated();

  if (!supabaseAdmin && !legacyAdmin) {
    return <AdminLoginGate />;
  }

  const serviceClient = createServiceClient();
  const { data: allListings } = await serviceClient
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminPageContent
      initialListings={(allListings ?? []).map(normalizeToAdminListing)}
    />
  );
}
