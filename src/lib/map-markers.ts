import type { MapProperty } from "@/lib/types/property-listing";
import { formatMapPriceLabel } from "@/lib/map-price-label";
import { getMarkerStyle } from "@/lib/map-marker-style";

export function buildPriceMarkerHtml(
  property: MapProperty,
  selectedId: string | null,
): string {
  const isSelected = property.id === selectedId;
  const price = formatMapPriceLabel(property.total_price);
  const { background, accent, locationTier } = getMarkerStyle(property);

  const locationBadge =
    locationTier === "village"
      ? `<span class="kera-price-marker__badge kera-price-marker__badge--village" style="background:#8BC34A"></span>`
      : locationTier === "city"
        ? `<span class="kera-price-marker__badge kera-price-marker__badge--city" style="background:${accent}"></span>`
        : `<span class="kera-price-marker__badge kera-price-marker__badge--metro" style="background:${accent}"></span>`;

  return `<div class="kera-price-marker${isSelected ? " is-selected" : ""}" style="--marker-bg:${background};--marker-accent:${accent}" role="button" tabindex="0" aria-label="${price}">${locationBadge}<span>${price}</span></div>`;
}

export function priceMarkerIconOptions(
  property: MapProperty,
  selectedId: string | null,
) {
  const price = formatMapPriceLabel(property.total_price);
  const charWidth = Math.max(price.length * 7 + 32, 52);

  return {
    className: "kera-price-marker-wrap",
    html: buildPriceMarkerHtml(property, selectedId),
    iconSize: [charWidth, 36] as [number, number],
    iconAnchor: [charWidth / 2, 36] as [number, number],
  };
}
