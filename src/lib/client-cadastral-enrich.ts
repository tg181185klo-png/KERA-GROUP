import type { MapProperty } from "@/lib/types/property-listing";

/**
 * Map display uses DB-stored cadastral geometry only.
 * NAPR/maps.gov.ge is queried once at listing create/update — not on map load.
 */
export function propertyNeedsCadastralFetch(_property: MapProperty): boolean {
  return false;
}

export async function fetchCadastralForProperty(
  property: MapProperty,
): Promise<MapProperty> {
  return property;
}

export async function enrichPropertiesCadastral(
  properties: MapProperty[],
): Promise<MapProperty[]> {
  return properties;
}
