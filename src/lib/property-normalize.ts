import type { MapProperty, ListingType } from "@/lib/types/property-listing";

/** Raw row from modern or legacy Supabase `properties` table */
export type PropertyRow = Record<string, unknown>;

export function getListingTitle(row: PropertyRow): string {
  if (typeof row.title === "string" && row.title) return row.title;
  if (typeof row.description === "string" && row.description) {
    return row.description.split("\n")[0] || row.address?.toString() || "განცხადება";
  }
  return typeof row.address === "string" ? row.address : "განცხადება";
}

export function getCadastralCode(row: PropertyRow): string {
  if (typeof row.cadastral_code === "string" && row.cadastral_code) {
    return row.cadastral_code;
  }
  if (typeof row.description === "string") {
    const match = row.description.match(/კადასტრი:\s*(\S+)/);
    if (match) return match[1];
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

export function normalizeToMapProperty(row: PropertyRow): MapProperty | null {
  const lat = row.latitude as number | null | undefined;
  const lng = row.longitude as number | null | undefined;
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  const owners = getOwnerNames(row);
  const area =
    typeof row.area_sqm === "number" && row.area_sqm > 0 ? row.area_sqm : 1;
  const price = getTotalPrice(row);

  return {
    id: String(row.id),
    title: getListingTitle(row),
    cadastral_code: getCadastralCode(row),
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
    geojson_polygon: (row.geojson_polygon as MapProperty["geojson_polygon"]) ?? null,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
  };
}

export function isActiveListing(row: PropertyRow): boolean {
  const status = String(row.status ?? "");
  return status === "active";
}
