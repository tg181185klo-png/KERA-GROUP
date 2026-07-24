import { isValidCadastralCode } from "@/lib/cadastral";
import { lookupCadastralParcel } from "@/lib/cadastral-lookup";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim() ?? "";

  if (!code) {
    return NextResponse.json({ error: "კადასტრის კოდი აუცილებელია" }, { status: 400 });
  }

  if (!isValidCadastralCode(code)) {
    return NextResponse.json(
      { error: "ფორმატი: XX.XX.XX.XXX.XXX (მაგ. 01.10.15.001.002)" },
      { status: 400 },
    );
  }

  const parcel = await lookupCadastralParcel(code);

  if (!parcel) {
    return NextResponse.json(
      {
        error:
          "საკადასტრო მონაცემები ვერ მოიძებნა. შეამოწმეთ კოდი https://maps.gov.ge-ზე.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    cadastral_code: parcel.cadastral_code,
    address: parcel.address,
    latitude: parcel.latitude,
    longitude: parcel.longitude,
    geojson_polygon: parcel.geojson_polygon,
  });
}
