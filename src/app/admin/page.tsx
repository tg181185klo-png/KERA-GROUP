import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { normalizeToAdminListing } from "@/lib/property-normalize";

export default async function AdminPage() {
  const legacyAdmin = await isAdminAuthenticated();

  let supabaseAdmin = false;
  if (!legacyAdmin) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    supabaseAdmin = user ? await isAdmin(user.id) : false;
  }

  if (!supabaseAdmin && !legacyAdmin) {
    return <AdminLoginGate />;
  }

  let initialListings: ReturnType<typeof normalizeToAdminListing>[] = [];

  try {
    const serviceClient = createServiceClient();
    const { data: allListings, error } = await serviceClient
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin listings fetch failed:", error.message);
    } else {
      initialListings = (allListings ?? []).map(normalizeToAdminListing);
    }
  } catch (error) {
    console.error("Admin listings fetch failed:", error);
  }

  return (
    <AdminPageContent initialListings={initialListings} />
  );
}
