import type { MapProperty } from "@/lib/types/property-listing";
import { formatCadastralCode } from "@/lib/cadastral";
import { wktToGeoJsonPolygon, polygonCentroidFromGeoJson } from "@/lib/wkt";

const MAPS_PORTAL = "https://maps.gov.ge/map/portal";
const MAPS_API = "https://maps.gov.ge";

export type CadastralLookupResult = {
  cadastral_code: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  geojson_polygon: MapProperty["geojson_polygon"];
};

/** Browser-side maps.gov.ge lookup — fallback only; may fail on CORS. */
export async function fetchCadastralFromMapsGovClient(
  cadastralCode: string,
): Promise<CadastralLookupResult | null> {
  try {
    const formatted = formatCadastralCode(cadastralCode);

    const searchRes = await fetch(`${MAPS_PORTAL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: "https://maps.gov.ge/map/",
      },
      body: JSON.stringify({ keyword: formatted, keyword_description: "" }),
      cache: "no-store",
    });

    if (!searchRes.ok) return null;

    const search = (await searchRes.json()) as {
      result?: Array<{
        name?: string;
        descript?: string;
        details?: { geometry_link?: string };
      }>;
    };

    const geometryLink = search.result?.[0]?.details?.geometry_link;
    if (!geometryLink) return null;

    const geoRes = await fetch(
      `${MAPS_API}${geometryLink}&fmt=json&lang=ka`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Referer: "https://maps.gov.ge/map/",
        },
      },
    );

    if (!geoRes.ok) return null;

    const contentType = geoRes.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) return null;

    const payload = (await geoRes.json()) as {
      data?: Array<{ name?: string; descript?: string; shape?: string }>;
    };

    const hit = payload.data?.[0];
    const wkt = hit?.shape?.trim();
    if (!wkt) return null;

    const geojson_polygon = wktToGeoJsonPolygon(wkt);
    if (!geojson_polygon) return null;

    const { latitude, longitude } = polygonCentroidFromGeoJson(geojson_polygon);

    return {
      cadastral_code: formatCadastralCode(hit?.name ?? formatted),
      address: hit?.descript?.trim() || search.result?.[0]?.descript?.trim() || null,
      latitude,
      longitude,
      geojson_polygon,
    };
  } catch {
    return null;
  }
}

/** Browser first (user IP); server API fallback when geometry WAF blocks datacenter IPs. */
export async function lookupCadastralWithFallback(
  cadastralCode: string,
): Promise<CadastralLookupResult | null> {
  const fromBrowser = await fetchCadastralFromMapsGovClient(cadastralCode);
  if (fromBrowser) return fromBrowser;

  try {
    const res = await fetch(
      `/api/cadastral/lookup?code=${encodeURIComponent(cadastralCode)}`,
      { cache: "no-store" },
    );
    const data = await res.json();
    if (res.ok && data.latitude != null && data.geojson_polygon) {
      return {
        cadastral_code: formatCadastralCode(data.cadastral_code ?? cadastralCode),
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        geojson_polygon: data.geojson_polygon,
      };
    }
  } catch {
    // ignore
  }

  return null;
}
