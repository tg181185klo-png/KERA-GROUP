import type { MapProperty } from "@/lib/types/property-listing";
import { formatPrice, formatPricePerSqm, formatCadastralCode } from "@/lib/cadastral";
import { getPricePerSqm } from "@/lib/price-display";
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

function detailRow(label: string, value: string): string {
  if (!value || value === "—") return "";
  return `
    <div class="kera-map-hover-tooltip__detail">
      <dt class="kera-map-hover-tooltip__label">${escapeHtml(label)}</dt>
      <dd class="kera-map-hover-tooltip__value">${escapeHtml(value)}</dd>
    </div>
  `;
}

export function buildMapHoverTooltipHtml(
  property: MapProperty,
  labels: MapTooltipLabels,
): string {
  const pricePerSqmValue = getPricePerSqm(property);
  const pricePerSqm = pricePerSqmValue
    ? formatPricePerSqm(pricePerSqmValue, labels.perSqm)
    : "—";

  const cadastral = formatCadastralCode(property.cadastral_code);

  return `
    <div class="kera-map-hover-tooltip__inner">
      <span class="kera-map-hover-tooltip__badge">${escapeHtml(labels.listingType)}</span>
      <h3 class="kera-map-hover-tooltip__title">${escapeHtml(property.title)}</h3>
      <div class="kera-map-hover-tooltip__pricing">
        <span class="kera-map-hover-tooltip__price">${escapeHtml(formatPrice(property.total_price))}</span>
        ${pricePerSqmValue ? `<span class="kera-map-hover-tooltip__meta">${escapeHtml(pricePerSqm)}</span>` : ""}
        ${property.area_sqm > 0 ? `<span class="kera-map-hover-tooltip__meta">${property.area_sqm} ${escapeHtml(labels.sqm)}</span>` : ""}
      </div>
      <dl class="kera-map-hover-tooltip__details">
        ${detailRow(labels.cadCode, cadastral)}
        ${detailRow(labels.address, property.address)}
        ${detailRow(labels.phone, property.phone_number)}
      </dl>
      <div class="kera-map-hover-tooltip__footer">
        <a class="kera-map-hover-tooltip__link" href="/properties/${escapeHtml(property.id)}">${escapeHtml(labels.fullPage)}</a>
      </div>
    </div>
  `;
}

export function buildMapPopupHtml(
  property: MapProperty,
  labels: MapTooltipLabels,
): string {
  const image = property.images[0]
    ? `<img src="${escapeHtml(property.images[0])}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
    : "";

  const pricePerSqmValue = getPricePerSqm(property);
  const pricePerSqm = pricePerSqmValue
    ? formatPricePerSqm(pricePerSqmValue, labels.perSqm)
    : "—";

  return `
    <div style="min-width:200px;max-width:260px;font-family:system-ui,sans-serif;">
      ${image}
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;color:#ef7d00;">
        ${escapeHtml(labels.listingType)}
      </p>
      <h3 style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1a1a1a;line-height:1.3;">
        ${escapeHtml(property.title)}
      </h3>
      <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#00a3e0;">
        ${escapeHtml(formatPrice(property.total_price))}
      </p>
      ${pricePerSqmValue ? `<p style="margin:0 0 4px;font-size:12px;color:#64748b;">${escapeHtml(pricePerSqm)}</p>` : ""}
      ${property.area_sqm > 0 ? `<p style="margin:0 0 6px;font-size:12px;color:#64748b;">${property.area_sqm} ${escapeHtml(labels.sqm)}</p>` : ""}
      <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;">კად. ${escapeHtml(formatCadastralCode(property.cadastral_code))}</p>
      <p style="margin:0 0 4px;font-size:12px;color:#475569;">${escapeHtml(property.address)}</p>
      <p style="margin:0 0 10px;font-size:12px;color:#475569;">${escapeHtml(property.phone_number)}</p>
      <a href="/properties/${escapeHtml(property.id)}" style="display:inline-block;font-size:12px;font-weight:600;color:#00a3e0;text-decoration:none;">
        ${escapeHtml(labels.fullPage)}
      </a>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
