"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Search } from "lucide-react";
import { PropertyMapClient } from "@/components/map/PropertyMapClient";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatCadastralCode, isValidCadastralCode } from "@/lib/cadastral";
import type { CadastralMapPreview } from "@/lib/types/property-listing";

export function HomeMapSection() {
  const { t, fmt } = useLocale();
  const [cadastralCode, setCadastralCode] = useState("");
  const [preview, setPreview] = useState<CadastralMapPreview | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    const trimmed = cadastralCode.trim();

    if (!trimmed) {
      setPreview(null);
      setLookupError("");
      setLookupLoading(false);
      return;
    }

    if (!isValidCadastralCode(trimmed)) {
      setPreview(null);
      setLookupError("");
      setLookupLoading(false);
      return;
    }

    setLookupLoading(true);
    setLookupError("");

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/cadastral/lookup?code=${encodeURIComponent(trimmed)}`,
        );
        const data = await res.json();

        if (!res.ok) {
          setPreview(null);
          setLookupError(data.error ?? t.map.lookupFailed);
          return;
        }

        setPreview({
          cadastral_code: formatCadastralCode(data.cadastral_code ?? trimmed),
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          geojson_polygon: data.geojson_polygon,
        });
        setLookupError("");
      } catch {
        setPreview(null);
        setLookupError(t.map.serviceUnavailable);
      } finally {
        setLookupLoading(false);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [cadastralCode, t.map.lookupFailed, t.map.serviceUnavailable]);

  return (
    <section id="map" className="kera-section bg-white">
      <div className="kera-container">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="kera-section-title">{t.map.title}</h2>
          <Link href="/map" className="kera-link shrink-0 text-sm">
            {t.map.fullScreen}
          </Link>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <label
            htmlFor="home-cadastral-search"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
          >
            <MapPin className="h-4 w-4 shrink-0 text-kera-primary" />
            {t.map.cadastralSearch}
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-kera-blue focus-within:ring-2 focus-within:ring-kera-blue/20">
            <Search
              className="h-4 w-4 shrink-0 text-slate-400"
              aria-hidden
            />
            <input
              id="home-cadastral-search"
              type="text"
              value={cadastralCode}
              onChange={(e) => setCadastralCode(e.target.value)}
              onBlur={(e) => {
                const formatted = formatCadastralCode(e.target.value);
                if (formatted !== e.target.value) setCadastralCode(formatted);
              }}
              placeholder={t.map.cadastralPlaceholder}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              autoComplete="off"
              spellCheck={false}
            />
            {lookupLoading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-kera-primary" />
            )}
          </div>
          {lookupError && (
            <p className="mt-2 text-sm text-red-600">{lookupError}</p>
          )}
          {preview && !lookupError && (
            <p className="mt-2 text-sm text-emerald-700">
              {fmt(t.map.found, {
                code: formatCadastralCode(preview.cadastral_code),
                address: preview.address ? ` — ${preview.address}` : "",
              })}
            </p>
          )}
        </div>

        <div className="kera-map-shell h-[min(58dvh,520px)] min-h-[300px] sm:min-h-[360px] lg:h-[min(55vh,480px)] lg:min-h-[420px]">
          <PropertyMapClient preview={preview} alwaysShowMap showAdminHint />
        </div>
      </div>
    </section>
  );
}
