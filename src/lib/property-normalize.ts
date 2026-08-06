import type { SupabaseClient } from "@supabase/supabase-js";
import type { MapProperty, ListingType, ListingStatus } from "@/lib/types/property-listing";
import { extractCadastralCode, formatCadastralCode } from "@/lib/cadastral";
import { computePolygonAreaSqm } from "@/lib/map-geometry";
import { computePricePerSqm } from "@/lib/price-display";
import {
  isPubliclyVisibleListing,
  normalizePublicStatus,
} from "@/lib/listing-status";

/** Raw row from modern or legacy Supabase `properties` table */
export type PropertyRow = Record<string, unknown>;

function isMissingColumnError(message: string, column: string): boolean {
  return new RegExp(`Could not find the '${column}' column`, "i").test(message);
}

/** Strip DB-only fields before passing rows into client components. */
export function sanitizePropertyRowForClient(row: PropertyRow): PropertyRow {
  const cleaned: PropertyRow = { ...row };
  delete cleaned.coordinates;

  if (typeof cleaned.geojson_polygon === "string") {
    cleaned.geojson_polygon = parseGeojsonForClient(cleaned.geojson_polygon);
  }

  try {
    return JSON.parse(JSON.stringify(cleaned)) as PropertyRow;
  } catch {
    return {
      id: cleaned.id,
      title: cleaned.title,
      description: cleaned.description,
      address: cleaned.address,
      status: cleaned.status,
      owner_name: cleaned.owner_name,
      owner_first_name: cleaned.owner_first_name,
      owner_last_name: cleaned.owner_last_name,
      owner_phone: cleaned.owner_phone,
      owner_email: cleaned.owner_email,
      phone_number: cleaned.phone_number,
      price: cleaned.price,
      total_price: cleaned.total_price,
      area_sqm: cleaned.area_sqm,
      deal_type: cleaned.deal_type,
      listing_type: cleaned.listing_type,
      cadastral_code: cleaned.cadastral_code,
      latitude: cleaned.latitude,
      longitude: cleaned.longitude,
      geojson_polygon: cleaned.geojson_polygon,
      images: cleaned.images,
      created_at: cleaned.created_at,
      user_id: cleaned.user_id,
    };
  }
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function parseGeojson(value: unknown): MapProperty["geojson_polygon"] | null {
  if (!value) return null;
  if (typeof value === "object" && value !== null && "type" in value) {
    return value as MapProperty["geojson_polygon"];
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as MapProperty["geojson_polygon"];
    } catch {
      return null;
    }
  }
  return null;
}

/** Parse geojson for client/server form props. */
export function parseGeojsonForClient(
  value: unknown,
): MapProperty["geojson_polygon"] | null {
  return parseGeojson(value);
}

export function getListingTitle(row: PropertyRow): string {
  if (typeof row.title === "string" && row.title) return row.title;
  if (typeof row.description === "string" && row.description) {
    return row.description.split("\n")[0] || row.address?.toString() || "განცხადება";
  }
  return typeof row.address === "string" ? row.address : "განცხადება";
}

export function getCadastralCode(row: PropertyRow): string {
  if (typeof row.cadastral_code === "string" && row.cadastral_code) {
    const formatted = formatCadastralCode(row.cadastral_code);
    if (formatted && formatted !== "—" && !formatted.startsWith("TEMP-")) {
      return formatted;
    }
  }

  const searchIn = [row.description, row.title, row.address]
    .filter((v): v is string => typeof v === "string")
    .join("\n");

  const fromText = extractCadastralCode(searchIn);
  if (fromText) return fromText;

  const georgianMatch = searchIn.match(/კადასტრი:\s*(\S+)/);
  if (georgianMatch?.[1]) {
    const fromLabel = formatCadastralCode(georgianMatch[1]);
    if (fromLabel && !fromLabel.startsWith("TEMP-")) return fromLabel;
  }

  return "—";
}

export function getTotalPrice(row: PropertyRow): number {
  return toNumber(row.total_price) ?? toNumber(row.price) ?? 0;
}

function extractAreaFromText(text: string): number {
  const patterns = [
    /(\d[\d.,]*)\s*(?:მ²|m²|m2|sqm|კვ\.?\s*მ)/i,
    /ფართ(?:ობი)?[:\s]+(\d[\d.,]*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const value = Number(match[1].replace(/,/g, ""));
    if (!Number.isNaN(value) && value > 0) return value;
  }

  return 0;
}

function getAreaSqm(
  row: PropertyRow,
  geojson: MapProperty["geojson_polygon"],
): number {
  const direct =
    toNumber(row.area_sqm) ??
    toNumber(row.area) ??
    toNumber(row.square_meters) ??
    toNumber(row.sqm);
  if (direct != null && direct > 0) return direct;

  const text = [row.title, row.description]
    .filter((value): value is string => typeof value === "string")
    .join("\n");
  const fromText = extractAreaFromText(text);
  if (fromText > 0) return fromText;

  if (geojson) {
    const fromPolygon = computePolygonAreaSqm(geojson);
    if (fromPolygon > 0) return Math.round(fromPolygon * 100) / 100;
  }

  return 0;
}

export function getListingType(row: PropertyRow): ListingType {
  const deal = getMapDealTypeFromRow(row);
  return deal === "rent" || deal === "daily_rent" ? "rent" : "sale";
}

export function getMapDealTypeFromRow(row: PropertyRow): MapProperty["deal_type"] {
  const raw = String(row.deal_type ?? row.listing_type ?? "sale")
    .toLowerCase()
    .trim();

  if (raw === "rent") return "rent";
  if (raw === "daily_rent" || raw === "daily") return "daily_rent";
  if (raw === "pledge") return "pledge";
  return "sale";
}

export function normalizeListingStatus(status: unknown): ListingStatus {
  const normalized = normalizePublicStatus(status);
  if (normalized === "active") return "active";
  if (normalized === "blocked") return "blocked";
  return "pending";
}

export function getOwnerNames(row: PropertyRow): { first: string; last: string } {
  if (row.owner_first_name || row.owner_last_name) {
    return {
      first: String(row.owner_first_name ?? ""),
      last: String(row.owner_last_name ?? ""),
    };
  }
  const full = String(row.owner_name ?? "");
  const parts = full.trim().split(/\s+/);
  return {
    first: parts[0] ?? "",
    last: parts.slice(1).join(" "),
  };
}

function centroidFromGeojson(
  geojson: MapProperty["geojson_polygon"],
): { lat: number; lng: number } | null {
  const ring = geojson?.coordinates?.[0];
  if (!ring?.length) return null;

  let sumLat = 0;
  let sumLng = 0;
  let count = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const [lng, lat] = ring[i];
    sumLng += lng;
    sumLat += lat;
    count++;
  }

  if (count === 0) return null;
  return { lat: sumLat / count, lng: sumLng / count };
}

