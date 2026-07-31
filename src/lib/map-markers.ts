import type { MapProperty } from "@/lib/types/property-listing";
import {
  formatMapPriceLabel,
  formatMapPricePerSqmLabel,
} from "@/lib/map-price-label";
import { getMarkerStyle } from "@/lib/map-marker-style";
import { getPricePerSqm } from "@/lib/price-display";

export function buildPriceMarkerHtml(
  property: MapProperty,
  selectedId: string | null,
  perSqmSuffix = "/m²",
): string {
  const isSelected = property.id === selectedId;
  const price = formatMapPriceLabel(property.total_price);
  const pricePerSqmValue = getPricePerSqm(property);
  const pricePerSqm =
    pricePerSqmValue != null
      ? formatMapPricePerSqmLabel(pricePerSqmValue, perSqmSuffix)
      : "";
  const ariaLabel = pricePerSqm ? `${price}, ${pricePerSqm}` : price;
  const { background, accent, locationTier } = getMarkerStyle(property);

  const locationBadge =
    locationTier === "village"
      ? `<span class="kera-price-marker__badge kera-price-marker__badge--village" style="background:#8BC34A"></span>`
      : locationTier === "city"
        ? `<span class="kera-price-marker__badge kera-price-marker__badge--city" style="background:${accent}"></span>`
        : `<span class="kera-price-marker__badge kera-price-marker__badge--metro" style="background:${accent}"></span>`;

  const priceHtml = pricePerSqm
    ? `<span class="kera-price-marker__prices"><span class="kera-price-marker__total">${price}</span><span class="kera-price-marker__sqm">${pricePerSqm}</span></span>`
    : `<span>${price}</span>`;

  return `<div class="kera-price-marker${isSelected ? " is-selected" : ""}" style="--marker-bg:${background};--marker-accent:${accent}" role="button" tabindex="0" aria-label="${ariaLabel}">${locationBadge}${priceHtml}</div>`;
}

export function priceMarkerIconOptions(
  property: MapProperty,
  selectedId: string | null,
  perSqmSuffix = "/m²",
) {
  const price = formatMapPriceLabel(property.total_price);
  const pricePerSqmValue = getPricePerSqm(property);
  const pricePerSqm =
    pricePerSqmValue != null
      ? formatMapPricePerSqmLabel(pricePerSqmValue, perSqmSuffix)
      : "";
  const labelWidth = Math.max(price.length, pricePerSqm.length);
  const charWidth = Math.max(labelWidth * 7 + 32, 52);
  const iconHeight = pricePerSqm ? 44 : 36;

  return {
    className: "kera-price-marker-wrap",
    html: buildPriceMarkerHtml(property, selectedId, perSqmSuffix),
    iconSize: [charWidth, iconHeight] as [number, number],
    iconAnchor: [charWidth / 2, iconHeight] as [number, number],
  };
}
