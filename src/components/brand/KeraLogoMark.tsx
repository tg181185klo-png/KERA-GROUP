import { LOGO_MARK } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Logo mark extracted from brand asset — transparent PNG, reliable everywhere. */
export function KeraLogoMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  const height = Math.round(size * (439 / 752));

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_MARK}
      alt=""
      width={size}
      height={height}
      draggable={false}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
