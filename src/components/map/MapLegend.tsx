"use client";

import { useT } from "@/i18n/LocaleProvider";
import {
  DEAL_MARKER_COLORS,
  LOCATION_ACCENT_COLORS,
  type MapDealType,
  type LocationTier,
} from "@/lib/map-marker-style";

const DEAL_ORDER: MapDealType[] = ["sale", "rent", "daily_rent", "pledge"];
const LOCATION_ORDER: LocationTier[] = ["metropolis", "city", "village"];

export function MapLegend() {
  const t = useT();

  return (
    <aside
      className="pointer-events-none absolute bottom-2 left-2 z-[400] max-w-[min(calc(100%-5rem),168px)] rounded-lg border border-white/60 bg-white/88 p-1.5 text-[9px] leading-tight text-slate-700 shadow-md backdrop-blur-sm sm:bottom-3 sm:left-3 sm:max-w-[210px] sm:rounded-xl sm:border-white/70 sm:bg-white/92 sm:p-2.5 sm:text-[11px] sm:leading-snug sm:shadow-lg"
      aria-label={t.map.legend.title}
    >
      <p className="mb-1 font-display text-[9px] font-bold text-slate-900 sm:mb-1.5 sm:text-[11px]">
        {t.map.legend.title}
      </p>

      <div className="mb-1.5 sm:mb-2.5">
        <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-wide text-slate-500 sm:mb-1 sm:text-[10px]">
          {t.map.legend.dealSection}
        </p>
        <ul className="space-y-0.5 sm:space-y-1">
          {DEAL_ORDER.map((dealType) => (
            <li key={dealType} className="flex items-center gap-1.5 sm:gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white sm:h-3 sm:w-3"
                style={{ backgroundColor: DEAL_MARKER_COLORS[dealType] }}
              />
              <span>{t.map.legend.deals[dealType]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-wide text-slate-500 sm:mb-1 sm:text-[10px]">
          {t.map.legend.locationSection}
        </p>
        <ul className="space-y-0.5 sm:space-y-1">
          {LOCATION_ORDER.map((tier) => (
            <li key={tier} className="flex items-center gap-1.5 sm:gap-2">
              <span
                className="relative h-2.5 w-3.5 shrink-0 rounded-full bg-slate-200 ring-1 ring-white sm:h-3.5 sm:w-5"
                style={{ boxShadow: `inset 0 0 0 2px ${LOCATION_ACCENT_COLORS[tier]}` }}
              />
              <span>{t.map.legend.locations[tier]}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
