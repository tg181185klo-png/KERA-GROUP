import { cookies } from "next/headers";
import { getMessages } from "./messages";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
  LOCALES,
} from "./types";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value && LOCALES.includes(value as Locale)) {
    return value as Locale;
  }
  return DEFAULT_LOCALE;
}

export async function getServerMessages() {
  const locale = await getLocale();
  return { locale, messages: getMessages(locale) };
}
