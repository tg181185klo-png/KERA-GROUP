import { createClient, createServiceClient } from "@/lib/supabase/server";
import { canManageListings } from "@/lib/admin-access";
import { publicStatusFilter } from "@/lib/listing-status";
import { lookupCadastralParcel } from "@/lib/cadastral-lookup";
import { isValidCadastralCode, formatCadastralCode } from "@/lib/cadastral";
import { insertPropertyListing } from "@/lib/listings-insert";
import { normalizeToAdminListingFull } from "@/lib/property-normalize";
import { fetchUserDashboardListings } from "@/lib/user-listings";
import { getProfile } from "@/lib/auth";
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
    if (!(await canManageListings(user?.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const serviceClient = createServiceClient();
    const [{ data, error }, { data: profiles }] = await Promise.all([
      serviceClient
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false }),
      serviceClient.from("profiles").select("id, email"),
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const emailByUserId = new Map(
      (profiles ?? []).map((p) => [String(p.id), String(p.email ?? "")]),
    );

    return NextResponse.json(
      (data ?? []).map((row) => ({
        ...normalizeToAdminListingFull(row),
        user_email: emailByUserId.get(String(row.user_id)) ?? "",
      })),
    );
  }

  if (mine) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const serviceClient = createServiceClient();
    const profile = await getProfile(user.id);
    const listings = await fetchUserDashboardListings(serviceClient, user, profile);
    return NextResponse.json(listings);
  }

  const query = supabase
    .from("properties")
    .select("*")
    .in("status", publicStatusFilter())
    .order("created_at", { ascending: false });

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

  if (body.cadastral_code && isValidCadastralCode(body.cadastral_code)) {
    const parcel = await lookupCadastralParcel(body.cadastral_code);
    if (parcel) {
      body.cadastral_code = parcel.cadastral_code;
      body.latitude = parcel.latitude;
      body.longitude = parcel.longitude;
      body.geojson_polygon = parcel.geojson_polygon;
      if (parcel.address && !body.address) {
        body.address = parcel.address;
      }
    } else {
      body.cadastral_code = formatCadastralCode(body.cadastral_code);
    }
  }

  const { data, error } = await insertPropertyListing(user, body);

  if (error) {
    const hint = isSchemaHint(error.message)
      ? " Supabase-ში გაუშვი SQL: supabase/FIX-RUN-THIS.sql"
      : "";
    return NextResponse.json(
      { error: `${error.message}${hint}` },
      { status: 400 },
    );
  }

  return NextResponse.json(data, { status: 201 });
}

function isSchemaHint(message: string) {
  const m = message.toLowerCase();
  return m.includes("schema cache") || m.includes("could not find");
}
