import type { MapProperty } from "@/lib/types/property-listing";
import { cadastralToUniqCode } from "@/lib/cadastral";
import { isMappableProperty } from "@/lib/property-normalize";

const enrichCache = new Map<string, MapProperty>();

export function propertyNeedsCadastralFetch(property: MapProperty): boolean {
  if (isMappableProperty(property)) return false;

  const code = property.cadastral_code?.trim();
  if (!code || code === "—" || code.startsWith("TEMP-")) return false;

  return cadastralToUniqCode(code) != null;
}

export async function fetchCadastralForProperty(
  property: MapProperty,
): Promise<MapProperty> {
  const cached = enrichCache.get(property.id);
  if (cached && isMappableProperty(cached)) return cached;

  if (!propertyNeedsCadastralFetch(property)) {
    enrichCache.set(property.id, property);
    return property;
  }

  try {
    const res = await fetch(
      `/api/cadastral/lookup?code=${encodeURIComponent(property.cadastral_code)}`,
      { cache: "no-store" },
    );
    const data = await res.json();

    if (!res.ok) {
      return property;
    }

    const enriched: MapProperty = {
      ...property,
      latitude: data.latitude ?? property.latitude,
      longitude: data.longitude ?? property.longitude,
      geojson_polygon: data.geojson_polygon ?? property.geojson_polygon,
      address: property.address || data.address || property.address,
      cadastral_code: data.cadastral_code ?? property.cadastral_code,
    };

    enrichCache.set(property.id, enriched);

    if (isMappableProperty(enriched)) {
      fetch(`/api/listings/${property.id}/cadastral`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: enriched.latitude,
          longitude: enriched.longitude,
          geojson_polygon: enriched.geojson_polygon,
          cadastral_code: enriched.cadastral_code,
        }),
      }).catch(() => undefined);
    }

    return enriched;
  } catch {
    return property;
  }
}

export async function enrichPropertiesCadastral(
  properties: MapProperty[],
): Promise<MapProperty[]> {
  return Promise.all(properties.map((property) => fetchCadastralForProperty(property)));
}
