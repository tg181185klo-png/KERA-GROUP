import type { MapDealType } from "@/lib/types/property-listing";
import { formatCadastralCode } from "@/lib/cadastral";
import {
  applyCadastralParcelToPayload,
  cadastralCodeChanged,
  ensureCadastralGeometryForPayload,
  hasRealStoredPolygon,
} from "@/lib/cadastral-persist";
import { getOwnerNames } from "@/lib/property-normalize";

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

function legacyDealType(dealType: MapDealType): "sale" | "rent" {
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

function isLegacyPropertyRow(row: Record<string, unknown>): boolean {
  return (
    typeof row.owner_name === "string" &&
    row.owner_name.trim() !== "" &&
    (row.title == null || row.title === "")
  );
}

function buildLegacyDescription(body: {
  title?: string;
  description?: string;
  cadastral_code?: string;
  address?: string;
}) {
  const parts = [
    body.title,
    body.description,
    body.cadastral_code
      ? `კადასტრი: ${formatCadastralCode(body.cadastral_code)}`
      : null,
  ].filter(Boolean);
  return parts.join("\n") || body.address || "";
}

export async function buildOwnerListingUpdates(
  body: ListingUpdateBody,
  existing: Record<string, unknown>,
  options?: { resetToPending?: boolean },
): Promise<Record<string, unknown>> {
  const dealType = resolveDealType(body);
  const existingOwners = getOwnerNames(existing);
  const ownerFirst = String(
    body.owner_first_name ?? existingOwners.first ?? "",
  ).trim();
  const ownerLast = String(body.owner_last_name ?? existingOwners.last ?? "").trim();
  const phone = String(
    body.phone_number ?? existing.phone_number ?? existing.owner_phone ?? "",
  ).trim();
  const totalPrice =
    body.total_price ??
    (typeof existing.total_price === "number"
      ? existing.total_price
      : typeof existing.price === "number"
        ? existing.price
        : 0);
  const areaSqm =
    body.area_sqm ??
    (typeof existing.area_sqm === "number" ? existing.area_sqm : null);
  const title = String(body.title ?? existing.title ?? "").trim();
  const description = String(body.description ?? existing.description ?? "").trim();
  const address = String(body.address ?? existing.address ?? "").trim();
  const cadastralRaw = body.cadastral_code
    ? formatCadastralCode(body.cadastral_code)
    : String(existing.cadastral_code ?? "");
  const images = body.images ?? existing.images ?? [];

  const updates: Record<string, unknown> = {
    title: title || address || "განცხადება",
    description,
    owner_first_name: ownerFirst,
    owner_last_name: ownerLast,
    address,
    phone_number: phone,
    owner_phone: phone,
    total_price: totalPrice,
    price: totalPrice,
    area_sqm: areaSqm,
    deal_type: dealType,
    listing_type: listingTypeFromDeal(dealType),
    owner_name: [ownerFirst, ownerLast].filter(Boolean).join(" ").trim() || String(existing.owner_name ?? ""),
    images,
  };

  if (cadastralRaw && cadastralRaw !== "—" && !cadastralRaw.startsWith("TEMP-")) {
    updates.cadastral_code = cadastralRaw;
  }

  if (isLegacyPropertyRow(existing)) {
    updates.deal_type = legacyDealType(dealType);
    updates.listing_type =
      existing.listing_type === "developer" ? "developer" : "seller";
    updates.description = buildLegacyDescription({
      title: title || undefined,
      description: description || undefined,
      cadastral_code: cadastralRaw || undefined,
      address,
    });
    delete updates.title;
    delete updates.owner_first_name;
    delete updates.owner_last_name;
    delete updates.total_price;
    delete updates.phone_number;
    if (updates.cadastral_code == null) {
      delete updates.cadastral_code;
    }
  }

  const cadastralCode = String(updates.cadastral_code ?? existing.cadastral_code ?? "");
  const shouldFetchCadastral =
    cadastralCode &&
    !cadastralCode.startsWith("TEMP-") &&
    (cadastralCodeChanged(existing, body.cadastral_code) ||
      !hasRealStoredPolygon(existing) ||
      !hasRealStoredPolygon({ geojson_polygon: body.geojson_polygon }));

  if (shouldFetchCadastral) {
    applyCadastralParcelToPayload(updates, null, {
      cadastral_code: cadastralCode,
      latitude: body.latitude ?? existing.latitude,
      longitude: body.longitude ?? existing.longitude,
      geojson_polygon: body.geojson_polygon ?? existing.geojson_polygon,
      address: updates.address ?? address,
    });
    await ensureCadastralGeometryForPayload(updates, cadastralCode);

    if (isLegacyPropertyRow(existing)) {
      updates.description = buildLegacyDescription({
        title: title || undefined,
        description: description || undefined,
        cadastral_code: String(updates.cadastral_code ?? cadastralCode),
        address: String(updates.address ?? address),
      });
    }
  } else {
    if (body.latitude != null) updates.latitude = body.latitude;
    else if (existing.latitude != null) updates.latitude = existing.latitude;
    if (body.longitude != null) updates.longitude = body.longitude;
    else if (existing.longitude != null) updates.longitude = existing.longitude;
    if (body.geojson_polygon != null) updates.geojson_polygon = body.geojson_polygon;
    else if (existing.geojson_polygon != null) {
      updates.geojson_polygon = existing.geojson_polygon;
    }
  }

  if (options?.resetToPending) {
    updates.status = "pending";
  }

  return updates;
}
