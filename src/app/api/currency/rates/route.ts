import { NextResponse } from "next/server";
import { fetchNbgRates } from "@/lib/nbg-rates";

export async function GET() {
  const payload = await fetchNbgRates();

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
