import type { MapProperty } from "@/lib/types/property-listing";
import { formatPrice, formatPricePerSqm, formatCadastralCode } from "@/lib/cadastral";
import { getPricePerSqm, resolveAreaSqm } from "@/lib/price-display";
import { getPropertyBounds } from "@/lib/map-geometry";

export { getPropertyBounds };

export interface MapTooltipLabels {
  listingType: string;
  cadCode: string;
  address: string;
  phone: string;
  sqm: string;
  perSqm: string;
  fullPage: string;
  rooms: (count: number) => string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Strip municipality suffix from cadastral addresses for compact map display. */
function formatMapAddress(address: string): string {
  if (!address || address === "—") return address;
  return address
    .replace(/\s*მუნიციპალიტეტი\b/giu, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

function detailRow(label: string, value: string, valueClass = ""): string {
  if (!value || value === "—") return "";
  const valueCls = valueClass
    ? ` kera-map-hover-tooltip__value ${valueClass}`
    : " kera-map-hover-tooltip__value";
  return `
    <div class="kera-map-hover-tooltip__detail">
      <dt class="kera-map-hover-tooltip__label">${escapeHtml(label)}</dt>
      <dd class="${valueCls.trim()}">${escapeHtml(value)}</dd>
    </div>
  `;
}

function buildMapCardContent(
  property: MapProperty,
  labels: MapTooltipLabels,
): string {
  const pricePerSqmValue = getPricePerSqm(property);
  const pricePerSqm = pricePerSqmValue
    ? formatPricePerSqm(pricePerSqmValue, labels.perSqm)
    : "—";
  const areaSqm = resolveAreaSqm(property);
  const cadastral = formatCadastralCode(property.cadastral_code);
  const address = formatMapAddress(property.address);

  return `
    <span class="kera-map-hover-tooltip__badge">${escapeHtml(labels.listingType)}</span>
    <div class="kera-map-hover-tooltip__pricing">
      <span class="kera-map-hover-tooltip__price">${escapeHtml(formatPrice(property.total_price))}</span>
      ${pricePerSqmValue != null ? `<span class="kera-map-hover-tooltip__meta">${escapeHtml(pricePerSqm)}</span>` : ""}
      ${areaSqm > 0 ? `<span class="kera-map-hover-tooltip__meta">${areaSqm} ${escapeHtml(labels.sqm)}</span>` : ""}
    </div>
    <dl class="kera-map-hover-tooltip__details">
      ${detailRow(labels.cadCode, cadastral)}
      ${detailRow(labels.address, address, "kera-map-hover-tooltip__value--address")}
      ${detailRow(labels.phone, property.phone_number)}
    </dl>
    <div class="kera-map-hover-tooltip__footer">
      <a class="kera-map-hover-tooltip__link" href="/properties/${escapeHtml(property.id)}">${escapeHtml(labels.fullPage)}</a>
    </div>
  `;
}

export function buildMapHoverTooltipHtml(
  property: MapProperty,
  labels: MapTooltipLabels,
): string {
  return `
    <div class="kera-map-hover-tooltip__inner">
      ${buildMapCardContent(property, labels)}
    </div>
  `;
}

export function buildMapPopupHtml(
  property: MapProperty,
  labels: MapTooltipLabels,
): string {
  const image = property.images[0]
    ? `<img class="kera-map-popup__image" src="${escapeHtml(property.images[0])}" alt="" />`
    : "";

  return `
    <div class="kera-map-popup__inner">
      ${image}
      <div class="kera-map-hover-tooltip__inner kera-map-popup__body">
        ${buildMapCardContent(property, labels)}
      </div>
    </div>
  `;
}
