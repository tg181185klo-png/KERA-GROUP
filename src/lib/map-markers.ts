import type { MapProperty } from "@/lib/types/property-listing";
import { formatMapPriceLabel } from "@/lib/map-price-label";

export function buildPriceMarkerHtml(
  property: MapProperty,
  selectedId: string | null,
): string {
  const isSelected = property.id === selectedId;
  const isRent = property.listing_type === "rent";
  const price = formatMapPriceLabel(property.total_price);
  const variant = isRent ? "rent" : "sale";

  return `<div class="kera-price-marker kera-price-marker--${variant}${isSelected ? " is-selected" : ""}" role="button" tabindex="0" aria-label="${price}"><span>${price}</span></div>`;
}

export function priceMarkerIconOptions(
  property: MapProperty,
  selectedId: string | null,
) {
  const price = formatMapPriceLabel(property.total_price);
  const charWidth = Math.max(price.length * 7 + 24, 44);

  return {
    className: "kera-price-marker-wrap",
    html: buildPriceMarkerHtml(property, selectedId),
    iconSize: [charWidth, 34] as [number, number],
    iconAnchor: [charWidth / 2, 34] as [number, number],
  };
}
