"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { enrichPropertiesCadastral } from "@/lib/client-cadastral-enrich";
import { PropertyMap } from "@/components/map/PropertyMap";
import type {
  CadastralMapPreview,
  MapProperty,
} from "@/lib/types/property-listing";

interface PropertyMapClientProps {
  emptyMessage?: string;
  showAdminHint?: boolean;
  preview?: CadastralMapPreview | null;
  alwaysShowMap?: boolean;
}

export function PropertyMapClient({
  emptyMessage = "დამტკიცებული განცხადებები რუკაზე ჯერ არ არის. ადმინის დამტკიცების შემდეგ კადასტრის კოდები აქ გამოჩნდება.",
  showAdminHint = true,
  preview = null,
  alwaysShowMap = false,
}: PropertyMapClientProps) {
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMapListings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const res = await fetch("/api/listings/map", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "რუკის ჩატვირთვა ვერ მოხერხდა");
      }
      const raw = Array.isArray(data) ? data : [];
      const enriched = await enrichPropertiesCadastral(raw);
      setProperties(enriched);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "შეცდომა");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapListings();
  }, [loadMapListings]);

  useEffect(() => {
    const interval = window.setInterval(() => loadMapListings(true), 30_000);
    const onFocus = () => loadMapListings(true);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadMapListings]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-kera-primary" />
        <p className="text-sm">რუკა იტვირთება...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 bg-red-50 px-6 text-center text-red-600">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const hasContent = properties.length > 0 || preview != null;

  if (!hasContent && !alwaysShowMap) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center text-slate-500">
        <p className="max-w-md text-sm leading-relaxed">{emptyMessage}</p>
        {showAdminHint && (
          <Link href="/admin" className="kera-link text-sm">
            ადმინ პანელი → განცხადების დამტკიცება
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[320px]">
      <PropertyMap properties={properties} preview={preview} />
      {!properties.length && !preview && alwaysShowMap && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-4">
          <p className="max-w-md rounded-xl border border-slate-200/80 bg-white/95 px-4 py-2.5 text-center text-xs leading-relaxed text-slate-600 shadow-sm backdrop-blur sm:text-sm">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
}
