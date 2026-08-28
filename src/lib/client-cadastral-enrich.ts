import { lookupCadastralWithFallback } from "@/lib/client-maps-gov-enrich";
import type { MapProperty } from "@/lib/types/property-listing";

export function propertyNeedsCadastralFetch(property: MapProperty): boolean {
  if (property.geojson_polygon?.coordinates?.[0]?.length) return false;
  const code = property.cadastral_code?.trim();
  return Boolean(code && code !== "—" && !code.startsWith("TEMP-"));
}

/** Browser-side backfill when DB lacks parcel polygon (server IP often blocked). */
export async function enrichListingsCadastralClient(
  properties: MapProperty[],
): Promise<MapProperty[]> {
  const needsFetch = properties.filter(propertyNeedsCadastralFetch);
  if (!needsFetch.length) return properties;

  const fetched = new Map<string, MapProperty>();

  await Promise.all(
    needsFetch.map(async (property) => {
      const data = await lookupCadastralWithFallback(property.cadastral_code);
      if (!data?.geojson_polygon?.coordinates?.[0]?.length) return;

      const updated: MapProperty = {
        ...property,
        cadastral_code: data.cadastral_code,
        latitude: data.latitude,
        longitude: data.longitude,
        geojson_polygon: data.geojson_polygon,
        address: property.address || data.address || property.address,
      };

      fetched.set(property.id, updated);

      void fetch(`/api/listings/${property.id}/cadastral`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cadastral_code: data.cadastral_code,
          latitude: data.latitude,
          longitude: data.longitude,
          geojson_polygon: data.geojson_polygon,
        }),
      }).catch(() => undefined);
    }),
  );

  if (!fetched.size) return properties;

  return properties.map((property) => fetched.get(property.id) ?? property);
}

export async function fetchCadastralForProperty(
  property: MapProperty,
): Promise<MapProperty> {
  const [enriched] = await enrichListingsCadastralClient([property]);
  return enriched;
}

export async function enrichPropertiesCadastral(
  properties: MapProperty[],
): Promise<MapProperty[]> {
  return enrichListingsCadastralClient(properties);
}
