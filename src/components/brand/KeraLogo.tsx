import Link from "next/link";
import { KeraLogoMark } from "@/components/brand/KeraLogoMark";
import { SITE_NAME, SITE_NAME_GE, SITE_TAGLINE } from "@/lib/constants";

const MARK_SIZE = {
  sm: 38,
  md: 46,
  lg: 58,
} as const;

export function KeraLogo({
  size = "md",
  showText = true,
  href = "/",
  className = "",
}: {
  size?: keyof typeof MARK_SIZE;
  /** @deprecated priority is ignored — inline SVG needs no preload */
  priority?: boolean;
  showText?: boolean;
  href?: string;
  className?: string;
}) {
  const markSize = MARK_SIZE[size];

  const mark = <KeraLogoMark size={markSize} />;

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
      className={`group inline-flex items-center gap-2.5 sm:gap-3 ${className}`}
    >
      {mark}
      <div className="leading-none">
        <p className="font-display text-[15px] font-bold tracking-tight text-kera-slate transition group-hover:text-kera-blue sm:text-base">
          {SITE_NAME_GE}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:text-[11px]">
          {SITE_TAGLINE}
        </p>
      </div>
    </Link>
  );
}
