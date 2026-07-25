"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Search } from "lucide-react";
import { PropertyMapClient } from "@/components/map/PropertyMapClient";
import { isValidCadastralCode } from "@/lib/cadastral";
import type { CadastralMapPreview } from "@/lib/types/property-listing";

export function HomeMapSection() {
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
          setLookupError(data.error ?? "კადასტრის ძებნა ვერ მოხერხდა");
          return;
        }

        setPreview({
          cadastral_code: data.cadastral_code,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          geojson_polygon: data.geojson_polygon,
        });
        setLookupError("");
      } catch {
        setPreview(null);
        setLookupError("კადასტრის სერვისი დროებით მიუწვდომელია");
      } finally {
        setLookupLoading(false);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [cadastralCode]);

  return (
    <section id="map" className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-kera-primary">
              Cadastral Map
            </p>
            <h2 className="kera-section-title mt-2">ინტერაქტიული რუკა</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              შეიყვანეთ საკადასტრო კოდი — მონაკვეთი მაშინვე გამოჩნდება რუკაზე.
              დამტკიცებული განცხადებები ასევე ჩანს აქ.
            </p>
          </div>
          <Link
            href="/map"
            className="text-sm font-medium text-kera-blue hover:underline"
          >
            სრული ეკრანი →
          </Link>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <label
            htmlFor="home-cadastral-search"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
          >
            <MapPin className="h-4 w-4 text-kera-primary" />
            საკადასტრო კოდის ძებნა
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="home-cadastral-search"
              type="text"
              value={cadastralCode}
              onChange={(e) => setCadastralCode(e.target.value)}
              placeholder="მაგ: 01.10.15.001.002"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm outline-none transition focus:border-kera-primary focus:ring-2 focus:ring-kera-primary/20"
              autoComplete="off"
              spellCheck={false}
            />
            {lookupLoading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-kera-primary" />
            )}
          </div>
          {lookupError && (
            <p className="mt-2 text-sm text-red-600">{lookupError}</p>
          )}
          {preview && !lookupError && (
            <p className="mt-2 text-sm text-emerald-700">
              ნაპოვნია: {preview.cadastral_code}
              {preview.address ? ` — ${preview.address}` : ""}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            ფორმატი: XX.XX.XX.XXX.XXX · ნარიყვლის პოლიგონი ნარინჯისფერია
          </p>
        </div>

        <div className="h-[420px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm sm:h-[520px]">
          <PropertyMapClient preview={preview} alwaysShowMap showAdminHint />
        </div>
      </div>
    </section>
  );
}
