"use client";

import type { PropertySearchParams } from "@/lib/types/property";
import type { MapProperty } from "@/lib/types/property-listing";
import { hasActiveSearchFilters } from "@/lib/property-search";
import { useT } from "@/i18n/LocaleProvider";
import { PropertySearchResults } from "./PropertySearchResults";

interface PropertiesPageContentProps {
  initialProperties: MapProperty[];
  searchParams: PropertySearchParams;
}

export function PropertiesPageContent({
  initialProperties,
  searchParams,
}: PropertiesPageContentProps) {
  const t = useT();
  const isSearch = hasActiveSearchFilters(searchParams);

  return (
    <section className="kera-section bg-kera-page">
      <div className="kera-container">
        <div className="mb-8 max-w-2xl">
          <p className="kera-eyebrow">{t.properties.eyebrow}</p>
          <h1 className="kera-section-title mt-2">
            {isSearch ? t.searchResults.title : t.properties.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            {isSearch ? t.searchResults.subtitle : t.properties.subtitle}
          </p>
        </div>

        <PropertySearchResults
          initialProperties={initialProperties}
          searchParams={searchParams}
        />
      </div>
    </section>
  );
}
