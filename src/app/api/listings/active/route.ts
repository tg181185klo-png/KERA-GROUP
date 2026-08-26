import { fetchMapListingsForSync } from "@/lib/active-listings";
import { NextResponse } from "next/server";

export const maxDuration = 120;
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Public active listings for grid + map sync (includes cadastral enrichment). */
export async function GET() {
  try {
    const properties = await fetchMapListingsForSync();
    return NextResponse.json(properties, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "განცხადებების ჩატვირთვა ვერ მოხერხდა";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
