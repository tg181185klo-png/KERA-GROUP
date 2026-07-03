import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/utils/supabase";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("properties")
      .insert({
        owner_name: body.owner_name,
        owner_phone: body.owner_phone,
        owner_email: body.owner_email || null,
        address: body.address,
        property_type: body.property_type,
        deal_type: body.deal_type,
        price: body.price,
        currency: body.currency ?? "USD",
        description: body.description || null,
        images: body.images ?? [],
        status: "pending",
        bedrooms: body.bedrooms ?? null,
        area_sqm: body.area_sqm ?? null,
        features: body.features ?? [],
        listing_type: body.listing_type ?? "seller",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create property";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
