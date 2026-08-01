import { fetchMappableListings } from "@/lib/active-listings";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const properties = await fetchMappableListings();
    return NextResponse.json(properties, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "რუკის ჩატვირთვა ვერ მოხერხდა";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
