"use client";

import Link from "next/link";
import { KeraLogoMark } from "@/components/brand/KeraLogoMark";
import { useT } from "@/i18n/LocaleProvider";
import { SITE_TAGLINE } from "@/lib/constants";

/** Logo mark heights (+10% on previous mark-only sizes). */
const MARK_HEIGHT = {
  sm: 48,
  md: 56,
  lg: 66,
  header: 61,
} as const;

export function KeraLogo({
  size = "md",
  showText = true,
  compactTagline = false,
  href = "/",
  className = "",
  priority = false,
}: {
  size?: keyof typeof MARK_HEIGHT;
  priority?: boolean;
  showText?: boolean;
  compactTagline?: boolean;
  href?: string;
  className?: string;
}) {
  const t = useT();
  const markHeight = MARK_HEIGHT[size];
  const mark = <KeraLogoMark height={markHeight} priority={priority} />;

  if (!showText) {
    return (
      <Link
        href={href}
        className={`inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kera-primary/40 focus-visible:ring-offset-2 ${className}`}
        aria-label={t.brand.name}
      >
        {mark}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group inline-flex min-w-0 shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kera-primary/40 focus-visible:ring-offset-2 sm:gap-2.5 ${className}`}
    >
      {mark}
      <div className="min-w-0 leading-none">
        <p className="truncate font-display text-sm font-bold tracking-tight text-kera-slate transition group-hover:text-kera-blue sm:text-base xl:text-[17px]">
          {t.brand.name}
        </p>
        <p
          className={`mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-xs ${
            compactTagline ? "hidden xl:block" : ""
          }`}
        >
          {SITE_TAGLINE}
        </p>
      </div>
    </Link>
  );
}
