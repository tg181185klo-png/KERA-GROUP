"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Map } from "lucide-react";
import type { PropertySearchParams } from "@/lib/types/property";
import type { MapProperty } from "@/lib/types/property-listing";
import {
  buildSearchQueryString,
  filterProperties,
  hasActiveSearchFilters,
} from "@/lib/property-search";
import { useLocale, useT } from "@/i18n/LocaleProvider";
import { PropertySearchCard } from "./PropertySearchCard";

interface PropertySearchResultsProps {
  initialProperties: MapProperty[];
  searchParams: PropertySearchParams;
}

function PropertyScrollRow({
  title,
  count,
  properties,
  displayCurrency,
  viewAllHref,
  returnQuery,
}: {
  title: string;
  count?: number;
  properties: MapProperty[];
  displayCurrency: "USD" | "GEL";
  viewAllHref?: string;
  returnQuery?: string;
}) {
  const t = useT();

  if (properties.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-kera-primary" />
          <h2 className="truncate text-base font-bold text-kera-slate sm:text-lg">
            {title}
          </h2>
          {count != null && (
            <span className="shrink-0 text-sm text-slate-400">+{count}</span>
          )}
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="kera-link shrink-0 text-sm">
            {t.searchResults.viewAll}
          </Link>
        )}
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
        <div className="flex gap-3 sm:gap-4">
          {properties.map((property) => (
            <PropertySearchCard
              key={property.id}
              property={property}
              displayCurrency={displayCurrency}
              returnQuery={returnQuery}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function PropertySearchResults({
  initialProperties,
  searchParams,
}: PropertySearchResultsProps) {
  const t = useT();
  const { locale } = useLocale();
  const [currency, setCurrency] = useState<"USD" | "GEL">("USD");

  const filtered = useMemo(
    () =>
      filterProperties(initialProperties, searchParams, { t, locale }),
    [initialProperties, searchParams, t, locale],
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      }),
    [filtered],
  );

  const isSearch = hasActiveSearchFilters(searchParams);
  const mapQuery = buildSearchQueryString(searchParams);
  const mapHref = mapQuery ? `/map?${mapQuery}` : "/map";
  const returnQuery = mapQuery || undefined;

  const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentlyAdded = sorted.filter((p) => {
    if (!p.created_at) return false;
    return new Date(p.created_at).getTime() >= recentCutoff;
  });
  const older = sorted.filter((p) => !recentlyAdded.includes(p));

  if (sorted.length === 0) {
    return (
      <div className="kera-card mx-auto max-w-xl p-6 text-center sm:p-10">
        <p className="text-slate-600">{t.searchResults.empty}</p>
        <Link href="/properties" className="kera-btn mt-4 inline-flex px-6 py-2.5">
          {t.searchResults.backToSearch}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {t.searchResults.found(sorted.length)}
          </p>
          {isSearch && searchParams.location && (
            <p className="mt-1 text-sm font-medium text-slate-700">
              {searchParams.location}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
          <Link
            href={mapHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-kera-primary hover:text-kera-primary"
          >
            <Map className="h-4 w-4" />
            {t.searchResults.viewOnMap}
          </Link>
        </div>
      </div>

      {recentlyAdded.length > 0 && (
        <PropertyScrollRow
          title={t.searchResults.recentlyAdded}
          count={recentlyAdded.length}
          properties={recentlyAdded}
          displayCurrency={currency}
          returnQuery={returnQuery}
        />
      )}

      {older.length > 0 && (
        <PropertyScrollRow
          title={
            isSearch ? t.searchResults.allResults : t.searchResults.moreListings
          }
          properties={older}
          displayCurrency={currency}
          returnQuery={returnQuery}
        />
      )}

      {recentlyAdded.length === 0 && (
        <PropertyScrollRow
          title={isSearch ? t.searchResults.allResults : t.properties.title}
          properties={sorted}
          displayCurrency={currency}
          returnQuery={returnQuery}
        />
      )}
    </div>
  );
}
