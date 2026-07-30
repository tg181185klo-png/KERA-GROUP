"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PropertySearchParams } from "@/lib/types/property";
import type { MapProperty } from "@/lib/types/property-listing";
import { filterProperties } from "@/lib/property-search";
import { useT } from "@/i18n/LocaleProvider";
import { FeaturedPropertiesGrid } from "./PropertyCard";

interface FeaturedPropertiesProps {
  initialProperties: MapProperty[];
  searchParams: PropertySearchParams;
}

export function FeaturedProperties({
  initialProperties,
  searchParams,
}: FeaturedPropertiesProps) {
  const t = useT();
  const [currency, setCurrency] = useState<"USD" | "GEL">("USD");

  const filtered = useMemo(
    () => filterProperties(initialProperties, searchParams),
    [initialProperties, searchParams],
  );

  return (
    <section id="featured" className="kera-section bg-kera-page">
      <div className="kera-container">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kera-eyebrow">{t.featured.eyebrow}</p>
            <h2 className="kera-section-title mt-2">{t.featured.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.featured.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 bg-white p-1">
              {(["USD", "GEL"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`min-w-[3.5rem] rounded-lg px-4 py-1.5 text-center text-sm font-bold transition-colors ${
                    currency === c
                      ? "bg-kera-primary text-white"
                      : "text-slate-600 hover:text-kera-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <Link href="/properties" className="hidden kera-link text-sm sm:block">
              {t.featured.viewAll}
            </Link>
          </div>
        </div>

        <FeaturedPropertiesGrid
          properties={filtered}
          displayCurrency={currency}
        />
      </div>
    </section>
  );
}
