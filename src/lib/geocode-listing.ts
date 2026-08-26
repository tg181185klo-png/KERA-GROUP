import type { MapProperty } from "@/lib/types/property-listing";
import type { PropertyRow } from "@/lib/property-normalize";
import { extractCadastralCode } from "@/lib/cadastral";
import { geocodeAddress } from "@/lib/geocode";

/** Georgian place names often found in listing titles/addresses. */
const CITY_HINTS: Array<{ pattern: RegExp; query: string }> = [
  { pattern: /ბაღდათ/i, query: "Baghdati, Georgia" },
  { pattern: /წყალტუბ/i, query: "Tskaltubo, Georgia" },
  { pattern: /ქუთაის/i, query: "Kutaisi, Georgia" },
  { pattern: /თბილის/i, query: "Tbilisi, Georgia" },
  { pattern: /ბათუმ/i, query: "Batumi, Georgia" },
  { pattern: /ზუგდიდ/i, query: "Zugdidi, Georgia" },
  { pattern: /რუსთავ/i, query: "Rustavi, Georgia" },
  { pattern: /გორი/i, query: "Gori, Georgia" },
  { pattern: /ფოთ/i, query: "Poti, Georgia" },
  { pattern: /საჩხერ/i, query: "Tbilisi Sachkhere, Georgia" },
];

/** Cadastral region prefix → approximate city for map fallback. */
const CADASTRAL_REGION_GEOCODE: Record<string, string> = {
  "01": "Tbilisi, Georgia",
  "02": "Batumi, Georgia",
  "03": "Ozurgeti, Georgia",
  "04": "Kutaisi, Georgia",
  "05": "Telavi, Georgia",
  "06": "Mtskheta, Georgia",
  "07": "Ambrolauri, Georgia",
  "08": "Zugdidi, Georgia",
  "09": "Akhaltsikhe, Georgia",
  "10": "Rustavi, Georgia",
  "11": "Gori, Georgia",
  "29": "Tskaltubo, Georgia",
  "30": "Baghdati, Georgia",
  "31": "Kutaisi, Georgia",
  "32": "Kutaisi, Georgia",
  "33": "Kutaisi, Georgia",
};

function uniqueQueries(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length <= 2) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function cityQueriesFromText(...parts: string[]): string[] {
  const joined = parts.filter(Boolean).join(" ");
  const queries: string[] = [];
  for (const hint of CITY_HINTS) {
    if (hint.pattern.test(joined)) queries.push(hint.query);
  }
  return queries;
}

function cadastralRegionQuery(cadastralCode: string | null | undefined): string | null {
  if (!cadastralCode) return null;
  const dotted = extractCadastralCode(cadastralCode) ?? cadastralCode;
  const region = dotted.split(".")[0];
  return CADASTRAL_REGION_GEOCODE[region] ?? null;
}

export function buildListingGeocodeQueries(row: PropertyRow): string[] {
  const title = String(row.title ?? "").trim();
  const address = String(row.address ?? "").trim();
  const description = String(row.description ?? "").trim();
  const cadastral = String(row.cadastral_code ?? "").trim();
  const cityHints = cityQueriesFromText(title, address, description);
  const regionQuery = cadastralRegionQuery(cadastral);

  return uniqueQueries([
    ...cityHints,
    regionQuery ?? "",
    address,
    title,
    `${title}, ${address}`.trim(),
    `${address}, ${title}`.trim(),
    description,
  ]);
}

export function buildMapPropertyGeocodeQueries(property: MapProperty): string[] {
  const title = String(property.title ?? "").trim();
  const address = String(property.address ?? "").trim();
  const cityHints = cityQueriesFromText(title, address);
  const regionQuery = cadastralRegionQuery(property.cadastral_code);

  return uniqueQueries([
    ...cityHints,
    regionQuery ?? "",
    address,
    title,
    `${title}, ${address}`.trim(),
  ]);
}

export async function geocodeListingRow(
  row: PropertyRow,
): Promise<{ lat: number; lng: number } | null> {
  for (const query of buildListingGeocodeQueries(row)) {
    const coords = await geocodeAddress(query);
    if (coords) return coords;
  }
  return null;
}

export async function geocodeMapProperty(
  property: MapProperty,
): Promise<{ lat: number; lng: number } | null> {
  for (const query of buildMapPropertyGeocodeQueries(property)) {
    const coords = await geocodeAddress(query);
    if (coords) return coords;
  }
  return null;
}
