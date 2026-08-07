import { createServiceClient } from "@/lib/supabase/server";
import { canManageListings } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminProfiles } from "@/lib/admin-users";
import { NextResponse } from "next/server";

async function assertAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!(await canManageListings(user?.id))) {
    return false;
  }
  return true;
}

export async function GET() {
  if (!(await assertAdminAccess())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const service = createServiceClient();
    const profiles = await fetchAdminProfiles(service);
    return NextResponse.json(profiles);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Users fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await assertAdminAccess())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const service = createServiceClient();

  const { data, error } = await service
    .from("profiles")
    .update(body.updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
