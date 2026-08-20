import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import {
  updateUserProfile,
  validateProfileForm,
} from "@/lib/profile-update";
import type { ProfileFormData } from "@/lib/types/profile";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<ProfileFormData>;
  const input: ProfileFormData = {
    first_name: String(body.first_name ?? ""),
    last_name: String(body.last_name ?? ""),
    phone: String(body.phone ?? ""),
  };

  const validationError = validateProfileForm(input);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const service = createServiceClient();
  const current = await getProfile(user.id);

  if (!current) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (current.is_blocked) {
    return NextResponse.json({ error: "Account is blocked" }, { status: 403 });
  }

  try {
    const updated = await updateUserProfile(service, user.id, current, input);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
