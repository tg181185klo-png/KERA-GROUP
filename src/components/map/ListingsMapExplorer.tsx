"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { PropertyMap } from "@/components/map/PropertyMap";
import { ListingMapCard } from "@/components/map/ListingMapCard";
import { isMappableProperty } from "@/lib/property-normalize";
import type { MapProperty } from "@/lib/types/property-listing";

interface ListingsMapExplorerProps {
  initialSelectedId?: string | null;
  layout?: "split" | "map-only";
  className?: string;
}

export function ListingsMapExplorer({
  initialSelectedId = null,
  layout = "split",
  className = "",
}: ListingsMapExplorerProps) {
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadListings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch("/api/listings/active", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "განცხადებების ჩატვირთვა ვერ მოხერხდა");
      }

      setProperties(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "შეცდომა");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
    if (!selectedId) return;
    const el = document.querySelector(`[data-listing-id="${selectedId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId, properties.length]);

  useEffect(() => {
    setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  function handleSelect(property: MapProperty | null) {
    setSelectedId(property?.id ?? null);
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-7 w-7 animate-spin text-kera-primary" />
        <p className="text-sm">დამტკიცებული განცხადებები იტვირთება...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button type="button" onClick={() => loadListings()} className="kera-btn">
          თავიდან ცდა
        </button>
      </div>
    );
  }

  const mapProperties = properties.filter(isMappableProperty);

  const mapPanel = (
    <div className="kera-map-shell min-h-[360px] flex-1 lg:min-h-0">
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
              დამტკიცებული განცხადებები ჯერ არ არის.
            </p>
          </div>
        )}
        {mapPanel}
      </div>
    );
  }

  return (
    <div
      className={`flex h-full min-h-0 flex-col gap-4 lg:flex-row ${className} ${
        layout === "split" && className.includes("h-full")
          ? "lg:min-h-[calc(100dvh-var(--header-height)-2rem)]"
          : "lg:min-h-[640px]"
      }`}
    >
      <aside className="flex w-full shrink-0 flex-col lg:w-[380px] xl:w-[420px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-kera-slate">
              აქტიური განცხადებები
            </h2>
            <p className="text-xs text-slate-500">
              {properties.length} დამტკიცებული · რუკაზე {mapProperties.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadListings(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            aria-label="განახლება"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            განახლება
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 lg:max-h-[calc(100dvh-var(--header-height)-10rem)]">
          {properties.length === 0 ? (
            <div className="kera-card p-6 text-center text-sm text-slate-500">
              დამტკიცებული განცხადებები ჯერ არ არის. ადმინის დამტკიცების შემდეგ აქ
              გამოჩნდება.
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

      <div className="min-h-[420px] flex-1 lg:min-h-0">{mapPanel}</div>
    </div>
  );
}
