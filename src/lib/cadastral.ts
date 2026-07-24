import type { GeoJSON } from "geojson";

const CADASTRAL_PATTERN = /^\d{2}\.\d{2}\.\d{2}\.\d{3}\.\d{3}$/;

export function isValidCadastralCode(code: string): boolean {
  return CADASTRAL_PATTERN.test(code.trim());
}

/** Simulates cadastral lookup — generates a deterministic location in Tbilisi area. */
export function simulateCadastralLookup(cadastralCode: string): {
  latitude: number;
  longitude: number;
  geojson_polygon: GeoJSON.Polygon;
} {
  const parts = cadastralCode.split(".").map(Number);
  const seed = parts.reduce((acc, n) => acc + n, 0);

  const latitude = 41.7151 + ((seed % 100) - 50) * 0.001;
  const longitude = 44.8271 + (((seed * 7) % 100) - 50) * 0.001;

  const size = 0.0004 + (seed % 5) * 0.0001;
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
