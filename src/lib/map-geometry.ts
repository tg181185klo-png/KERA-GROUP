import type { GeoJSON } from "geojson";
import type { MapProperty } from "@/lib/types/property-listing";

const EARTH_RADIUS_M = 6378137;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Geodesic area of a GeoJSON polygon in square meters (WGS84). */
export function computePolygonAreaSqm(polygon: GeoJSON.Polygon): number {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 4) return 0;

  let area = 0;
  const len = ring.length - 1;

  for (let i = 0; i < len; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];
    area +=
      toRadians(lng2 - lng1) *
      (2 + Math.sin(toRadians(lat1)) + Math.sin(toRadians(lat2)));
  }

  return Math.abs((area * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

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
