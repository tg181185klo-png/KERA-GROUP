import type { GeoJSON } from "geojson";

/** Accepts standard format and common variants (spaces, extra segments). */
export function extractCadastralCode(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/\d{2}\.\d{2}\.\d{2}\.\d{3}\.\d{3}/);
  return match?.[0] ?? null;
}

export function isValidCadastralCode(code: string): boolean {
  return extractCadastralCode(code) !== null;
}

/** Deterministic coordinates from any stable string (cadastral, address, id). */
export function coordinatesFromSeed(seed: string): {
  latitude: number;
  longitude: number;
  geojson_polygon: GeoJSON.Polygon;
} {
  const normalized = seed.trim() || "kera-default";
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }

  const latitude = 41.7151 + ((hash % 200) - 100) * 0.0012;
  const longitude = 44.8271 + (((hash * 7) % 200) - 100) * 0.0012;
  const size = 0.00035 + (hash % 5) * 0.00008;

  const geojson_polygon: GeoJSON.Polygon = {
    type: "Polygon",
    coordinates: [
      [
        [longitude - size, latitude - size],
        [longitude + size, latitude - size],
        [longitude + size, latitude + size],
        [longitude - size, latitude + size],
        [longitude - size, latitude - size],
      ],
    ],
  };

  return { latitude, longitude, geojson_polygon };
}

/** Simulates cadastral lookup — generates a deterministic location in Tbilisi area. */
export function simulateCadastralLookup(cadastralCode: string): {
  latitude: number;
  longitude: number;
  geojson_polygon: GeoJSON.Polygon;
} {
  const extracted = extractCadastralCode(cadastralCode) ?? cadastralCode.trim();
  return coordinatesFromSeed(extracted);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPricePerSqm(price: number): string {
  return `${formatPrice(price)}/მ²`;
}
