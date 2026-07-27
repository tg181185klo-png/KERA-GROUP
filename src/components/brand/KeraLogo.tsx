import Image from "next/image";
import Link from "next/link";
import { LOGO_IMAGE } from "@/lib/brand";
import { SITE_NAME, SITE_NAME_GE, SITE_TAGLINE } from "@/lib/constants";

const SIZES = {
  sm: { w: 36, h: 40 },
  md: { w: 44, h: 48 },
  lg: { w: 56, h: 62 },
} as const;

export function KeraLogo({
  size = "md",
  priority = false,
  showText = true,
  href = "/",
  className = "",
}: {
  size?: keyof typeof SIZES;
  priority?: boolean;
  /** Show brand name beside the mark. */
  showText?: boolean;
  href?: string;
  className?: string;
}) {
  const { w, h } = SIZES[size];

  const mark = (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: w, height: h }}
    >
      <Image
        src={LOGO_IMAGE}
        alt={SITE_NAME}
        width={w}
        height={h}
        priority={priority}
        className="object-contain drop-shadow-sm"
        style={{ width: w, height: h }}
      />
    </span>
  );

  if (!showText) {
    return (
      <Link href={href} className={`inline-flex ${className}`} aria-label={SITE_NAME}>
        {mark}
      </Link>
    );
  }

  return (
    <Link href={href} className={`inline-flex items-center gap-3 ${className}`}>
      {mark}
      <div className="leading-tight">
        <p className="font-display text-sm font-bold text-kera-slate sm:text-base">
          {SITE_NAME_GE}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-xs">
          {SITE_TAGLINE}
        </p>
      </div>
    </Link>
  );
}
