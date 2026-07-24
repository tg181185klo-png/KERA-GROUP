import type { GeoJSON } from "geojson";
import { cadastralToUniqCode, formatCadastralCode } from "@/lib/cadastral";

const CADASTRAL_API_BASE =
  process.env.CADASTRAL_API_URL ??
  "http://gisappsn.reestri.gov.ge/ArcGIS/rest/services/CadRepGeo/MapServer";

/** Parcel (ნაკვეთი) layer IDs — one per Georgian region in CadRepGeo */
const PARCEL_LAYER_IDS = [10, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59];

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

function polygonCentroid(polygon: GeoJSON.Polygon): { latitude: number; longitude: number } {
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
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = (await res.json()) as ArcGISQueryResponse;
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

/** Fetch real parcel polygon + coordinates from NAPR CadRepGeo service. */
export async function lookupCadastralParcel(
  cadastralCode: string,
): Promise<CadastralParcel | null> {
  const uniqCode = cadastralToUniqCode(cadastralCode);
  if (!uniqCode) return null;

  const cachedAt = cacheTimestamps.get(uniqCode);
  if (cachedAt && Date.now() - cachedAt < CACHE_TTL_MS && cache.has(uniqCode)) {
    return cache.get(uniqCode) ?? null;
  }

  const results = await Promise.all(
    PARCEL_LAYER_IDS.map((layerId) => queryLayer(layerId, uniqCode)),
  );

  const parcel = results.find((item): item is CadastralParcel => item != null) ?? null;

  cache.set(uniqCode, parcel);
  cacheTimestamps.set(uniqCode, Date.now());

  return parcel;
}

export async function buildMapPersistPayload(
  row: Record<string, unknown>,
  getCadastralCode: (row: Record<string, unknown>) => string,
): Promise<Record<string, unknown>> {
  const payload: Record<string, unknown> = { status: "active" };
  const cadastral = getCadastralCode(row);

  if (cadastral !== "—") {
    const parcel = await lookupCadastralParcel(cadastral);
    if (parcel) {
      payload.latitude = parcel.latitude;
      payload.longitude = parcel.longitude;
      payload.geojson_polygon = parcel.geojson_polygon;
      if (parcel.address && !row.address) {
        payload.address = parcel.address;
      }
      return payload;
    }
  }

  if (row.latitude != null) payload.latitude = row.latitude;
  if (row.longitude != null) payload.longitude = row.longitude;
  if (row.geojson_polygon) payload.geojson_polygon = row.geojson_polygon;

  return payload;
}

export async function enrichRowWithCadastral(
  row: Record<string, unknown>,
  getCadastralCode: (row: Record<string, unknown>) => string,
): Promise<Record<string, unknown>> {
  const hasLat =
    typeof row.latitude === "number" ||
    (typeof row.latitude === "string" && row.latitude !== "");
  const hasGeo = row.geojson_polygon != null;

  if (hasLat && hasGeo) return row;

  const cadastral = getCadastralCode(row);
  if (cadastral === "—") return row;

  const parcel = await lookupCadastralParcel(cadastral);
  if (!parcel) return row;

  return {
    ...row,
    latitude: parcel.latitude,
    longitude: parcel.longitude,
    geojson_polygon: parcel.geojson_polygon,
    address: row.address ?? parcel.address ?? row.address,
  };
}
