import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** Persist NAPR coordinates fetched on the client so future loads are instant. */
export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();

  const payload: Record<string, unknown> = {};
  if (body.latitude != null) payload.latitude = body.latitude;
  if (body.longitude != null) payload.longitude = body.longitude;
  if (body.geojson_polygon) payload.geojson_polygon = body.geojson_polygon;
  if (body.cadastral_code) payload.cadastral_code = body.cadastral_code;

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Nothing to save" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service.from("properties").update(payload).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
