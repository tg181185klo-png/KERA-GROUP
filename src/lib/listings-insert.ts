import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type ListingBody = {
  title?: string;
  description?: string;
  cadastral_code?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  address: string;
  phone_number?: string;
  total_price: number;
  area_sqm?: number;
  listing_type?: string;
  latitude?: number | null;
  longitude?: number | null;
  geojson_polygon?: unknown;
  images?: string[];
};

function isSchemaMismatch(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("schema cache") ||
    m.includes("could not find") ||
    m.includes("column") ||
    m.includes("does not exist")
  );
}

async function ensureProfile(user: User, service: SupabaseClient) {
  try {
    await service.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        first_name: (user.user_metadata?.first_name as string | undefined) ?? "",
        last_name: (user.user_metadata?.last_name as string | undefined) ?? "",
      },
      { onConflict: "id" },
    );
  } catch {
    // profiles table may not exist yet — legacy insert still works
  }
}

function buildLegacyDescription(body: ListingBody) {
  const parts = [
    body.title,
    body.description,
    body.cadastral_code ? `კადასტრი: ${body.cadastral_code}` : null,
  ].filter(Boolean);
  return parts.join("\n") || body.address;
}

async function insertLegacyListing(
  service: SupabaseClient,
  user: User,
  body: ListingBody,
) {
  const ownerName =
    [body.owner_first_name, body.owner_last_name].filter(Boolean).join(" ").trim() ||
    "მომხმარებელი";

  const base = {
    owner_name: ownerName,
    owner_phone: body.phone_number ?? "",
    owner_email: user.email ?? null,
    address: body.address,
    property_type: "apartment",
    deal_type: body.listing_type === "rent" ? "rent" : "sale",
    price: body.total_price,
    currency: "USD",
    description: buildLegacyDescription(body),
    images: body.images ?? [],
    status: "pending",
    listing_type: "seller",
  };

  const withArea =
    body.area_sqm && body.area_sqm > 0
      ? { ...base, area_sqm: body.area_sqm }
      : base;

  let result = await service
    .from("properties")
    .insert(withArea)
    .select()
    .single();

  if (result.error && isSchemaMismatch(result.error.message) && "area_sqm" in withArea) {
    result = await service.from("properties").insert(base).select().single();
  }

  return result;
}

export async function insertPropertyListing(user: User, body: ListingBody) {
  const supabase = await createClient();
  const service = createServiceClient();

  await ensureProfile(user, service);

  const newRow = {
    user_id: user.id,
    title: body.title ?? body.address,
    description: body.description ?? "",
    cadastral_code: body.cadastral_code ?? `TEMP-${Date.now()}`,
    owner_first_name: body.owner_first_name ?? "",
    owner_last_name: body.owner_last_name ?? "",
    address: body.address,
    phone_number: body.phone_number ?? "",
    total_price: body.total_price,
    area_sqm: body.area_sqm,
    listing_type: body.listing_type ?? "sale",
    latitude: body.latitude,
    longitude: body.longitude,
    geojson_polygon: body.geojson_polygon,
    images: body.images ?? [],
    status: "pending",
  };

  const modern = await supabase.from("properties").insert(newRow).select().single();

  if (!modern.error) {
    return modern;
  }

  if (isSchemaMismatch(modern.error.message)) {
    return insertLegacyListing(service, user, body);
  }

  return modern;
}
