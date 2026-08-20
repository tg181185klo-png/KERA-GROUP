import { enrichRowWithCadastral } from "@/lib/cadastral-lookup";
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

async function persistCadastralCoords(
  id: string,
  enriched: Record<string, unknown>,
  original: Record<string, unknown>,
) {
  if (
    enriched.latitude === original.latitude &&
    enriched.longitude === original.longitude &&
    enriched.geojson_polygon === original.geojson_polygon
  ) {
    return;
  }

  const service = createServiceClient();
  const payload: Record<string, unknown> = {};

  if (enriched.latitude != null) payload.latitude = enriched.latitude;
  if (enriched.longitude != null) payload.longitude = enriched.longitude;
  if (enriched.geojson_polygon) payload.geojson_polygon = enriched.geojson_polygon;
  if (enriched.cadastral_code && enriched.cadastral_code !== original.cadastral_code) {
    payload.cadastral_code = enriched.cadastral_code;
  }

  if (Object.keys(payload).length === 0) return;

  await service.from("properties").update(payload).eq("id", id);
}

function rowNeedsCadastralEnrichment(row: PropertyRow): boolean {
  const { lat, lng, geojson, cadastral } = resolveMapCoordinates(row);
  if (cadastral === "—") return false;
  if (geojson?.coordinates?.[0]?.length) return lat == null || lng == null;
  return lat == null || lng == null;
}

function rowNeedsGeocode(row: PropertyRow): boolean {
  const { lat, lng } = resolveMapCoordinates(row);
  if (lat != null && lng != null) return false;
  const address = String(row.address ?? "").trim();
  return address.length > 3;
}

async function enrichRowGeocode(row: PropertyRow): Promise<PropertyRow> {
  if (!rowNeedsGeocode(row)) return row;

  const address = String(row.address ?? "").trim();
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

async function enrichRows(rows: PropertyRow[], forceAll: boolean) {
  const cadastralEnriched = await Promise.all(
    rows.map(async (row) => {
      if (!forceAll && !rowNeedsCadastralEnrichment(row)) {
        return row;
      }

      try {
        const updated = await enrichRowWithCadastral(row, getCadastralCode, {
          force: forceAll,
        });

        if (row.id) {
          await persistCadastralCoords(String(row.id), updated, row);
        }

        return updated;
      } catch {
        return row;
      }
    }),
  );

  return Promise.all(cadastralEnriched.map((row) => enrichRowGeocode(row)));
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

  const enriched = enrich ? await enrichRows(rows, true) : rows;

  return enriched
    .map((row) => normalizeToMapProperty(row))
    .filter((row): row is NonNullable<typeof row> => row != null);
}

/** Map API — only listings with coordinates/polygons. */
export async function fetchMappableListings() {
  const listings = await fetchActiveMapListings({ enrich: true });
  return listings.filter(isMappableProperty);
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

  let enriched = row;
  if (rowNeedsCadastralEnrichment(row)) {
    try {
      enriched = (await enrichRowWithCadastral(row, getCadastralCode, {
        force: false,
      })) as PropertyRow;

      if (row.id) {
        await persistCadastralCoords(String(row.id), enriched, row);
      }
    } catch {
      enriched = row;
    }
  }

  return normalizeToMapProperty(enriched);
}
