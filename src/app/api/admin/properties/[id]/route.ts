import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("kera_admin_session")?.value === "authenticated";
}

function extractStoragePath(url: string): string | null {
  try {
    const marker = "/property-images/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.slice(idx + marker.length));
  } catch {
    return null;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  const allowed = [
    "address",
    "price",
    "currency",
    "description",
    "status",
    "property_type",
    "deal_type",
    "bedrooms",
    "area_sqm",
    "images",
  ];

  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("properties")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const supabase = createAdminSupabaseClient();

    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("images")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    const imagePaths = (property.images ?? [])
      .map((url: string) => extractStoragePath(url))
      .filter(Boolean) as string[];

    if (imagePaths.length > 0) {
      await supabase.storage.from("property-images").remove(imagePaths);
    }

    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
