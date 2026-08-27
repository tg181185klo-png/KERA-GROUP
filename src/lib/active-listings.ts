import {
  fetchCadastralForStorage,
  rowHasStoredCadastralGeometry,
} from "@/lib/cadastral-persist";
import { cadastralCoordsPayload } from "@/lib/cadastral-lookup";
import { geocodeListingRow } from "@/lib/geocode-listing";
import {
  publicStatusFilter,
  isPubliclyVisibleListing,
} from "@/lib/listing-status";
import { expireStaleMapListings } from "@/lib/listing-expiry";
import {
  getCadastralCode,
  normalizeToMapProperty,
  resolveMapCoordinates,
  type PropertyRow,
} from "@/lib/property-normalize";
import { createServiceClient } from "@/lib/supabase/server";

function rowMissingMapCoords(row: PropertyRow): boolean {
  const { lat, lng } = resolveMapCoordinates(row);
  return lat == null || lng == null;
}

async function persistGeocodeCoords(
  id: string,
  coords: { lat: number; lng: number },
  original: PropertyRow,
) {
  const hadLat =
    original.latitude != null &&
    original.latitude !== "" &&
    !Number.isNaN(Number(original.latitude));
  const hadLng =
    original.longitude != null &&
    original.longitude !== "" &&
    !Number.isNaN(Number(original.longitude));
  if (hadLat && hadLng) return;

  const service = createServiceClient();
  await service
    .from("properties")
    .update({
      latitude: coords.lat,
      longitude: coords.lng,
    })
    .eq("id", id);
}

/** Legacy backfill only — no NAPR calls; map reads stored DB geometry. */
async function enrichRowGeocode(row: PropertyRow): Promise<PropertyRow> {
  if (!rowMissingMapCoords(row)) return row;

  const coords = await geocodeListingRow(row);
  if (!coords) return row;

  const updated = {
    ...row,
    latitude: coords.lat,
    longitude: coords.lng,
  };

  if (row.id) {
    await persistGeocodeCoords(String(row.id), coords, row);
  }

  return updated;
}

async function enrichRows(rows: PropertyRow[]) {
  const withGeocode: PropertyRow[] = [];
  for (const row of rows) {
    if (!rowMissingMapCoords(row)) {
      withGeocode.push(row);
      continue;
    }
    withGeocode.push(await enrichRowGeocode(row));
  }
  return withGeocode;
}

async function persistCadastralGeometry(
  id: string,
  parcel: NonNullable<Awaited<ReturnType<typeof fetchCadastralForStorage>>>,
) {
  const service = createServiceClient();
  await service
    .from("properties")
    .update({
      ...cadastralCoordsPayload(parcel),
      cadastral_code: parcel.cadastral_code,
    })
    .eq("id", id);
}

/** One-time backfill: fetch parcel from maps.gov.ge when DB has cadastral code only. */
async function enrichMissingCadastralGeometry(row: PropertyRow): Promise<PropertyRow> {
  if (rowHasStoredCadastralGeometry(row)) return row;

  const cadastral = getCadastralCode(row);
  if (cadastral !== "—") {
    const parcel = await fetchCadastralForStorage(cadastral);
    if (parcel) {
      const updated = {
        ...row,
        cadastral_code: parcel.cadastral_code,
        latitude: parcel.latitude,
        longitude: parcel.longitude,
        geojson_polygon: parcel.geojson_polygon,
      };
      if (row.id) {
        await persistCadastralGeometry(String(row.id), parcel);
      }
      return updated;
    }
  }

  return enrichRowGeocode(row);
}

async function enrichRowsForMap(rows: PropertyRow[]) {
  const enriched: PropertyRow[] = [];
  for (const row of rows) {
    enriched.push(await enrichMissingCadastralGeometry(row));
  }
  return enriched;
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

export async function fetchActiveMapListings(options?: {
  enrich?: boolean;
  /** Geocode missing points only — never fetches NAPR polygons. */
  geocodeMissing?: boolean;
}) {
  const geocodeMissing = options?.geocodeMissing ?? false;
  const rows = await fetchActiveRows();

  const enriched =
    geocodeMissing && (options?.enrich ?? true)
      ? await enrichRows(rows)
      : rows;

  return enriched
    .map((row) => normalizeToMapProperty(row))
    .filter((row): row is NonNullable<typeof row> => row != null);
}

/** Map API — listings with coordinates/polygons already stored in DB. */
export async function fetchMappableListings() {
  const { isMappableProperty } = await import("@/lib/property-normalize");
  const listings = await fetchActiveMapListings({ enrich: false });
  return listings.filter(isMappableProperty);
}

/** Public map sync — backfills missing cadastral geometry once, then serves from DB. */
export async function fetchMapListingsForSync() {
  const rows = await fetchActiveRows();
  const enriched = await enrichRowsForMap(rows);
  return enriched
    .map((row) => normalizeToMapProperty(row))
    .filter((row): row is NonNullable<typeof row> => row != null);
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

  return normalizeToMapProperty(row);
}
