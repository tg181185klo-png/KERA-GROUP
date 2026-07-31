"use client";

import type { PropertySearchParams } from "@/lib/types/property";
import type { MapProperty } from "@/lib/types/property-listing";
import { useT } from "@/i18n/LocaleProvider";
import { PropertySearchForm } from "./PropertySearchForm";
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

  return (
    <section className="kera-section bg-kera-page">
      <div className="kera-container">
        <div className="mb-6 max-w-2xl">
          <p className="kera-eyebrow">{t.properties.eyebrow}</p>
          <h1 className="kera-section-title mt-2">{t.properties.title}</h1>
        </div>

        <PropertySearchForm
          initialParams={searchParams}
          className="mb-8"
        />

        <p className="mb-6 text-sm font-semibold text-kera-slate sm:text-base">
          {t.properties.searchHeading}
        </p>

        <PropertySearchResults
          initialProperties={initialProperties}
          searchParams={searchParams}
        />
      </div>
    </section>
  );
}
