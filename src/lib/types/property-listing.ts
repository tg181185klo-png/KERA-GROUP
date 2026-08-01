import type { GeoJSON } from "geojson";

export type ListingStatus = "pending" | "active" | "blocked";
/** Legacy binary type stored in DB; map colors use MapDealType / deal_type. */
export type ListingType = "sale" | "rent";
export type MapDealType = "sale" | "rent" | "daily_rent" | "pledge";

export interface PropertyListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  cadastral_code: string;
  owner_first_name: string;
  owner_last_name: string;
  address: string;
  phone_number: string;
  total_price: number;
  area_sqm: number;
  price_per_sqm: number | null;
  listing_type: ListingType;
  deal_type: MapDealType;
  status: ListingStatus;
  latitude: number | null;
  longitude: number | null;
  geojson_polygon: GeoJSON.Polygon | null;
  images: string[];
  created_at: string;
}

export interface PropertyListingFormData {
  title: string;
  description: string;
  cadastral_code: string;
  owner_first_name: string;
  owner_last_name: string;
  address: string;
  phone_number: string;
  total_price: number;
  area_sqm: number;
  deal_type: MapDealType;
  latitude: number | null;
  longitude: number | null;
  geojson_polygon: GeoJSON.Polygon | null;
  images: string[];
}

export interface CadastralMapPreview {
  cadastral_code: string;
  address?: string;
  latitude: number;
  longitude: number;
  geojson_polygon: GeoJSON.Polygon | null;
}

export interface MapProperty {
  id: string;
  title: string;
  cadastral_code: string;
  owner_first_name: string;
  owner_last_name: string;
  address: string;
  phone_number: string;
  total_price: number;
  area_sqm: number;
  price_per_sqm: number | null;
  listing_type: ListingType;
  deal_type: MapDealType;
  latitude: number | null;
  longitude: number | null;
  geojson_polygon: GeoJSON.Polygon | null;
  images: string[];
  created_at?: string;
  bedrooms?: number | null;
  property_type?: string | null;
}

export const DEAL_TYPE_LABELS: Record<MapDealType, string> = {
  sale: "გაყიდვა",
  rent: "ქირა",
  daily_rent: "დღიური ქირა",
  pledge: "გირა",
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: "იყიდება",
  rent: "ქირავდება",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  pending: "მოდერაციაში",
  active: "აქტიური",
  blocked: "დაბლოკილი",
};
