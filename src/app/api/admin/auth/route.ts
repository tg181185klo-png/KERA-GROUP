import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "kera_admin_session";

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "kera2024";

  if (username !== adminUsername || password !== adminPassword) {
    return NextResponse.json(
      { error: "არასწორი მომხმარებელი ან პაროლი" },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "authenticated", {
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
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return NextResponse.json({
    authenticated: session?.value === "authenticated",
  });
}
