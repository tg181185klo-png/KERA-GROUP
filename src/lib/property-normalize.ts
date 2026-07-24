import type { MapProperty, ListingType, ListingStatus } from "@/lib/types/property-listing";
import { extractCadastralCode } from "@/lib/cadastral";

/** Raw row from modern or legacy Supabase `properties` table */
export type PropertyRow = Record<string, unknown>;

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

export function getListingTitle(row: PropertyRow): string {
  if (typeof row.title === "string" && row.title) return row.title;
  if (typeof row.description === "string" && row.description) {
    return row.description.split("\n")[0] || row.address?.toString() || "განცხადება";
  }
  return typeof row.address === "string" ? row.address : "განცხადება";
}

export function getCadastralCode(row: PropertyRow): string {
  if (typeof row.cadastral_code === "string" && row.cadastral_code) {
    const fromField = extractCadastralCode(row.cadastral_code);
    if (fromField) return fromField;
    if (!row.cadastral_code.startsWith("TEMP-")) return row.cadastral_code.trim();
  }

  const searchIn = [row.description, row.title, row.address]
    .filter((v): v is string => typeof v === "string")
    .join("\n");

  const fromText = extractCadastralCode(searchIn);
  if (fromText) return fromText;

  const georgianMatch = searchIn.match(/კადასტრი:\s*(\S+)/);
  if (georgianMatch?.[1]) {
    const fromLabel = extractCadastralCode(georgianMatch[1]) ?? georgianMatch[1].trim();
    if (fromLabel && !fromLabel.startsWith("TEMP-")) return fromLabel;
  }

  return "—";
}

export function getTotalPrice(row: PropertyRow): number {
  if (typeof row.total_price === "number") return row.total_price;
  if (typeof row.price === "number") return row.price;
  return 0;
}

export function getListingType(row: PropertyRow): ListingType {
  if (row.listing_type === "rent" || row.deal_type === "rent") return "rent";
  return "sale";
}

export function normalizeListingStatus(status: unknown): ListingStatus {
  if (status === "active" || status === "pending" || status === "blocked") {
    return status;
  }
  if (status === "archived") return "blocked";
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

export function resolveMapCoordinates(row: PropertyRow) {
  const lat = toNumber(row.latitude);
  const lng = toNumber(row.longitude);
  const geojson = parseGeojson(row.geojson_polygon);
  const cadastral = getCadastralCode(row);

  return { lat, lng, geojson, cadastral };
}

export function normalizeToMapProperty(row: PropertyRow): MapProperty | null {
  const { lat, lng, geojson } = resolveMapCoordinates(row);
  if (lat == null || lng == null) return null;

  const owners = getOwnerNames(row);
  const area =
    typeof row.area_sqm === "number" && row.area_sqm > 0 ? row.area_sqm : 1;
  const price = getTotalPrice(row);
  const cadastral = getCadastralCode(row);

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
      typeof row.price_per_sqm === "number"
        ? row.price_per_sqm
        : area > 0
          ? Math.round((price / area) * 100) / 100
          : null,
    listing_type: getListingType(row),
    latitude: lat,
    longitude: lng,
    geojson_polygon: geojson,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
  };
}

export function normalizeToAdminListing(row: PropertyRow) {
  const owners = getOwnerNames(row);
  return {
    id: String(row.id),
    title: getListingTitle(row),
    cadastral_code: getCadastralCode(row),
    owner_first_name: owners.first,
    owner_last_name: owners.last,
    total_price: getTotalPrice(row),
    listing_type: getListingType(row),
    status: normalizeListingStatus(row.status),
    created_at: String(row.created_at ?? ""),
    user_id: String(row.user_id ?? ""),
  };
}

export function isActiveListing(row: PropertyRow): boolean {
  return normalizeListingStatus(row.status) === "active";
}
