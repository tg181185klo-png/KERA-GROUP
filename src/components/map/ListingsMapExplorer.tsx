"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { PropertyMap } from "@/components/map/PropertyMap";
import { ListingMapCard } from "@/components/map/ListingMapCard";
import { useLocale } from "@/i18n/LocaleProvider";
import { enrichListingsCadastralClient } from "@/lib/client-cadastral-enrich";
import { isMappableProperty } from "@/lib/property-normalize";
import type { MapProperty } from "@/lib/types/property-listing";

interface ListingsMapExplorerProps {
  initialSelectedId?: string | null;
  layout?: "split" | "map-only";
  fullBleed?: boolean;
  className?: string;
}

export function ListingsMapExplorer({
  initialSelectedId = null,
  layout = "map-only",
  fullBleed = false,
  className = "",
}: ListingsMapExplorerProps) {
  const { t, fmt } = useLocale();
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadListings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const endpoint = "/api/listings/active";
      const res = await fetch(endpoint, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? t.map.loadFailed);
      }

      const raw = Array.isArray(data) ? data : [];
      const enriched = await enrichListingsCadastralClient(raw);
      setProperties(enriched.filter(isMappableProperty));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [layout, t.common.error, t.map.loadFailed]);

  function handleSelect(property: MapProperty | null) {
    if (!property) {
      setSelectedId(null);
      return;
    }
    setSelectedId(property.id);
  }

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    const interval = window.setInterval(() => loadListings(true), 30_000);
    const onFocus = () => loadListings(true);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadListings]);

  useEffect(() => {
    if (layout !== "split" || !selectedId) return;
    const el = document.querySelector(`[data-listing-id="${selectedId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [layout, selectedId, properties.length]);

  useEffect(() => {
    setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  useEffect(() => {
    if (!initialSelectedId || properties.length === 0) return;
    const property = properties.find((item) => item.id === initialSelectedId);
    if (property && !isMappableProperty(property)) {
      void handleSelect(property);
    } else if (property) {
      setSelectedId(property.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedId, properties.length]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-7 w-7 animate-spin text-kera-primary" />
        <p className="text-sm">{t.map.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button type="button" onClick={() => loadListings()} className="kera-btn">
          {t.map.retry}
        </button>
      </div>
    );
  }

  const mapProperties = properties.filter(isMappableProperty);
  const mapShellClass = fullBleed
    ? "relative isolate h-full min-h-0 w-full overflow-hidden bg-slate-100"
    : "kera-map-shell h-full min-h-[min(52dvh,520px)] flex-1 lg:min-h-0";

  const mapPanel = (
    <div className={mapShellClass}>
      <PropertyMap
        properties={mapProperties}
        selectedId={selectedId}
        onSelect={handleSelect}
        fitOnLoad={!selectedId}
        showSidebarOnSelect
      />
    </div>
  );

  if (layout === "map-only") {
    return (
      <div className={`relative h-full ${className}`}>
        {properties.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-4">
            <p className="rounded-xl border border-slate-200 bg-white/95 px-4 py-2 text-sm text-slate-600 shadow-sm">
              {t.map.noListings}
            </p>
          </div>
        )}
        {mapPanel}
      </div>
    );
  }

  return (
    <div
      className={`flex h-full min-h-0 flex-col gap-3 lg:flex-row lg:gap-4 ${className} ${
        layout === "split" && className.includes("h-full")
          ? "lg:min-h-[calc(100dvh-var(--header-height)-2rem)]"
          : "lg:min-h-[640px]"
      }`}
    >
      <div className="order-1 min-h-[min(52dvh,520px)] flex-1 lg:order-2 lg:min-h-0">
        {mapPanel}
      </div>

      <aside className="order-2 flex max-h-[min(40dvh,400px)] w-full shrink-0 flex-col lg:order-1 lg:max-h-none lg:w-[380px] xl:w-[420px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-kera-slate">
              {t.map.activeListings}
            </h2>
            <p className="text-xs text-slate-500">
              {fmt(t.map.approvedCount, {
                total: properties.length,
                onMap: mapProperties.length,
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadListings(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            aria-label={t.map.refresh}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {t.map.refresh}
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 lg:max-h-[calc(100dvh-var(--header-height)-10rem)]">
          {properties.length === 0 ? (
            <div className="kera-card p-6 text-center text-sm text-slate-500">
              {t.map.noListingsHint}
            </div>
          ) : (
            properties.map((property) => (
              <ListingMapCard
                key={property.id}
                property={property}
                selected={property.id === selectedId}
                onSelect={(item) => handleSelect(item)}
              />
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
