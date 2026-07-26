import { fetchActiveMapListings } from "@/lib/active-listings";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Public active/approved listings for grid + map sync. */
export async function GET() {
  try {
    const properties = await fetchActiveMapListings();
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
