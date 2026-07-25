"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Property, PropertySearchParams } from "@/lib/types/property";
import { FeaturedPropertiesGrid } from "./PropertyCard";

interface FeaturedPropertiesProps {
  initialProperties: Property[];
  searchParams: PropertySearchParams;
}

function filterProperties(
  properties: Property[],
  params: PropertySearchParams
): Property[] {
  return properties.filter((p) => {
    if (params.deal_type && p.deal_type !== params.deal_type) return false;
    if (params.property_type && p.property_type !== params.property_type)
      return false;
    if (
      params.location &&
      !p.address.toLowerCase().includes(params.location.toLowerCase())
    )
      return false;
    if (params.bedrooms != null && (p.bedrooms ?? 0) < params.bedrooms)
      return false;
    if (params.min_price != null && p.price < params.min_price) return false;
    if (params.max_price != null && p.price > params.max_price) return false;
    return true;
  });
}

export function FeaturedProperties({
  initialProperties,
  searchParams,
}: FeaturedPropertiesProps) {
  const [currency, setCurrency] = useState<"USD" | "GEL">("USD");

  const filtered = useMemo(
    () => filterProperties(initialProperties, searchParams),
    [initialProperties, searchParams]
  );

  return (
    <section id="featured" className="kera-section bg-kera-page">
      <div className="kera-container">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kera-eyebrow">
              Featured
            </p>
            <h2 className="kera-section-title mt-2">გამორჩეული ქონება</h2>
            <p className="mt-2 text-sm text-slate-600">
              აქტიური განცხადებები პრემიუმ ფოტოებით და სრული დეტალებით.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 bg-white p-1">
              {(["USD", "GEL"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-colors ${
                    currency === c
                      ? "bg-kera-primary text-white"
                      : "text-slate-600 hover:text-kera-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <Link
              href="/dashboard/add-property"
              className="hidden kera-link text-sm sm:block"
            >
              ყველა განცხადება →
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
