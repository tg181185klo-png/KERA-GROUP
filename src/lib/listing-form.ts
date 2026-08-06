import type { PropertyListingFormData } from "@/lib/types/property-listing";
import {
  getCadastralCode,
  getListingTitle,
  getMapDealTypeFromRow,
  getOwnerNames,
  parseGeojsonForClient,
  type PropertyRow,
} from "@/lib/property-normalize";

function toFormNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

export const EMPTY_LISTING_FORM: PropertyListingFormData = {
  title: "",
  description: "",
  cadastral_code: "",
  owner_first_name: "",
  owner_last_name: "",
  address: "",
  phone_number: "",
  total_price: 0,
  area_sqm: 0,
  deal_type: "sale",
  latitude: null,
  longitude: null,
  geojson_polygon: null,
  images: [],
};

/** Build wizard form state from a DB row (safe for Server → Client props). */
export function rowToFormData(row: PropertyRow): PropertyListingFormData {
  const owners = getOwnerNames(row);
  const cadastral = getCadastralCode(row);
  const geojson = parseGeojsonForClient(row.geojson_polygon);

  return {
    title: getListingTitle(row),
    description: String(row.description ?? ""),
    cadastral_code: cadastral !== "—" ? cadastral : "",
    owner_first_name: owners.first,
    owner_last_name: owners.last,
    address: String(row.address ?? ""),
    phone_number: String(row.phone_number ?? row.owner_phone ?? ""),
    total_price: toFormNumber(row.total_price ?? row.price),
    area_sqm: toFormNumber(row.area_sqm),
    deal_type: getMapDealTypeFromRow(row),
    latitude: toNullableNumber(row.latitude),
    longitude: toNullableNumber(row.longitude),
    geojson_polygon: geojson,
    images: Array.isArray(row.images)
      ? (row.images as string[]).filter((src) => typeof src === "string")
      : [],
  };
}
