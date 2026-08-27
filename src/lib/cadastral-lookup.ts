import type { GeoJSON } from "geojson";
import { cadastralToUniqCode, extractCadastralCode, formatCadastralCode } from "@/lib/cadastral";
import { CADASTRAL_API_BASE } from "@/lib/constants";
import { lookupCadastralFromMapsGov } from "@/lib/maps-gov-ge";

/** Parcel (ნაკვეთი) layer IDs — one per Georgian region in CadRepGeo */
const PARCEL_LAYER_IDS = [10, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59];
const LAYER_QUERY_TIMEOUT_MS = 2_500;
const MAX_LAYER_ATTEMPTS = 4;

let naprUnavailableUntil = 0;

/** Cadastral region prefix (first segment) → NAPR CadRepGeo layer ID */
const REGION_LAYER_MAP: Record<string, number> = {
  "01": 10, // თბილისი
  "02": 14, // აჭარა
  "03": 19, // გურია
  "04": 19, // იმერეთი (alternate)
  "05": 29, // კახეთი
  "06": 34, // მცხეთა-მთიანეთი
  "07": 39, // რაჭა-ლეჩხუმი
  "08": 44, // სამეგრelo-ზemo სvaneti
  "09": 49, // სამtskheto-javakheti
  "10": 54, // ქვემო kartli
  "11": 59, // შida kartli
  "29": 44, // სამეგრelo / აფხაზეთი
  "30": 24, // იმერეთი / ბაღდათი
  "31": 24,
  "32": 24,
  "33": 24,
};

function layerOrderForCadastral(cadastralCode: string): number[] {
  const dotted = extractCadastralCode(cadastralCode);
  const region = dotted?.split(".")[0];
  const preferred = region ? REGION_LAYER_MAP[region] : undefined;

  if (preferred) {
    return [
      preferred,
      ...PARCEL_LAYER_IDS.filter((id) => id !== preferred).slice(0, MAX_LAYER_ATTEMPTS - 1),
    ];
  }

  return PARCEL_LAYER_IDS.slice(0, MAX_LAYER_ATTEMPTS);
}

export type CadastralParcel = {
  cadastral_code: string;
  uniq_code: string;
  address: string | null;
  latitude: number;
  longitude: number;
  geojson_polygon: GeoJSON.Polygon;
};

type ArcGISQueryResponse = {
  features?: Array<{
    attributes?: {
      UNIQ_CODE?: string;
      MISAMARTI?: string | null;
    };
    geometry?: {
      rings?: number[][][];
    };
  }>;
};

const cache = new Map<string, CadastralParcel | null>();
const CACHE_TTL_MS = 60 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

function ringsToGeoJson(rings: number[][][]): GeoJSON.Polygon {
  return {
    type: "Polygon",
    coordinates: rings.map((ring) => ring.map(([lng, lat]) => [lng, lat])),
  };
}

function polygonCentroid(polygon: GeoJSON.Polygon): {
  latitude: number;
  longitude: number;
} {
  const ring = polygon.coordinates[0];
  if (!ring?.length) {
    return { latitude: 41.7151, longitude: 44.8271 };
  }

  let sumLat = 0;
  let sumLng = 0;
  let count = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const [lng, lat] = ring[i];
    sumLng += lng;
    sumLat += lat;
    count++;
  }

  return {
    latitude: sumLat / count,
    longitude: sumLng / count,
  };
}

/** Real NAPR parcels usually have many vertices; old simulated squares had ~5. */
export function isLikelyRealParcel(geojson: unknown): boolean {
  if (!geojson || typeof geojson !== "object") return false;
  const ring = (geojson as GeoJSON.Polygon).coordinates?.[0];
  return Array.isArray(ring) && ring.length >= 8;
}

