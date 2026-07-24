import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  ADMIN_DEFAULT_PASSWORD,
  ADMIN_SESSION_SECRET_DEFAULT,
} from "@/lib/constants";

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? ADMIN_SESSION_SECRET_DEFAULT;
}

export function isValidAdminPassword(input: string): boolean {
  const password = input.trim();
  if (password === ADMIN_DEFAULT_PASSWORD) return true;

  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  if (envPassword && password === envPassword) return true;

  return false;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE);
  return session?.value === getAdminSessionSecret();
}

/** @deprecated use isValidAdminPassword */
export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? ADMIN_DEFAULT_PASSWORD;
}
