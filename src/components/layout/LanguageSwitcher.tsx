"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/types";
import { cn } from "@/lib/utils";

/** Bolnisi cross — საქართველოს სახელმწიფო დროშის ჯვარი */
function BolnisiCross({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  const s = scale;
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} fill="#e4002b">
      <rect x="-0.55" y="-2.8" width="1.1" height="5.6" />
      <rect x="-2.8" y="-0.55" width="5.6" height="1.1" />
      <rect x="-0.55" y="-3.6" width="1.1" height="0.9" />
      <rect x="-0.9" y="-3.35" width="1.8" height="0.45" />
      <rect x="-0.55" y="2.7" width="1.1" height="0.9" />
      <rect x="-0.9" y="2.9" width="1.8" height="0.45" />
      <rect x="-3.6" y="-0.55" width="0.9" height="1.1" />
      <rect x="-3.35" y="-0.9" width="0.45" height="1.8" />
      <rect x="2.7" y="-0.55" width="0.9" height="1.1" />
      <rect x="2.9" y="-0.9" width="0.45" height="1.8" />
    </g>
  );
}

function FlagGE({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={cn("h-3.5 w-[21px] shrink-0 rounded-[2px] border border-slate-200/80 shadow-sm", className)}
      aria-hidden
    >
      <rect width="30" height="20" fill="#ffffff" />
      <BolnisiCross x={15} y={10} scale={1.35} />
      <BolnisiCross x={7.5} y={5} scale={0.55} />
      <BolnisiCross x={22.5} y={5} scale={0.55} />
      <BolnisiCross x={7.5} y={15} scale={0.55} />
      <BolnisiCross x={22.5} y={15} scale={0.55} />
    </svg>
  );
}

function FlagGB({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={cn("h-3.5 w-[21px] shrink-0 rounded-[2px] border border-slate-200/80 shadow-sm", className)}
      aria-hidden
    >
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0l60 40M60 0L0 40" stroke="#fff" strokeWidth="6" />
      <path d="M0 0l60 40M60 0L0 40" stroke="#c8102e" strokeWidth="3" />
      <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="6" />
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
        "flex shrink-0 items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm",
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
              "flex items-center gap-1 rounded-md font-bold transition",
              compact ? "px-1.5 py-1 text-[10px]" : "px-2 py-1 text-xs",
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
