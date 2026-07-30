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
      className="pointer-events-none absolute right-2 top-2 z-[400] w-[min(100%-1rem,210px)] rounded-xl border border-white/70 bg-white/92 p-2.5 text-[11px] leading-snug text-slate-700 shadow-lg backdrop-blur-sm sm:right-3 sm:top-3 sm:p-3 sm:text-xs"
      aria-label={t.map.legend.title}
    >
      <p className="mb-1.5 font-display text-[11px] font-bold text-slate-900 sm:text-xs">
        {t.map.legend.title}
      </p>

      <div className="mb-2.5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[11px]">
          {t.map.legend.dealSection}
        </p>
        <ul className="space-y-1">
          {DEAL_ORDER.map((dealType) => (
            <li key={dealType} className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full ring-1 ring-white"
                style={{ backgroundColor: DEAL_MARKER_COLORS[dealType] }}
              />
              <span>{t.map.legend.deals[dealType]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[11px]">
          {t.map.legend.locationSection}
        </p>
        <ul className="space-y-1">
          {LOCATION_ORDER.map((tier) => (
            <li key={tier} className="flex items-center gap-2">
              <span
                className="relative h-3.5 w-5 shrink-0 rounded-full bg-slate-200 ring-1 ring-white"
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
