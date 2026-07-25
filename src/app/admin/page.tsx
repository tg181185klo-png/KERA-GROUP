import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { normalizeToAdminListing } from "@/lib/property-normalize";
import { AdminListingsPanel } from "@/components/admin/AdminListingsPanel";

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

  // Fetch all listings for admin via service client
  const serviceClient = createServiceClient();
  const { data: allListings } = await serviceClient
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="kera-container py-10 sm:py-12 lg:py-14">
      <h1 className="kera-page-header mb-2">ადმინ პანელი</h1>
      <p className="mb-8 text-sm leading-relaxed text-slate-500 sm:text-base">
        მომხმარებლებისა და განცხადებების მართვა
      </p>
      <AdminListingsPanel
        initialListings={(allListings ?? []).map(normalizeToAdminListing)}
      />
    </div>
  );
}
