import { createServiceClient } from "@/lib/supabase/server";
import { canManageListings } from "@/lib/admin-access";
import { buildMapPersistPayload } from "@/lib/cadastral-lookup";
import { isPubliclyVisibleListing } from "@/lib/listing-status";
import {
  buildApprovalTimestamps,
  shouldRequireModerationOnEdit,
} from "@/lib/listing-expiry";
import { buildOwnerListingUpdates, resolveDealType } from "@/lib/listing-update";
import { getCadastralCode } from "@/lib/property-normalize";
import { isListingOwnedByUser } from "@/lib/user-listings";
import { getProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const maxDuration = 60;

function parseMissingColumn(message: string): string | null {
  const match = message.match(/Could not find the ['‘’"]([^'‘’"]+)['‘’"] column/i);
  return match?.[1] ?? null;
}

function statusForDatabase(status: string): string {
  if (status === "blocked") return "archived";
  return status;
}

function isSchemaMismatch(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("schema cache") ||
    m.includes("could not find") ||
    m.includes("column") ||
    m.includes("does not exist") ||
    m.includes("violates check constraint")
  );
}

function parseConstraintColumn(message: string): string | null {
  const checkMatch = message.match(/check constraint "([^"]+)"/i);
  if (checkMatch?.[1]?.includes("listing_type")) return "listing_type";
  if (checkMatch?.[1]?.includes("deal_type")) return "deal_type";
  return null;
}

function isRentLike(value: unknown): boolean {
  const raw = String(value ?? "").toLowerCase().trim();
  return raw === "rent" || raw === "daily_rent" || raw === "daily";
}

function saleRentListing(payload: Record<string, unknown>): "sale" | "rent" {
  return isRentLike(payload.deal_type) || isRentLike(payload.listing_type)
    ? "rent"
    : "sale";
}

function canWrite(dropped: Set<string>, column: string): boolean {
  return !dropped.has(column);
}

async function updateAdaptive(
  service: ReturnType<typeof createServiceClient>,
  id: string,
  payload: Record<string, unknown>,
) {
  let current = { ...payload };
  if ("deal_type" in current) delete current.listing_type;
  let lastError: { message: string } | null = null;
  const dropped = new Set<string>();
  let triedSellerListing = false;
  let triedSaleRentListing = false;
  let coercedDealType = false;

  function drop(column: string) {
    dropped.add(column);
    delete current[column];
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    if (Object.keys(current).length === 0) break;

    const { data, error } = await service
      .from("properties")
      .update(current)
      .eq("id", id)
      .select()
      .single();

    if (!error) {
      return { data, error: null };
    }

    lastError = error;
    const extra = error as { details?: string; hint?: string };
    const message = [error.message, extra.details, extra.hint].filter(Boolean).join(" ");
    if (/listing_type/i.test(message) && /schema cache|could not find|does not exist/i.test(message)) {
      drop("listing_type");
      continue;
    }
    const missing = parseMissingColumn(message);
    if (missing) {
      drop(missing);
      if (missing === "deal_type" && !("listing_type" in current)) {
        current.listing_type = saleRentListing(payload);
      }
      continue;
    }

    const constraintColumn = parseConstraintColumn(message);
    if (constraintColumn === "listing_type" && isSchemaMismatch(message)) {
      const value = String(current.listing_type ?? "");
      if (
        (value === "sale" || value === "rent") &&
        canWrite(dropped, "deal_type") &&
        "deal_type" in current &&
        !triedSellerListing
      ) {
        triedSellerListing = true;
        current.listing_type = "seller";
        continue;
      }
      if (
        (value === "seller" || value === "developer") &&
        !triedSaleRentListing &&
        canWrite(dropped, "listing_type")
      ) {
        triedSaleRentListing = true;
        current.listing_type = saleRentListing(current);
        continue;
      }
      drop("listing_type");
      continue;
    }

    if (constraintColumn === "deal_type" && isSchemaMismatch(message)) {
      const deal = String(current.deal_type ?? "");
      if (
        !coercedDealType &&
        (deal === "daily_rent" || deal === "daily" || deal === "pledge")
      ) {
        coercedDealType = true;
        current.deal_type = deal === "pledge" ? "sale" : "rent";
        if (canWrite(dropped, "listing_type")) {
          current.listing_type = saleRentListing(current);
        }
        continue;
      }
      if (canWrite(dropped, "listing_type")) {
        current.listing_type = saleRentListing(current);
      }
      drop("deal_type");
      continue;
    }

    return { data: null, error };
  }

  return { data: null, error: lastError };
}

function revalidateListingSurfaces(id: string) {
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
  revalidatePath("/map");
  revalidatePath("/dashboard");
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const service = createServiceClient();

  const { data, error } = await service
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = await canManageListings(user?.id);

  if (!admin && !isPubliclyVisibleListing(data)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = await canManageListings(user?.id);
  const service = createServiceClient();

  const { data: existing } = await service
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!admin) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfile(user.id);
    if (!isListingOwnedByUser(existing, user, profile)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await request.json();

  let updates: Record<string, unknown>;

  if (admin && (body.status === "active" || body.status === "approved")) {
    updates = {
      ...(await buildMapPersistPayload(
        existing as Record<string, unknown>,
        getCadastralCode,
      )),
      ...buildApprovalTimestamps(),
    };
  } else if (admin && body.status != null && Object.keys(body).length === 1) {
    updates = { status: statusForDatabase(body.status) };
    if (body.status === "active" || body.status === "approved") {
      Object.assign(updates, buildApprovalTimestamps());
    }
  } else if (admin) {
    updates = { ...body };
    if (body.deal_type != null) {
      updates.deal_type = resolveDealType(body);
      delete updates.listing_type;
    }
  } else {
    updates = await buildOwnerListingUpdates(body, existing, {
      resetToPending: shouldRequireModerationOnEdit(existing),
    });
  }

  let { data, error } = await updateAdaptive(service, id, updates);

  if (!error && data && body.deal_type != null) {
    const wanted = resolveDealType(body);
    const saved = resolveDealType({
      deal_type: data.deal_type,
      listing_type: data.listing_type,
    });
    if (saved !== wanted) {
      const corrected = await updateAdaptive(service, id, {
        deal_type: wanted,
      });
      if (!corrected.error && corrected.data) {
        data = corrected.data;
      }
    }
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidateListingSurfaces(id);

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = await canManageListings(user?.id);
  if (!admin && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!admin) {
    const service = createServiceClient();
    const { data: existing } = await service
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const profile = await getProfile(user!.id);
    if (
      !isListingOwnedByUser(existing, user!, profile) ||
      existing.status !== "pending"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const service = createServiceClient();
  const { error } = await service.from("properties").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
