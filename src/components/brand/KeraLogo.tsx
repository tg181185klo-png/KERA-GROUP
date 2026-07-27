import Link from "next/link";
import { KeraLogoMark } from "@/components/brand/KeraLogoMark";
import { SITE_NAME, SITE_NAME_GE, SITE_TAGLINE } from "@/lib/constants";

const MARK_HEIGHT = {
  sm: 38,
  md: 44,
  lg: 52,
} as const;

export function KeraLogo({
  size = "md",
  showText = true,
  href = "/",
  className = "",
  priority = false,
}: {
  size?: keyof typeof MARK_HEIGHT;
  priority?: boolean;
  showText?: boolean;
  href?: string;
  className?: string;
}) {
  const markHeight = MARK_HEIGHT[size];

  const mark = <KeraLogoMark height={markHeight} priority={priority} />;

  if (!showText) {
    return (
      <Link href={href} className={`inline-flex ${className}`} aria-label={SITE_NAME}>
        {mark}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group inline-flex min-w-0 items-center gap-2.5 sm:gap-3 ${className}`}
    >
      {mark}
      <div className="min-w-0 leading-none">
        <p className="truncate font-display text-[15px] font-bold tracking-tight text-kera-slate transition group-hover:text-kera-blue sm:text-base">
          {SITE_NAME_GE}
        </p>
        <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">
          {SITE_TAGLINE}
        </p>
      </div>
    </Link>
  );
}
