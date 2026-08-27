import type { GeoJSON } from "geojson";
import { formatCadastralCode } from "@/lib/cadastral";
import { polygonCentroidFromGeoJson, wktToGeoJsonPolygon } from "@/lib/wkt";

const MAPS_PORTAL = "https://maps.gov.ge/map/portal";
const MAPS_API = "https://maps.gov.ge";
const REQUEST_TIMEOUT_MS = 12_000;

export type MapsGovParcel = {
  cadastral_code: string;
  address: string | null;
  latitude: number;
  longitude: number;
  geojson_polygon: GeoJSON.Polygon;
};

type SearchHit = {
  name?: string;
  descript?: string;
  details?: {
    geometry_link?: string;
  };
};

type GeometryHit = {
  name?: string;
  descript?: string;
  proj?: string;
  shape?: string;
  shape_format?: string;
};

async function mapsFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) return null;

    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function searchCadastralLabel(
  cadastralCode: string,
): Promise<{ label: string; name: string; address: string | null } | null> {
  const search = await mapsFetch<{ status?: boolean; result?: SearchHit[] }>(
    `${MAPS_PORTAL}/search`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword: cadastralCode,
        keyword_description: "",
      }),
    },
  );

  const hit = search?.result?.[0];
  const geometryLink = hit?.details?.geometry_link;
  if (!geometryLink) return null;

  const labelMatch = geometryLink.match(/lbl=([^&]+)/i);
  if (!labelMatch?.[1]) return null;

  return {
    label: decodeURIComponent(labelMatch[1]),
    name: hit.name ?? cadastralCode,
    address: hit.descript?.trim() || null,
  };
}

async function fetchParcelShape(label: string): Promise<GeometryHit | null> {
  const params = new URLSearchParams({
    lbl: label,
    res: "shp",
    fmt: "json",
    lang: "ka",
  });

  const data = await mapsFetch<{ data?: GeometryHit[] }>(
    `${MAPS_API}/lr/bo/mg/getinfo.alpha?${params.toString()}`,
  );

  return data?.data?.[0] ?? null;
}

/** Lookup parcel polygon + centroid via maps.gov.ge (same source as NAPR public map). */
export async function lookupCadastralFromMapsGov(
  cadastralCode: string,
): Promise<MapsGovParcel | null> {
  const formatted = formatCadastralCode(cadastralCode);
  const search = await searchCadastralLabel(formatted);
  if (!search) return null;

  const geometry = await fetchParcelShape(search.label);
  const wkt = geometry?.shape?.trim();
  if (!wkt) return null;

  const geojson_polygon = wktToGeoJsonPolygon(wkt);
  if (!geojson_polygon) return null;

  const { latitude, longitude } = polygonCentroidFromGeoJson(geojson_polygon);

  return {
    cadastral_code: formatCadastralCode(geometry?.name ?? search.name ?? formatted),
    address: geometry?.descript?.trim() || search.address,
    latitude,
    longitude,
    geojson_polygon,
  };
}

/** WMS base used by maps.gov.ge for cadastral parcel outlines. */
export const MAPS_GOV_GE_WMS = {
  url: "https://nv.napr.gov.ge/geoserver/wms",
  layers: "LR_PARCELS,NG_REG_LAYER",
  attribution: "© NAPR / maps.gov.ge",
} as const;
