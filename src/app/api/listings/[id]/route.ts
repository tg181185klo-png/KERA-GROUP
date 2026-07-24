import { createServiceClient } from "@/lib/supabase/server";
import { canManageListings } from "@/lib/admin-access";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const service = createServiceClient();

  const { data, error } = await service
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = await canManageListings(user?.id);
  const service = createServiceClient();

  const { data: existing } = await service
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!admin) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isOwner =
      existing.user_id === user.id ||
      existing.owner_email === user.email;

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending listings can be edited" },
        { status: 403 },
      );
    }
  }

  const body = await request.json();
  const updates =
    admin && body.status != null
      ? { status: body.status }
      : body;

  const { data, error } = await service
    .from("properties")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = await canManageListings(user?.id);
  if (!admin && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!admin) {
    const service = createServiceClient();
    const { data: existing } = await service
      .from("properties")
      .select("user_id, owner_email, status")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwner =
      existing.user_id === user!.id ||
      existing.owner_email === user!.email;

    if (!isOwner || existing.status !== "pending") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const service = createServiceClient();
  const { error } = await service.from("properties").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
