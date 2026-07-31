import type { GeoJSON } from "geojson";

const FULL_CADASTRAL = /\d{2}\.\d{2}\.\d{2}\.\d{3}\.\d{3}/;
/** Common 4-part Georgian cadastral code, e.g. 30.11.32.467 */
const SHORT_CADASTRAL = /\d{2}\.\d{2}\.\d{2}\.\d{3,4}/;

/** Accepts standard 5-part and common 4-part cadastral formats. */
export function extractCadastralCode(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const full = trimmed.match(FULL_CADASTRAL);
  if (full) return full[0];

  const short = trimmed.match(SHORT_CADASTRAL);
  if (short) return short[0];

  return null;
}

/** Compact digit string (9–12 digits) → dotted cadastral code. */
export function digitsToCadastral(digits: string): string | null {
  const clean = digits.replace(/\D/g, "");
  if (clean.length === 12) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 9)}.${clean.slice(9, 12)}`;
  }
  if (clean.length === 11) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 9)}.${clean.slice(9, 11)}`;
  }
  if (clean.length === 10) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 10)}`;
  }
  if (clean.length === 9) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 9)}`;
  }
  return null;
}

/** Compact NAPR UNIQ_CODE (9–12 digits) → dotted cadastral code. */
export function uniqCodeToCadastral(uniqCode: string): string | null {
  return digitsToCadastral(uniqCode);
}

/** Dotted or compact cadastral code → NAPR UNIQ_CODE for API queries. */
export function cadastralToUniqCode(code: string): string | null {
  const dotted = extractCadastralCode(code);
  if (dotted) {
    const digits = dotted.replace(/\D/g, "");
    if (digits.length >= 9) return digits;
  }

  const digits = code.replace(/\D/g, "");
  if (digits.length >= 9 && digits.length <= 12) return digits;

  return null;
}

export function formatCadastralCode(code: string): string {
  const trimmed = code.trim();
  if (!trimmed || trimmed.startsWith("TEMP-")) return trimmed;

  const dotted = extractCadastralCode(trimmed);
  if (dotted) return dotted;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 9 && digits.length <= 12) {
    const fromDigits = digitsToCadastral(digits);
    if (fromDigits) return fromDigits;
  }

  return trimmed;
}

export function isValidCadastralCode(code: string): boolean {
  return cadastralToUniqCode(code) != null;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPricePerSqm(
  price: number,
  perSqmSuffix = "/მ²",
): string {
  return `${formatPrice(price)}${perSqmSuffix}`;
}

/** @deprecated Use /api/cadastral/lookup — kept for type compatibility */
export type CadastralLookupResult = {
  latitude: number;
  longitude: number;
  geojson_polygon: GeoJSON.Polygon;
  address?: string | null;
};
