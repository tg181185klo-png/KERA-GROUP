import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { normalizeToAdminListingFull } from "@/lib/property-normalize";

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

  let initialListings: (ReturnType<typeof normalizeToAdminListingFull> & {
    user_email?: string;
    price_per_sqm: number | null;
  })[] = [];

  try {
    const serviceClient = createServiceClient();
    const [{ data: allListings, error }, { data: profiles }] = await Promise.all([
      serviceClient
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false }),
      serviceClient.from("profiles").select("id, email"),
    ]);

    if (error) {
      console.error("Admin listings fetch failed:", error.message);
    } else {
      const emailByUserId = new Map(
        (profiles ?? []).map((p) => [String(p.id), String(p.email ?? "")]),
      );
      initialListings = (allListings ?? []).map((row) => ({
        ...normalizeToAdminListingFull(row),
        user_email: emailByUserId.get(String(row.user_id)) ?? "",
      }));
    }
  } catch (error) {
    console.error("Admin listings fetch failed:", error);
  }

  return (
    <AdminPageContent initialListings={initialListings} />
  );
}
