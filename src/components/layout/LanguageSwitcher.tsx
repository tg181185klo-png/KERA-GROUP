"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/types";
import { cn } from "@/lib/utils";

function FlagGE({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={cn("h-4 w-6 shrink-0 rounded-sm shadow-sm", className)}
      aria-hidden
    >
      <rect width="24" height="16" fill="#fff" />
      <rect y="10.67" width="24" height="5.33" fill="#e8112d" />
      <g fill="#e8112d">
        <rect x="5" y="2" width="1.2" height="12" />
        <rect x="2.4" y="5.5" width="6.4" height="1.2" />
        <rect x="3.2" y="4.2" width="4.8" height="1.2" transform="rotate(-45 5.6 4.8)" />
        <rect x="3.2" y="8.6" width="4.8" height="1.2" transform="rotate(45 5.6 9.2)" />
      </g>
    </svg>
  );
}

function FlagGB({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={cn("h-4 w-6 shrink-0 rounded-sm shadow-sm", className)}
      aria-hidden
    >
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="2.5" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#c8102e" strokeWidth="1.2" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="4" />
      <path d="M12 0v16M0 8h24" stroke="#c8102e" strokeWidth="2" />
    </svg>
  );
}

const OPTIONS: { locale: Locale; Flag: typeof FlagGE; labelKey: "ka" | "en" }[] = [
  { locale: "ka", Flag: FlagGE, labelKey: "ka" },
  { locale: "en", Flag: FlagGB, labelKey: "en" },
];

export function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm",
        className,
      )}
      role="group"
      aria-label={t.lang.switchTo}
    >
      {OPTIONS.map(({ locale: loc, Flag, labelKey }) => {
        const active = locale === loc;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc)}
            className={cn(
              "flex items-center gap-1 rounded-lg font-bold transition",
              compact ? "px-1.5 py-1 text-[10px]" : "px-2 py-1.5 text-xs",
              active
                ? "bg-kera-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-kera-slate",
            )}
            aria-pressed={active}
            aria-label={t.lang[labelKey]}
            title={t.lang[labelKey]}
          >
            <Flag />
            <span>{t.lang[labelKey]}</span>
          </button>
        );
      })}
    </div>
  );
}
