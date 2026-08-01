import type { GeoJSON } from "geojson";
import { computePolygonAreaSqm } from "@/lib/map-geometry";

/** Fixed USD→GEL rate used across listing cards (matches currency toggle). */
export const USD_TO_GEL = 2.65;

export type DisplayCurrency = "USD" | "GEL";

export function computePricePerSqm(
  totalPrice: number,
  areaSqm: number,
): number | null {
  if (!totalPrice || totalPrice <= 0 || !areaSqm || areaSqm <= 0) return null;
  return Math.round((totalPrice / areaSqm) * 100) / 100;
}

export function resolveAreaSqm(property: {
  area_sqm: number;
  geojson_polygon?: GeoJSON.Polygon | null;
}): number {
  if (property.area_sqm > 0) return property.area_sqm;

  if (property.geojson_polygon) {
    const fromPolygon = computePolygonAreaSqm(property.geojson_polygon);
    if (fromPolygon > 0) return Math.round(fromPolygon * 100) / 100;
  }

  return 0;
}

export function getPricePerSqm(property: {
  total_price: number;
  area_sqm: number;
  price_per_sqm?: number | null;
  geojson_polygon?: GeoJSON.Polygon | null;
}): number | null {
  if (property.price_per_sqm != null && property.price_per_sqm > 0) {
    return property.price_per_sqm;
  }
  return computePricePerSqm(
    property.total_price,
    resolveAreaSqm(property),
  );
}

export function convertDisplayPrice(
  amount: number,
  displayCurrency: DisplayCurrency,
): number {
  if (displayCurrency === "GEL") return Math.round(amount * USD_TO_GEL);
  return amount;
}

export function getDisplayPrices(
  property: {
    total_price: number;
    area_sqm: number;
    price_per_sqm?: number | null;
    geojson_polygon?: GeoJSON.Polygon | null;
  },
  displayCurrency: DisplayCurrency = "USD",
): { price: number; pricePerSqm: number | null; currency: DisplayCurrency } {
  const price = convertDisplayPrice(property.total_price, displayCurrency);
  const rawPerSqm = getPricePerSqm(property);
  const pricePerSqm =
    rawPerSqm != null ? convertDisplayPrice(rawPerSqm, displayCurrency) : null;
  return { price, pricePerSqm, currency: displayCurrency };
}

export function formatListingPrice(
  price: number,
  currency: DisplayCurrency | string,
): string {
  const symbol = currency === "GEL" ? "₾" : "$";
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(price);
  return currency === "GEL" ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

export function formatListingPricePerSqm(
  pricePerSqm: number,
  currency: DisplayCurrency | string,
  perSqmSuffix: string,
): string {
  return `${formatListingPrice(pricePerSqm, currency)}${perSqmSuffix}`;
}
