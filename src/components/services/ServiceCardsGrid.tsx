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

const CARD_CLASS =
  "kera-card kera-hover-lift group flex flex-col p-3 sm:p-4 max-lg:w-[min(82vw,18rem)] max-lg:shrink-0 max-lg:snap-center lg:min-w-0";

export function ServiceCardsGrid() {
  const t = useT();
  const cards = getServiceCards(t);

  return (
    <div className="lg:grid lg:grid-cols-5 lg:gap-4">
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-smooth max-lg:[&::-webkit-scrollbar]:hidden lg:contents">
        {cards.map((card) => {
          const Icon = ICONS[card.icon];
          return (
            <Link key={card.key} href={card.href} className={CARD_CLASS}>
              <div className="kera-icon-box mb-3 h-9 w-9 transition-colors duration-300 group-hover:bg-kera-primary group-hover:text-white [&_svg]:h-4 [&_svg]:w-4">
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
    </div>
  );
}