export function resolveMapCoordinates(row: PropertyRow) {
  const geojson = parseGeojson(row.geojson_polygon);
  let lat = toNumber(row.latitude);
  let lng = toNumber(row.longitude);

  if ((lat == null || lng == null) && geojson) {
    const centroid = centroidFromGeojson(geojson);
    if (centroid) {
      lat = lat ?? centroid.lat;
      lng = lng ?? centroid.lng;
    }
  }

  const cadastral = getCadastralCode(row);

  return { lat, lng, geojson, cadastral };
}

export function normalizeToMapProperty(row: PropertyRow): MapProperty | null {
  if (row.id == null) return null;

  const { lat, lng, geojson } = resolveMapCoordinates(row);
  const owners = getOwnerNames(row);
  const area = getAreaSqm(row, geojson);
  const price = getTotalPrice(row);
  const cadastral = getCadastralCode(row);
  const storedPerSqm = toNumber(row.price_per_sqm);

  return {
    id: String(row.id),
    title: getListingTitle(row),
    cadastral_code: cadastral,
    owner_first_name: owners.first,
    owner_last_name: owners.last,
    address: String(row.address ?? ""),
    phone_number: String(row.phone_number ?? row.owner_phone ?? ""),
    total_price: price,
    area_sqm: area,
    price_per_sqm:
      storedPerSqm != null && storedPerSqm > 0
        ? storedPerSqm
        : computePricePerSqm(price, area),
    listing_type: getListingType(row),
    deal_type: getMapDealTypeFromRow(row),
    latitude: lat,
    longitude: lng,
    geojson_polygon: geojson,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    created_at:
      typeof row.created_at === "string" ? row.created_at : undefined,
    bedrooms: typeof row.bedrooms === "number" ? row.bedrooms : null,
    property_type:
      typeof row.property_type === "string" ? row.property_type : null,
  };
}

/** Listings that can be drawn on the map (polygon or point). */
export function isMappableProperty(property: MapProperty): boolean {
  if (property.geojson_polygon?.coordinates?.[0]?.length) return true;
  return property.latitude != null && property.longitude != null;
}

export function normalizeToAdminListing(row: PropertyRow) {
  const full = normalizeToAdminListingFull(row);
  const {
    description: _d,
    address: _a,
    phone_number: _p,
    latitude: _lat,
    longitude: _lng,
    images: _i,
    updated_at: _u,
    ...summary
  } = full;
  return summary;
}

export function normalizeToAdminListingFull(row: PropertyRow) {
  const owners = getOwnerNames(row);
  const totalPrice = getTotalPrice(row);
  const geojson = parseGeojson(row.geojson_polygon);
  const areaSqm = getAreaSqm(row, geojson);
  const storedPerSqm = toNumber(row.price_per_sqm);
  const { lat, lng } = resolveMapCoordinates(row);
  const images = Array.isArray(row.images) ? (row.images as string[]) : [];

  return {
    id: String(row.id),
    title: getListingTitle(row),
    description: String(row.description ?? ""),
    cadastral_code: getCadastralCode(row),
    owner_first_name: owners.first,
    owner_last_name: owners.last,
    address: String(row.address ?? ""),
    phone_number: String(row.phone_number ?? row.owner_phone ?? ""),
    total_price: totalPrice,
    area_sqm: areaSqm,
    price_per_sqm:
      storedPerSqm != null && storedPerSqm > 0
        ? storedPerSqm
        : computePricePerSqm(totalPrice, areaSqm),
    listing_type: getListingType(row),
    deal_type: getMapDealTypeFromRow(row),
    status: normalizeListingStatus(row.status),
    latitude: lat,
    longitude: lng,
    images,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    user_id: String(row.user_id ?? ""),
  };
}

export function isActiveListing(row: PropertyRow): boolean {
  return isPubliclyVisibleListing(row.status);
}

/** Owner listings matched by legacy `owner_email` when that column exists. */
export async function fetchListingsByOwnerEmail(
  service: SupabaseClient,
  email: string,
): Promise<PropertyRow[]> {
  if (!email) return [];

  const { data, error } = await service
    .from("properties")
    .select("*")
    .ilike("owner_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingColumnError(error.message, "owner_email")) {
      return [];
    }
    throw new Error(error.message);
  }

  return (data ?? []) as PropertyRow[];
}
