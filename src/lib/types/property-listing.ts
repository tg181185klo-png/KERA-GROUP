import type { GeoJSON } from "geojson";

export type ListingStatus = "pending" | "active" | "blocked";
export type ListingType = "sale" | "rent";

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
  listing_type: ListingType;
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
  latitude: number | null;
  longitude: number | null;
  geojson_polygon: GeoJSON.Polygon | null;
  images: string[];
  created_at?: string;
  bedrooms?: number | null;
  property_type?: string | null;
}

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: "იყიდება",
  rent: "ქირავდება",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  pending: "მოდერაციაში",
  active: "აქტიური",
  blocked: "დაბლოკილი",
};
