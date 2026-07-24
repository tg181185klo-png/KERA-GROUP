import { createServiceClient } from "@/lib/supabase/server";
import { canManageListings } from "@/lib/admin-access";
import {
  cadastralCoordsPayload,
  lookupCadastralParcel,
} from "@/lib/cadastral-lookup";
import { getCadastralCode } from "@/lib/property-normalize";
import { NextResponse } from "next/server";

export const maxDuration = 120;

/** Re-sync all listings from NAPR cadastral registry (admin only). */
export async function POST() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!(await canManageListings(user?.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();
  const { data, error } = await service.from("properties").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of data ?? []) {
    const cadastral = getCadastralCode(row);
    if (cadastral === "—") {
      skipped++;
      continue;
    }

    const parcel = await lookupCadastralParcel(cadastral);
    if (!parcel) {
      failed++;
      continue;
    }

    const payload: Record<string, unknown> = {
      ...cadastralCoordsPayload(parcel),
      cadastral_code: parcel.cadastral_code,
    };

    if (parcel.address && !row.address) {
      payload.address = parcel.address;
    }

    const { error: updateError } = await service
      .from("properties")
      .update(payload)
      .eq("id", row.id);

    if (updateError) {
      failed++;
    } else {
      updated++;
    }
  }

  return NextResponse.json({
    success: true,
    updated,
    skipped,
    failed,
    total: (data ?? []).length,
  });
}
