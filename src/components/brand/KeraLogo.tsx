import Image from "next/image";
import Link from "next/link";
import { LOGO_IMAGE } from "@/lib/brand";
import { SITE_NAME, SITE_NAME_GE, SITE_TAGLINE } from "@/lib/constants";

export function KeraLogo({
  size = "md",
  priority = false,
}: {
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}) {
  const dims = { sm: 36, md: 44, lg: 56 }[size];

  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <Image
        src={LOGO_IMAGE}
        alt={SITE_NAME}
        width={dims}
        height={dims}
        priority={priority}
        className="object-contain"
        style={{ width: dims, height: dims }}
      />
      <div className="leading-tight">
        <p className="font-display text-sm font-bold text-kera-slate sm:text-base">
          {SITE_NAME_GE}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-xs">
          {SITE_TAGLINE}
        </p>
      </div>
    </Link>
  );
}
