import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { canManageListings } from "@/lib/admin-access";
import type { ProfileChange } from "@/lib/types/profile";

async function assertAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return canManageListings(user?.id);
}

export async function GET() {
  if (!(await assertAdminAccess())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("profile_changes")
      .select("*")
      .order("changed_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data ?? []) as ProfileChange[]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
