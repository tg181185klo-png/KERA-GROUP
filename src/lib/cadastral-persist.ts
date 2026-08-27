import { formatCadastralCode, isValidCadastralCode } from "@/lib/cadastral";
import {
  lookupCadastralParcel,
  isLikelyRealParcel,
  type CadastralParcel,
} from "@/lib/cadastral-lookup";
import type { PropertyRow } from "@/lib/property-normalize";
import { parseGeojsonForClient } from "@/lib/property-normalize";

/** True when listing already has cadastral geometry stored locally. */
export function rowHasStoredCadastralGeometry(row: PropertyRow): boolean {
  const geojson = parseGeojsonForClient(row.geojson_polygon);
  if (geojson?.coordinates?.[0]?.length) return true;

  const lat = row.latitude;
  const lng = row.longitude;
  const hasLat =
    (typeof lat === "number" && !Number.isNaN(lat)) ||
    (typeof lat === "string" && lat !== "" && !Number.isNaN(Number(lat)));
  const hasLng =
    (typeof lng === "number" && !Number.isNaN(lng)) ||
    (typeof lng === "string" && lng !== "" && !Number.isNaN(Number(lng)));

  return hasLat && hasLng;
}

/** Fetch parcel boundaries from NAPR/maps.gov.ge — never throws. */
export async function fetchCadastralForStorage(
  cadastralCode: string,
): Promise<CadastralParcel | null> {
  const formatted = formatCadastralCode(cadastralCode);
  if (!formatted || formatted.startsWith("TEMP-") || !isValidCadastralCode(formatted)) {
    return null;
  }

  try {
    return await lookupCadastralParcel(formatted);
  } catch {
    return null;
  }
}

export function applyCadastralParcelToPayload(
  payload: Record<string, unknown>,
  parcel: CadastralParcel | null,
  fallback?: Record<string, unknown>,
) {
  if (parcel) {
    payload.cadastral_code = parcel.cadastral_code;
    payload.latitude = parcel.latitude;
    payload.longitude = parcel.longitude;
    payload.geojson_polygon = parcel.geojson_polygon;
    if (parcel.address && !payload.address) {
      payload.address = parcel.address;
    }
    return;
  }

  if (fallback?.cadastral_code && !String(fallback.cadastral_code).startsWith("TEMP-")) {
    payload.cadastral_code = formatCadastralCode(String(fallback.cadastral_code));
  }
  if (fallback?.latitude != null) payload.latitude = fallback.latitude;
  if (fallback?.longitude != null) payload.longitude = fallback.longitude;
  if (fallback?.geojson_polygon) payload.geojson_polygon = fallback.geojson_polygon;
  if (fallback?.address && !payload.address) payload.address = fallback.address;
}

export function cadastralCodeChanged(
  existing: Record<string, unknown>,
  nextCode: string | undefined,
): boolean {
  if (!nextCode?.trim()) return false;
  const formatted = formatCadastralCode(nextCode);
  if (!formatted || formatted.startsWith("TEMP-")) return false;
  const previous = formatCadastralCode(String(existing.cadastral_code ?? ""));
  return formatted !== previous;
}

export function hasRealStoredPolygon(row: Record<string, unknown>): boolean {
  return isLikelyRealParcel(parseGeojsonForClient(row.geojson_polygon));
}
