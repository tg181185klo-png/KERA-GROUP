import { createServiceClient } from "@/lib/supabase/server";
import {
  enrichRowWithCadastral,
} from "@/lib/cadastral-lookup";
import {
  getCadastralCode,
  isActiveListing,
  normalizeToMapProperty,
  type PropertyRow,
} from "@/lib/property-normalize";
import { NextResponse } from "next/server";

export const maxDuration = 60;

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

export async function GET() {
  const service = createServiceClient();

  const { data, error } = await service
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const activeRows = (data ?? []).filter((row) =>
    isActiveListing(row as PropertyRow),
  );

  const enriched = await Promise.all(
    activeRows.map(async (row) => {
      const propertyRow = row as PropertyRow;
      const updated = await enrichRowWithCadastral(propertyRow, getCadastralCode, {
        force: true,
      });

      if (propertyRow.id) {
        await persistCadastralCoords(String(propertyRow.id), updated, propertyRow);
      }

      return updated;
    }),
  );

  const properties = enriched
    .map((row) => normalizeToMapProperty(row as PropertyRow))
    .filter((row): row is NonNullable<typeof row> => row != null);

  return NextResponse.json(properties);
}
