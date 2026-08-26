import { enrichRowWithCadastral, isLikelyRealParcel } from "@/lib/cadastral-lookup";
import { geocodeAddress } from "@/lib/geocode";
import {
  publicStatusFilter,
  isPubliclyVisibleListing,
} from "@/lib/listing-status";
import { expireStaleMapListings } from "@/lib/listing-expiry";
import {
  getCadastralCode,
  isMappableProperty,
  normalizeToMapProperty,
  resolveMapCoordinates,
  type PropertyRow,
} from "@/lib/property-normalize";
import { createServiceClient } from "@/lib/supabase/server";

function rowMissingMapCoords(row: PropertyRow): boolean {
  const { lat, lng } = resolveMapCoordinates(row);
  return lat == null || lng == null;
}

function rowHasCadastralCode(row: PropertyRow): boolean {
  const cadastral = getCadastralCode(row);
  return cadastral !== "—" && !cadastral.startsWith("TEMP-");
}

async function persistCadastralCoords(
  id: string,
  enriched: Record<string, unknown>,
  original: Record<string, unknown>,
) {
  const payload: Record<string, unknown> = {};

  const nextLat = enriched.latitude ?? original.latitude;
  const nextLng = enriched.longitude ?? original.longitude;
  const nextGeo = enriched.geojson_polygon ?? original.geojson_polygon;
  const nextCadastral = enriched.cadastral_code ?? original.cadastral_code;

  if (nextLat != null && nextLat !== original.latitude) payload.latitude = nextLat;
  else if (original.latitude == null && enriched.latitude != null) {
    payload.latitude = enriched.latitude;
  }

  if (nextLng != null && nextLng !== original.longitude) payload.longitude = nextLng;
  else if (original.longitude == null && enriched.longitude != null) {
    payload.longitude = enriched.longitude;
  }

  if (
    enriched.geojson_polygon &&
    (isLikelyRealParcel(enriched.geojson_polygon) || !original.geojson_polygon)
  ) {
    payload.geojson_polygon = enriched.geojson_polygon;
    if (enriched.latitude != null) payload.latitude = enriched.latitude;
    if (enriched.longitude != null) payload.longitude = enriched.longitude;
  }

  if (
    typeof nextCadastral === "string" &&
    nextCadastral &&
    nextCadastral !== original.cadastral_code &&
    !String(nextCadastral).startsWith("TEMP-")
  ) {
    payload.cadastral_code = nextCadastral;
  }

  if (Object.keys(payload).length === 0) return;

  const service = createServiceClient();
  await service.from("properties").update(payload).eq("id", id);
}

async function enrichRowCadastral(row: PropertyRow): Promise<PropertyRow> {
  if (!rowHasCadastralCode(row)) return row;

  const { lat, lng, geojson } = resolveMapCoordinates(row);
  const hasPoint = lat != null && lng != null;
  const hasRealParcel = hasPoint && isLikelyRealParcel(geojson);
  if (hasRealParcel) return row;

  try {
    const updated = (await enrichRowWithCadastral(row, getCadastralCode, {
      force: !hasPoint,
    })) as PropertyRow;

    if (row.id) {
      await persistCadastralCoords(String(row.id), updated, row);
    }

    return updated;
  } catch {
    return row;
  }
}

async function enrichRowGeocode(row: PropertyRow): Promise<PropertyRow> {
  if (!rowMissingMapCoords(row)) return row;

  const address = String(row.address ?? "").trim();
  if (address.length <= 3) return row;

  const coords = await geocodeAddress(address);
  if (!coords) return row;

  const updated = {
    ...row,
    latitude: coords.lat,
    longitude: coords.lng,
  };

  if (row.id) {
    await persistCadastralCoords(String(row.id), updated, row);
  }

  return updated;
}

async function enrichRows(rows: PropertyRow[]) {
  const withCadastral = await Promise.all(rows.map((row) => enrichRowCadastral(row)));
  return Promise.all(withCadastral.map((row) => enrichRowGeocode(row)));
}

async function fetchActiveRows() {
  const service = createServiceClient();

  await expireStaleMapListings(service);

  const { data, error } = await service
    .from("properties")
    .select("*")
    .in("status", publicStatusFilter())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Active listings fetch failed:", error.message);
    return [] as PropertyRow[];
  }

  return (data ?? []).filter((row) =>
    isPubliclyVisibleListing(row as PropertyRow),
  ) as PropertyRow[];
}

export async function fetchActiveMapListings(options?: { enrich?: boolean }) {
  const enrich = options?.enrich ?? true;
  const rows = await fetchActiveRows();

  const enriched = enrich ? await enrichRows(rows) : rows;

  return enriched
    .map((row) => normalizeToMapProperty(row))
    .filter((row): row is NonNullable<typeof row> => row != null);
}

/** Map API — active listings with coordinates/polygons (after enrichment). */
export async function fetchMappableListings() {
  const listings = await fetchActiveMapListings({ enrich: true });
  return listings.filter(isMappableProperty);
}

/** Map API — all active listings for client-side refresh (includes pending coords). */
export async function fetchMapListingsForSync() {
  return fetchActiveMapListings({ enrich: true });
}

export async function fetchActiveListingById(id: string) {
  const service = createServiceClient();

  const { data, error } = await service
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as PropertyRow;
  if (!isPubliclyVisibleListing(row)) return null;

  const [enriched] = await enrichRows([row]);
  return normalizeToMapProperty(enriched);
}
