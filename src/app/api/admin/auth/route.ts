import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/constants";
import {
  getAdminSessionSecret,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password ?? "").trim();

    if (!isValidAdminPassword(password)) {
      return NextResponse.json(
        { error: "არასწორი პაროლი" },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, getAdminSessionSecret(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "შეცდომა" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE);
  return NextResponse.json({
    authenticated: session?.value === getAdminSessionSecret(),
  });
}
