"use client";

import { LOCALE_COOKIE, DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/types";
import { getMessages } from "@/i18n/messages";

function readLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
  const value = match?.[1];
  if (value && LOCALES.includes(value as Locale)) {
    return value as Locale;
  }
  return DEFAULT_LOCALE;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = readLocaleFromCookie();
  const t = getMessages(locale);

  return (
    <html lang={locale}>
      <body className="flex min-h-screen items-center justify-center overflow-x-hidden bg-kera-page p-6 font-sans text-kera-slate antialiased">
        <div className="kera-card max-w-md p-8 text-center">
          <h1 className="kera-page-header text-xl">{t.common.globalError}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {error.message || t.common.pleaseRetry}
          </p>
          <button type="button" onClick={() => reset()} className="kera-btn mt-6">
            {t.common.tryAgain}
          </button>
        </div>
      </body>
    </html>
  );
}
