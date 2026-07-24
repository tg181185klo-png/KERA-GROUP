import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/constants";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE);
  const secret = process.env.ADMIN_SESSION_SECRET ?? "kera-session-secret";
  return session?.value === secret;
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "kera-admin";
}

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "kera-session-secret";
}
