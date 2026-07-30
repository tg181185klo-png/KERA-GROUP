export type PropertyStatus = "pending" | "active" | "archived";
export type DealType = "sale" | "rent";
export type PropertyType = "apartment" | "house" | "commercial" | "land";
export type ListingType = "seller" | "developer";

export interface Property {
  id: string;
  created_at: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string | null;
  address: string;
  property_type: PropertyType;
  deal_type: DealType;
  price: number;
  currency: string;
  description: string | null;
  images: string[];
  status: PropertyStatus;
  bedrooms?: number | null;
  area_sqm?: number | null;
  features?: string[] | null;
  listing_type?: ListingType | null;
}

export interface PropertySearchParams {
  deal_type?: DealType | "pledge";
  property_type?: string;
  location?: string;
  city?: string;
  district?: string;
  village?: string;
  land_status?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
}

export interface PropertyFormData {
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  address: string;
  property_type: PropertyType;
  deal_type: DealType;
  price: number;
  currency: string;
  description: string;
  bedrooms?: number;
  area_sqm?: number;
  features: string[];
  listing_type: ListingType;
  images: string[];
}
