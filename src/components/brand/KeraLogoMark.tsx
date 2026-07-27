import Image from "next/image";
import logoMark from "@/assets/logo-mark.png";
import { cn } from "@/lib/utils";

const ASPECT = 752 / 439;

/** Logo mark — bundled PNG, always loads (no broken public path). */
export function KeraLogoMark({
  className,
  height = 36,
  priority = false,
}: {
  className?: string;
  /** Display height in px; width follows logo aspect ratio. */
  height?: number;
  priority?: boolean;
}) {
  const width = Math.round(height * ASPECT);

  return (
    <Image
      src={logoMark}
      alt=""
      width={width}
      height={height}
      priority={priority}
      draggable={false}
      className={cn("h-auto w-auto shrink-0 object-contain", className)}
      style={{ height, width }}
    />
  );
}
