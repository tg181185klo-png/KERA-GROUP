import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "true";
  const adminAll = searchParams.get("admin") === "true";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (adminAll) {
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  let query = supabase.from("properties").select("*").order("created_at", {
    ascending: false,
  });

  if (mine) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    query = query.eq("user_id", user.id);
  } else {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("properties")
    .insert({
      user_id: user.id,
      title: body.title,
      description: body.description ?? "",
      cadastral_code: body.cadastral_code,
      owner_first_name: body.owner_first_name,
      owner_last_name: body.owner_last_name,
      address: body.address,
      phone_number: body.phone_number,
      total_price: body.total_price,
      area_sqm: body.area_sqm,
      listing_type: body.listing_type,
      latitude: body.latitude,
      longitude: body.longitude,
      geojson_polygon: body.geojson_polygon,
      images: body.images ?? [],
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
