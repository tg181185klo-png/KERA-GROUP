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
    <section className="bg-kera-page pb-10 pt-2 sm:pb-12 sm:pt-3">
      <div className="kera-container">
        <h1 className="sr-only">{t.properties.title}</h1>

        <PropertySearchForm
          initialParams={searchParams}
          className="mb-5 w-full sm:mb-6"
        />

        <PropertySearchResults
          initialProperties={initialProperties}
          searchParams={searchParams}
        />
      </div>
    </section>
  );
}
