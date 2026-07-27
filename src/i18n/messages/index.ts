import type { Locale } from "../types";
import { en } from "./en";
import { ka } from "./ka";

export const messages = { ka, en } as const;

export type Messages = typeof ka;

export function getMessages(locale: Locale): Messages {
  return messages[locale] as Messages;
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}
