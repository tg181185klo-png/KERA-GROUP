import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatCadastralCode } from "@/lib/cadastral";

import type { MapDealType } from "@/lib/types/property-listing";

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
  deal_type?: MapDealType;
  latitude?: number | null;
  longitude?: number | null;
  geojson_polygon?: unknown;
  images?: string[];
};

function resolveDealType(body: ListingBody): MapDealType {
  const raw = String(body.deal_type ?? body.listing_type ?? "sale")
    .toLowerCase()
    .trim();
  if (raw === "rent") return "rent";
  if (raw === "daily_rent" || raw === "daily") return "daily_rent";
  if (raw === "pledge" || raw === "gira") return "pledge";
  return "sale";
}

function listingTypeFromDeal(dealType: MapDealType): "sale" | "rent" {
  return dealType === "rent" || dealType === "daily_rent" ? "rent" : "sale";
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
    body.cadastral_code ? `კადასტრი: ${formatCadastralCode(body.cadastral_code)}` : null,
  ].filter(Boolean);
  return parts.join("\n") || body.address;
}

function parseMissingColumn(message: string): string | null {
  const match = message.match(/Could not find the '([^']+)' column/i);
  return match?.[1] ?? null;
}

async function insertAdaptive(
  service: SupabaseClient,
  payload: Record<string, unknown>,
) {
  let current = { ...payload };
  let lastError: { message: string } | null = null;

  for (let attempt = 0; attempt < 15; attempt++) {
    const { data, error } = await service
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

async function insertLegacyListing(
  service: SupabaseClient,
  user: User,
  body: ListingBody,
) {
  const ownerName =
    [body.owner_first_name, body.owner_last_name].filter(Boolean).join(" ").trim() ||
    "მომხმარებელი";

  const dealType = resolveDealType(body);

  const payload: Record<string, unknown> = {
    owner_name: ownerName,
    owner_phone: body.phone_number ?? "",
    owner_email: user.email ?? null,
    address: body.address,
    property_type: "apartment",
    deal_type: dealType,
    price: body.total_price,
    currency: "USD",
    description: buildLegacyDescription(body),
    images: body.images ?? [],
    status: "pending",
    listing_type: "seller",
  };

  if (body.area_sqm && body.area_sqm > 0) {
    payload.area_sqm = body.area_sqm;
  }
  if (body.latitude != null) payload.latitude = body.latitude;
  if (body.longitude != null) payload.longitude = body.longitude;
  if (body.geojson_polygon) payload.geojson_polygon = body.geojson_polygon;

  return insertAdaptive(service, payload);
}

export async function insertPropertyListing(user: User, body: ListingBody) {
  const supabase = await createClient();
  const service = createServiceClient();

  await ensureProfile(user, service);

  const dealType = resolveDealType(body);

  const newRow = {
    user_id: user.id,
    title: body.title ?? body.address,
    description: body.description ?? "",
    cadastral_code: body.cadastral_code
      ? formatCadastralCode(body.cadastral_code)
      : `TEMP-${Date.now()}`,
    owner_first_name: body.owner_first_name ?? "",
    owner_last_name: body.owner_last_name ?? "",
    address: body.address,
    phone_number: body.phone_number ?? "",
    total_price: body.total_price,
    area_sqm: body.area_sqm,
    deal_type: dealType,
    listing_type: listingTypeFromDeal(dealType),
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
