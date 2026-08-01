import type { MapDealType } from "@/lib/types/property-listing";
import { formatCadastralCode } from "@/lib/cadastral";
import { lookupCadastralParcel } from "@/lib/cadastral-lookup";

export type ListingUpdateBody = {
  title?: string;
  description?: string;
  cadastral_code?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  address?: string;
  phone_number?: string;
  total_price?: number;
  area_sqm?: number;
  deal_type?: MapDealType;
  listing_type?: string;
  latitude?: number | null;
  longitude?: number | null;
  geojson_polygon?: unknown;
  images?: string[];
  status?: string;
};

function listingTypeFromDeal(dealType: MapDealType): "sale" | "rent" {
  return dealType === "rent" || dealType === "daily_rent" ? "rent" : "sale";
}

export function resolveDealType(body: ListingUpdateBody): MapDealType {
  const raw = String(body.deal_type ?? body.listing_type ?? "sale")
    .toLowerCase()
    .trim();

  if (raw === "rent") return "rent";
  if (raw === "daily_rent" || raw === "daily") return "daily_rent";
  if (raw === "pledge" || raw === "gira") return "pledge";
  return "sale";
}

export async function buildOwnerListingUpdates(
  body: ListingUpdateBody,
  existing: Record<string, unknown>,
  options?: { resetToPending?: boolean },
): Promise<Record<string, unknown>> {
  const dealType = resolveDealType(body);
  const updates: Record<string, unknown> = {
    title: body.title ?? existing.title,
    description: body.description ?? existing.description ?? "",
    owner_first_name: body.owner_first_name ?? existing.owner_first_name,
    owner_last_name: body.owner_last_name ?? existing.owner_last_name,
    address: body.address ?? existing.address,
    phone_number: body.phone_number ?? existing.phone_number ?? existing.owner_phone,
    total_price: body.total_price ?? existing.total_price ?? existing.price,
    area_sqm: body.area_sqm ?? existing.area_sqm,
    deal_type: dealType,
    listing_type: listingTypeFromDeal(dealType),
    images: body.images ?? existing.images ?? [],
  };

  if (body.cadastral_code) {
    updates.cadastral_code = formatCadastralCode(body.cadastral_code);
  }

  const cadastralCode = String(updates.cadastral_code ?? existing.cadastral_code ?? "");
  if (cadastralCode && !cadastralCode.startsWith("TEMP-")) {
    const parcel = await lookupCadastralParcel(cadastralCode);
    if (parcel) {
      updates.cadastral_code = parcel.cadastral_code;
      updates.latitude = parcel.latitude;
      updates.longitude = parcel.longitude;
      updates.geojson_polygon = parcel.geojson_polygon;
      if (parcel.address && !updates.address) {
        updates.address = parcel.address;
      }
    } else {
      if (body.latitude != null) updates.latitude = body.latitude;
      if (body.longitude != null) updates.longitude = body.longitude;
      if (body.geojson_polygon != null) updates.geojson_polygon = body.geojson_polygon;
    }
  } else {
    if (body.latitude != null) updates.latitude = body.latitude;
    if (body.longitude != null) updates.longitude = body.longitude;
    if (body.geojson_polygon != null) updates.geojson_polygon = body.geojson_polygon;
  }

  if (options?.resetToPending) {
    updates.status = "pending";
  }

  return updates;
}
