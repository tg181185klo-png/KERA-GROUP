export type Locale = "ka" | "en";

export const LOCALES: Locale[] = ["ka", "en"];
export const DEFAULT_LOCALE: Locale = "ka";
export const LOCALE_COOKIE = "kera-locale";

export type Messages = typeof import("./messages/ka").ka;
