import { fetchActiveListingById } from "@/lib/active-listings";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const property = await fetchActiveListingById(id);
  const source = property?.images.find((src) => src.trim().length > 0);

  if (!source) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const imageResponse = await fetch(source, { cache: "no-store" });
    if (!imageResponse.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const input = Buffer.from(await imageResponse.arrayBuffer());
    const jpeg = await sharp(input)
      .rotate()
      .resize(1200, 630, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82 })
      .toBuffer();

    return new NextResponse(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
