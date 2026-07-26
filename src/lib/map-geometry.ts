import type { MapProperty } from "@/lib/types/property-listing";

export function getPropertyCenter(
  property: MapProperty,
): [number, number] | null {
  if (property.latitude != null && property.longitude != null) {
    return [property.latitude, property.longitude];
  }

  const ring = property.geojson_polygon?.coordinates?.[0];
  if (!ring?.length) return null;

  let sumLat = 0;
  let sumLng = 0;
  let count = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const [lng, lat] = ring[i];
    sumLng += lng;
    sumLat += lat;
    count++;
  }

  if (count === 0) return null;
  return [sumLat / count, sumLng / count];
}

export function getPropertyBounds(property: MapProperty): [number, number][] {
  const bounds: [number, number][] = [];

  if (property.geojson_polygon?.coordinates?.[0]?.length) {
    property.geojson_polygon.coordinates[0].forEach(([lng, lat]) => {
      bounds.push([lat, lng]);
    });
  } else {
    const center = getPropertyCenter(property);
    if (center) bounds.push(center);
  }

  return bounds;
}

export const POLYGON_MIN_ZOOM = 14;

export function shouldShowPolygons(zoom: number): boolean {
  return zoom >= POLYGON_MIN_ZOOM;
}
