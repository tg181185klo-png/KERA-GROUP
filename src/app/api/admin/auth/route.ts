import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/constants";
import { getAdminPassword, getAdminSessionSecret } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = getAdminPassword();

  if (username !== adminUsername || password !== adminPassword) {
    return NextResponse.json(
      { error: "არასწორი მომხმარებელი ან პაროლი" },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, getAdminSessionSecret(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return NextResponse.json({ success: true });
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
