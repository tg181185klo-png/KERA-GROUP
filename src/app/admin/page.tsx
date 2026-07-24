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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">ადმინ პანელი</h1>
      <p className="mb-8 text-sm text-slate-500">
        მომხმარებლებისა და განცხადებების მართვა
      </p>
      <AdminListingsPanel
        initialListings={(allListings ?? []).map(normalizeToAdminListing)}
      />
    </div>
  );
}
