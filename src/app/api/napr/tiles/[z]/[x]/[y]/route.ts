import {
  getNaprWebCadMapBase,
  NAPR_CADASTRAL_WMS_LAYERS,
  tileToBBox,
} from "@/lib/napr-tiles";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ z: string; x: string; y: string }> };

/** Proxy NAPR/maps.gov.ge cadastral WMS tiles over HTTPS for the property map. */
export async function GET(_request: Request, context: RouteContext) {
  const { z, x, y } = await context.params;
  const zoom = Number(z);
  const tileX = Number(x);
  const tileY = Number(y);

  if (!Number.isFinite(zoom) || !Number.isFinite(tileX) || !Number.isFinite(tileY)) {
    return new NextResponse(null, { status: 400 });
  }

  const [xmin, ymin, xmax, ymax] = tileToBBox(tileX, tileY, zoom);
  const wmsUrl = new URL(getNaprWebCadMapBase());
  wmsUrl.searchParams.set("SERVICE", "WMS");
  wmsUrl.searchParams.set("VERSION", "1.1.1");
  wmsUrl.searchParams.set("REQUEST", "GetMap");
  wmsUrl.searchParams.set("LAYERS", NAPR_CADASTRAL_WMS_LAYERS);
  wmsUrl.searchParams.set("STYLES", "");
  wmsUrl.searchParams.set("FORMAT", "image/png");
  wmsUrl.searchParams.set("TRANSPARENT", "true");
  wmsUrl.searchParams.set("SRS", "EPSG:4326");
  wmsUrl.searchParams.set("BBOX", `${ymin},${xmin},${ymax},${xmax}`);
  wmsUrl.searchParams.set("WIDTH", "256");
  wmsUrl.searchParams.set("HEIGHT", "256");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    const res = await fetch(wmsUrl.toString(), {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Referer: "https://maps.gov.ge/",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return new NextResponse(null, { status: 204 });
    }

    const buffer = await res.arrayBuffer();
    if (!buffer.byteLength) {
      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
