import type { MapProperty } from "@/lib/types/property-listing";
import { cadastralToUniqCode, formatCadastralCode } from "@/lib/cadastral";
import { isMappableProperty } from "@/lib/property-normalize";

const enrichCache = new Map<string, MapProperty>();

export function propertyNeedsCadastralFetch(property: MapProperty): boolean {
  if (isMappableProperty(property)) return false;

  const code = property.cadastral_code?.trim();
  if (!code || code === "—" || code.startsWith("TEMP-")) return false;

  return cadastralToUniqCode(code) != null;
}

async function persistMapCoords(
  property: MapProperty,
  payload: {
    latitude?: number | null;
    longitude?: number | null;
    geojson_polygon?: MapProperty["geojson_polygon"];
    cadastral_code?: string;
  },
) {
  fetch(`/api/listings/${property.id}/cadastral`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

async function geocodeProperty(property: MapProperty): Promise<MapProperty> {
  const address = property.address?.trim();
  if (!address || address.length <= 3) return property;

  try {
    const geoRes = await fetch(
      `/api/geocode?address=${encodeURIComponent(address)}`,
      { cache: "no-store" },
    );
    const geo = await geoRes.json();
    if (!geoRes.ok || geo.lat == null || geo.lng == null) return property;

    const geocoded: MapProperty = {
      ...property,
      latitude: geo.lat,
      longitude: geo.lng,
    };
    enrichCache.set(property.id, geocoded);
    await persistMapCoords(property, {
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
    });
    return geocoded;
  } catch {
    return property;
  }
}

export async function fetchCadastralForProperty(
  property: MapProperty,
): Promise<MapProperty> {
  const cached = enrichCache.get(property.id);
  if (cached && isMappableProperty(cached)) return cached;

  if (isMappableProperty(property)) {
    enrichCache.set(property.id, property);
    return property;
  }

  if (propertyNeedsCadastralFetch(property)) {
    try {
      const res = await fetch(
        `/api/cadastral/lookup?code=${encodeURIComponent(property.cadastral_code)}`,
        { cache: "no-store" },
      );
      const data = await res.json();

      if (res.ok) {
        const enriched: MapProperty = {
          ...property,
          latitude: data.latitude ?? property.latitude,
          longitude: data.longitude ?? property.longitude,
          geojson_polygon: data.geojson_polygon ?? property.geojson_polygon,
          address: property.address || data.address || property.address,
          cadastral_code: formatCadastralCode(
            data.cadastral_code ?? property.cadastral_code,
          ),
        };

        enrichCache.set(property.id, enriched);

        if (isMappableProperty(enriched)) {
          await persistMapCoords(property, {
            latitude: enriched.latitude,
            longitude: enriched.longitude,
            geojson_polygon: enriched.geojson_polygon,
            cadastral_code: enriched.cadastral_code,
          });
          return enriched;
        }
      }
    } catch {
      // fall through to geocode
    }
  }

  return geocodeProperty(property);
}

export async function enrichPropertiesCadastral(
  properties: MapProperty[],
): Promise<MapProperty[]> {
  return Promise.all(properties.map((property) => fetchCadastralForProperty(property)));
}