async function queryLayer(
  layerId: number,
  uniqCode: string,
): Promise<CadastralParcel | null> {
  const url = new URL(`${CADASTRAL_API_BASE}/${layerId}/query`);
  url.searchParams.set("where", `UNIQ_CODE='${uniqCode}'`);
  url.searchParams.set("outFields", "UNIQ_CODE,MISAMARTI");
  url.searchParams.set("returnGeometry", "true");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("f", "json");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LAYER_QUERY_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    const raw = await res.text();
    if (!contentType.includes("json") || raw.trimStart().startsWith("<")) {
      naprUnavailableUntil = Date.now() + 5 * 60 * 1000;
      return null;
    }

    let data: ArcGISQueryResponse;
    try {
      data = JSON.parse(raw) as ArcGISQueryResponse;
    } catch {
      naprUnavailableUntil = Date.now() + 5 * 60 * 1000;
      return null;
    }
    const feature = data.features?.[0];
    if (!feature?.geometry?.rings?.length) return null;

    const rings = feature.geometry.rings;
    const geojson_polygon = ringsToGeoJson(rings);
    const { latitude, longitude } = polygonCentroid(geojson_polygon);
    const dotted = formatCadastralCode(uniqCode);

    return {
      cadastral_code: dotted,
      uniq_code: uniqCode,
      address: feature.attributes?.MISAMARTI ?? null,
      latitude,
      longitude,
      geojson_polygon,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function uniqCodeVariants(cadastralCode: string): string[] {
  const base = cadastralToUniqCode(cadastralCode);
  if (!base) return [];

  const variants = new Set<string>([base]);
  if (base.length < 12) {
    variants.add(base.padStart(12, "0"));
  }
  if (base.length === 9) {
    variants.add(`${base}000`);
  }
  const trimmed = base.replace(/^0+/, "");
  if (trimmed) variants.add(trimmed);

  return [...variants];
}

async function lookupParcelAcrossLayers(
  cadastralCode: string,
  uniqCode: string,
): Promise<CadastralParcel | null> {
  const preferred = layerOrderForCadastral(cadastralCode);
  const allLayers = [...new Set([...preferred, ...PARCEL_LAYER_IDS])];

  const results = await Promise.all(
    allLayers.map((layerId) => queryLayer(layerId, uniqCode)),
  );

  return results.find((parcel) => parcel != null) ?? null;
}

/** Fetch real parcel polygon + coordinates (maps.gov.ge → NAPR CadRepGeo fallback). */
export async function lookupCadastralParcel(
  cadastralCode: string,
): Promise<CadastralParcel | null> {
  const formatted = formatCadastralCode(cadastralCode);
  const mapsCacheKey = `maps:${formatted}`;
  const mapsCachedAt = cacheTimestamps.get(mapsCacheKey);
  if (
    mapsCachedAt &&
    Date.now() - mapsCachedAt < CACHE_TTL_MS &&
    cache.has(mapsCacheKey)
  ) {
    return cache.get(mapsCacheKey) ?? null;
  }

  const fromMapsGov = await lookupCadastralFromMapsGov(formatted);
  if (fromMapsGov) {
    const parcel: CadastralParcel = {
      cadastral_code: fromMapsGov.cadastral_code,
      uniq_code:
        cadastralToUniqCode(fromMapsGov.cadastral_code) ??
        fromMapsGov.cadastral_code,
      address: fromMapsGov.address,
      latitude: fromMapsGov.latitude,
      longitude: fromMapsGov.longitude,
      geojson_polygon: fromMapsGov.geojson_polygon,
    };
    cache.set(mapsCacheKey, parcel);
    cacheTimestamps.set(mapsCacheKey, Date.now());
    return parcel;
  }

  if (Date.now() < naprUnavailableUntil) return null;

  const variants = uniqCodeVariants(cadastralCode);
  if (!variants.length) return null;

  for (const uniqCode of variants) {
    const cachedAt = cacheTimestamps.get(uniqCode);
    if (cachedAt && Date.now() - cachedAt < CACHE_TTL_MS && cache.has(uniqCode)) {
      const cached = cache.get(uniqCode) ?? null;
      if (cached) return cached;
      continue;
    }

    const parcel = await lookupParcelAcrossLayers(cadastralCode, uniqCode);
    if (parcel) {
      for (const alias of variants) {
        cache.set(alias, parcel);
        cacheTimestamps.set(alias, Date.now());
      }
      return parcel;
    }

    cache.set(uniqCode, null);
    cacheTimestamps.set(uniqCode, Date.now());
  }

  return null;
}

export async function buildMapPersistPayload(
  row: Record<string, unknown>,
  getCadastralCode: (row: Record<string, unknown>) => string,
): Promise<Record<string, unknown>> {
  const enriched = await enrichRowWithCadastral(row, getCadastralCode);
  const payload: Record<string, unknown> = { status: "active" };

  if (enriched.latitude != null) payload.latitude = enriched.latitude;
  if (enriched.longitude != null) payload.longitude = enriched.longitude;
  if (enriched.geojson_polygon) payload.geojson_polygon = enriched.geojson_polygon;
  if (enriched.cadastral_code) payload.cadastral_code = enriched.cadastral_code;
  const address = String(enriched.address ?? "").trim();
  if (address) payload.address = address;

  return payload;
}

export async function enrichRowWithCadastral(
  row: Record<string, unknown>,
  getCadastralCode: (row: Record<string, unknown>) => string,
  options?: { force?: boolean },
): Promise<Record<string, unknown>> {
  const cadastral = getCadastralCode(row);
  if (cadastral === "—") return row;

  const hasLat =
    typeof row.latitude === "number" ||
    (typeof row.latitude === "string" && row.latitude !== "");
  const hasRealParcel =
    hasLat && isLikelyRealParcel(row.geojson_polygon);

  if (!options?.force && hasRealParcel) return row;

  const parcel = await lookupCadastralParcel(cadastral);
  if (!parcel) return row;

  return {
    ...row,
    cadastral_code: parcel.cadastral_code || row.cadastral_code,
    latitude: parcel.latitude ?? row.latitude,
    longitude: parcel.longitude ?? row.longitude,
    geojson_polygon: parcel.geojson_polygon ?? row.geojson_polygon,
    address: String(row.address ?? "").trim() || parcel.address || row.address,
  };
}

export function cadastralCoordsPayload(parcel: CadastralParcel) {
  return {
    latitude: parcel.latitude,
    longitude: parcel.longitude,
    geojson_polygon: parcel.geojson_polygon,
  };
}
