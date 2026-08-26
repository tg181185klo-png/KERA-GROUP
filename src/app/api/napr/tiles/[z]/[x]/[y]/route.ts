import { getNaprWebCadMapBase, tileToBBox } from "@/lib/napr-tiles";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ z: string; x: string; y: string }> };

/** Proxy NAPR WebCadMap tiles over HTTPS (browser cannot load HTTP reestri.gov.ge directly). */
export async function GET(_request: Request, context: RouteContext) {
  const { z, x, y } = await context.params;
  const zoom = Number(z);
  const tileX = Number(x);
  const tileY = Number(y);

  if (!Number.isFinite(zoom) || !Number.isFinite(tileX) || !Number.isFinite(tileY)) {
    return new NextResponse(null, { status: 400 });
  }

  const [xmin, ymin, xmax, ymax] = tileToBBox(tileX, tileY, zoom);
  const base = getNaprWebCadMapBase();
  const exportUrl = new URL(`${base}/export`);
  exportUrl.searchParams.set("bbox", `${xmin},${ymin},${xmax},${ymax}`);
  exportUrl.searchParams.set("bboxSR", "4326");
  exportUrl.searchParams.set("imageSR", "3857");
  exportUrl.searchParams.set("size", "256,256");
  exportUrl.searchParams.set("format", "png");
  exportUrl.searchParams.set("transparent", "true");
  exportUrl.searchParams.set("f", "image");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(exportUrl.toString(), {
      signal: controller.signal,
      cache: "no-store",
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
