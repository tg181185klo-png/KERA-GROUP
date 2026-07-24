import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/utils/supabase";

function parseMissingColumn(message: string): string | null {
  const match = message.match(/Could not find the '([^']+)' column/i);
  return match?.[1] ?? null;
}

function isSchemaMismatch(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("schema cache") ||
    m.includes("could not find") ||
    m.includes("column") ||
    m.includes("does not exist")
  );
}

async function insertAdaptive(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  payload: Record<string, unknown>,
) {
  let current = { ...payload };
  let lastError: { message: string } | null = null;

  for (let attempt = 0; attempt < 15; attempt++) {
    const { data, error } = await supabase
      .from("properties")
      .insert(current)
      .select()
      .single();

    if (!error) {
      return { data, error: null };
    }

    lastError = error;
    const missing = parseMissingColumn(error.message);
    if (!missing || !isSchemaMismatch(error.message)) {
      return { data: null, error };
    }

    delete current[missing];
    if (Object.keys(current).length === 0) {
      break;
    }
  }

  return { data: null, error: lastError };
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const supabase = createAdminSupabaseClient();

    const payload: Record<string, unknown> = {
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
      features: body.features ?? [],
      listing_type: body.listing_type ?? "seller",
    };

    if (body.area_sqm) {
      payload.area_sqm = body.area_sqm;
    }

    const { data, error } = await insertAdaptive(supabase, payload);

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
