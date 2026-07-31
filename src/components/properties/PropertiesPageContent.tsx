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
    <section className="bg-kera-page pb-10 pt-4 sm:pb-12 sm:pt-6">
      <div className="kera-container">
        <header className="mx-auto mb-4 max-w-2xl text-center sm:mb-5">
          <p className="kera-eyebrow">{t.properties.eyebrow}</p>
          <h1 className="font-display mt-1.5 text-xl font-bold leading-tight tracking-tight text-kera-slate sm:text-2xl lg:text-3xl">
            {t.properties.title}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
            {t.properties.searchHeading}
          </p>
        </header>

        <PropertySearchForm
          initialParams={searchParams}
          className="mx-auto mb-6 max-w-5xl sm:mb-7"
        />

        <PropertySearchResults
          initialProperties={initialProperties}
          searchParams={searchParams}
        />
      </div>
    </section>
  );
}
