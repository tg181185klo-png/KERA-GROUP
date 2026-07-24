import { createServiceClient } from "@/lib/supabase/server";
import {
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

  const properties = (data ?? [])
    .filter((row) => isActiveListing(row as PropertyRow))
    .map((row) => normalizeToMapProperty(row as PropertyRow))
    .filter((row): row is NonNullable<typeof row> => row != null);

  return NextResponse.json(properties);
}
