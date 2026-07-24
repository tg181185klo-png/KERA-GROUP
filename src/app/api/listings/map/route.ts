import { createServiceClient } from "@/lib/supabase/server";
import {
  isActiveListing,
  normalizeToMapProperty,
  type PropertyRow,
} from "@/lib/property-normalize";
import { NextResponse } from "next/server";

export async function GET() {
  const service = createServiceClient();

  const { data: rpcData, error: rpcError } = await service.rpc(
    "get_active_properties_for_map",
  );

  if (!rpcError && rpcData?.length) {
    const fromRpc = (rpcData as PropertyRow[])
      .map((row) => normalizeToMapProperty(row))
      .filter((row): row is NonNullable<typeof row> => row != null);
    if (fromRpc.length) {
      return NextResponse.json(fromRpc);
    }
  }

  const { data, error } = await service
    .from("properties")
    .select("*")
    .eq("status", "active")
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
