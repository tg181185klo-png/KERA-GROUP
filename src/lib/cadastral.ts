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

/** Compact NAPR UNIQ_CODE (12 digits) → dotted cadastral code. */
export function uniqCodeToCadastral(uniqCode: string): string | null {
  const digits = uniqCode.replace(/\D/g, "");
  if (digits.length !== 12) return null;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 9)}.${digits.slice(9, 12)}`;
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
  const dotted = extractCadastralCode(code);
  if (dotted) return dotted;

  const fromUniq = uniqCodeToCadastral(code);
  if (fromUniq) return fromUniq;

  return code.trim();
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

export function formatPricePerSqm(price: number): string {
  return `${formatPrice(price)}/მ²`;
}

/** @deprecated Use /api/cadastral/lookup — kept for type compatibility */
export type CadastralLookupResult = {
  latitude: number;
  longitude: number;
  geojson_polygon: GeoJSON.Polygon;
  address?: string | null;
};
