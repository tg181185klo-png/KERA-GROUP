import { createServiceClient } from "@/lib/supabase/server";
import { canManageListings } from "@/lib/admin-access";
import { buildMapPersistPayload } from "@/lib/cadastral-lookup";
import { isPubliclyVisibleListing } from "@/lib/listing-status";
import { buildOwnerListingUpdates } from "@/lib/listing-update";
import { getCadastralCode } from "@/lib/property-normalize";
import { isListingOwnedByUser } from "@/lib/user-listings";
import { getProfile } from "@/lib/auth";
import { NextResponse } from "next/server";

export const maxDuration = 60;

function parseMissingColumn(message: string): string | null {
  const match = message.match(/Could not find the '([^']+)' column/i);
  return match?.[1] ?? null;
}

function statusForDatabase(status: string): string {
  if (status === "blocked") return "archived";
  return status;
}

async function updateAdaptive(
  service: ReturnType<typeof createServiceClient>,
  id: string,
  payload: Record<string, unknown>,
) {
  let current = { ...payload };
  let lastError: { message: string } | null = null;

  for (let attempt = 0; attempt < 12; attempt++) {
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
    const missing = parseMissingColumn(error.message);
    if (!missing) {
      return { data: null, error };
    }

    delete current[missing];
    if (Object.keys(current).length === 0) {
      break;
    }
  }

  return { data: null, error: lastError };
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

  if (!admin && !isPubliclyVisibleListing(data.status)) {
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
    updates = await buildMapPersistPayload(
      existing as Record<string, unknown>,
      getCadastralCode,
    );
  } else if (admin && body.status != null && Object.keys(body).length === 1) {
    updates = { status: statusForDatabase(body.status) };
  } else if (admin) {
    updates = body;
  } else {
    const wasActive = isPubliclyVisibleListing(existing.status);
    updates = await buildOwnerListingUpdates(body, existing, {
      resetToPending: wasActive,
    });
  }

  const { data, error } = await updateAdaptive(service, id, updates);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

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
