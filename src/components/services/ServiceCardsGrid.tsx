"use client";

import Link from "next/link";
import {
  Building2,
  Camera,
  Globe,
  Handshake,
  HardHat,
} from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getServiceCards } from "@/i18n/nav";

const ICONS = {
  globe: Globe,
  crane: HardHat,
  building: Building2,
  camera: Camera,
  handshake: Handshake,
} as const;

export function ServiceCardsGrid() {
  const t = useT();
  const cards = getServiceCards(t);

  return (
    <div className="grid grid-cols-5 gap-3 max-lg:overflow-x-auto max-lg:pb-2 lg:gap-4">
      {cards.map((card) => {
        const Icon = ICONS[card.icon];
        return (
          <Link
            key={card.key}
            href={card.href}
            className="kera-card flex min-w-[9.5rem] flex-col p-3 transition hover:border-kera-primary/30 hover:shadow-md sm:min-w-[11rem] sm:p-4 lg:min-w-0"
          >
            <div className="kera-icon-box mb-3 h-9 w-9 [&_svg]:h-4 [&_svg]:w-4">
              <Icon strokeWidth={2.25} />
            </div>
            <h2 className="line-clamp-3 font-display text-xs font-bold leading-snug text-kera-slate sm:text-sm">
              {card.title}
            </h2>
            <p className="mt-2 line-clamp-4 flex-1 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
              {card.cardDesc}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
