import type { PropertySearchParams } from "@/lib/types/property";
import type { MapProperty } from "@/lib/types/property-listing";

export function parsePropertySearchParams(
  params: Record<string, string | string[] | undefined>,
): PropertySearchParams {
  const getValue = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  };

  return {
    deal_type: getValue("deal_type") as PropertySearchParams["deal_type"],
    property_type: getValue("property_type"),
    location: getValue("location"),
    city: getValue("city"),
    district: getValue("district"),
    village: getValue("village"),
    land_status: getValue("land_status"),
    min_price: getValue("min_price") ? Number(getValue("min_price")) : undefined,
    max_price: getValue("max_price") ? Number(getValue("max_price")) : undefined,
    bedrooms: getValue("bedrooms") ? Number(getValue("bedrooms")) : undefined,
  };
}

export function hasActiveSearchFilters(params: PropertySearchParams): boolean {
  return Boolean(
    params.deal_type ||
      params.property_type ||
      params.location ||
      params.city ||
      params.district ||
      params.village ||
      params.land_status ||
      params.min_price != null ||
      params.max_price != null ||
      params.bedrooms != null,
  );
}

export function filterProperties(
  properties: MapProperty[],
  params: PropertySearchParams,
): MapProperty[] {
  return properties.filter((p) => {
    const dealType = p.listing_type === "rent" ? "rent" : "sale";
    if (params.deal_type === "pledge") return false;
    if (params.deal_type && dealType !== params.deal_type) return false;

    if (params.property_type && p.property_type && p.property_type !== params.property_type) {
      return false;
    }

    if (params.location) {
      const needle = params.location.toLowerCase();
      const haystack = `${p.address} ${p.title}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    if (params.bedrooms != null && params.bedrooms > 0) {
      if (p.bedrooms == null || p.bedrooms < params.bedrooms) return false;
    }

    if (params.min_price != null && p.total_price < params.min_price) return false;
    if (params.max_price != null && p.total_price > params.max_price) return false;

    return true;
  });
}

export function buildSearchQueryString(params: PropertySearchParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      search.set(key, String(value));
    }
  }
  return search.toString();
}
