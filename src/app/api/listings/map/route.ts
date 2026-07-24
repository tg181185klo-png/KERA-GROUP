import { createServiceClient } from "@/lib/supabase/server";
import { enrichRowWithCadastral } from "@/lib/cadastral-lookup";
import {
  getCadastralCode,
  isActiveListing,
  normalizeToMapProperty,
  type PropertyRow,
} from "@/lib/property-normalize";
import { NextResponse } from "next/server";

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
    activeRows.map((row) =>
      enrichRowWithCadastral(row as PropertyRow, getCadastralCode),
    ),
  );

  const properties = enriched
    .map((row) => normalizeToMapProperty(row as PropertyRow))
    .filter((row): row is NonNullable<typeof row> => row != null);

  return NextResponse.json(properties);
}
