import type { GeoJSON } from "geojson";

/** Parse WKT POLYGON / MULTIPOLYGON (EPSG:4326, x=lng y=lat) → GeoJSON. */
export function wktToGeoJsonPolygon(wkt: string): GeoJSON.Polygon | null {
  const trimmed = wkt.trim();
  if (!trimmed) return null;

  const polygonMatch = trimmed.match(/^POLYGON\s*\(\(([\s\S]+)\)\)\s*$/i);
  if (polygonMatch) {
    const rings = parseRings(polygonMatch[1]);
    if (!rings.length) return null;
    return { type: "Polygon", coordinates: rings };
  }

  const multiMatch = trimmed.match(/^MULTIPOLYGON\s*\(\(\(([\s\S]+)\)\)\)\s*$/i);
  if (multiMatch) {
    const rings = parseRings(multiMatch[1]);
    if (!rings.length) return null;
    return { type: "Polygon", coordinates: rings };
  }

  return null;
}

function parseRings(body: string): number[][][] {
  const ringStrings = body.split(/\)\s*,\s*\(/);
  const rings: number[][][] = [];

  for (const ringString of ringStrings) {
    const clean = ringString.replace(/^\(|\)$/g, "");
    const ring: number[][] = [];

    for (const pair of clean.split(",")) {
      const parts = pair.trim().split(/\s+/).map(Number);
      if (parts.length < 2 || parts.some(Number.isNaN)) continue;
      ring.push([parts[0], parts[1]]);
    }

    if (ring.length >= 3) rings.push(ring);
  }

  return rings;
}

export function polygonCentroidFromGeoJson(polygon: GeoJSON.Polygon): {
  latitude: number;
  longitude: number;
} {
  const ring = polygon.coordinates[0];
  if (!ring?.length) return { latitude: 41.7151, longitude: 44.8271 };

  let sumLat = 0;
  let sumLng = 0;
  let count = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const [lng, lat] = ring[i];
    sumLng += lng;
    sumLat += lat;
    count++;
  }

  return {
    latitude: sumLat / count,
    longitude: sumLng / count,
  };
}
