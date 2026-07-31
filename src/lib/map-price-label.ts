/** Compact per-sqm label for map markers (e.g. $120/m²). */
export function formatMapPricePerSqmLabel(
  pricePerSqm: number,
  perSqmSuffix = "/m²",
): string {
  if (!Number.isFinite(pricePerSqm) || pricePerSqm <= 0) return "";

  if (pricePerSqm >= 1_000) {
    return `$${Math.round(pricePerSqm / 1_000)}K${perSqmSuffix}`;
  }

  return `$${Math.round(pricePerSqm)}${perSqmSuffix}`;
}

/** Compact price label for map markers (Landly-style). */
export function formatMapPriceLabel(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return "—";

  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    if (millions >= 100) return `$${Math.round(millions)}M`;
    if (millions >= 10) return `$${Math.round(millions)}M`;
    const rounded = Math.round(millions * 10) / 10;
    return `$${rounded % 1 === 0 ? rounded.toFixed(0) : rounded}M`;
  }

  if (price >= 1_000) {
    return `$${Math.round(price / 1_000)}K`;
  }

  return `$${Math.round(price)}`;
}
