"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Maximize2 } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getListingTypeLabel } from "@/i18n/nav";
import type { MapProperty } from "@/lib/types/property-listing";
import {
  formatListingPrice,
  formatListingPricePerSqm,
  getDisplayPrices,
} from "@/lib/price-display";

interface PropertyCardProps {
  property: MapProperty;
  displayCurrency?: "USD" | "GEL";
}

export function PropertyCard({
  property,
  displayCurrency = "USD",
}: PropertyCardProps) {
  const t = useT();
  const imageUrl =
    property.images?.[0] ??
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

  const { price, pricePerSqm, currency } = getDisplayPrices(
    property,
    displayCurrency,
  );

  return (
    <Link
      href={`/properties/${property.id}`}
      className="kera-card group block overflow-hidden transition hover:border-slate-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="absolute left-3 top-3 rounded-lg bg-kera-primary px-2.5 py-1 text-xs font-bold text-white">
          {getListingTypeLabel(t, property.deal_type ?? property.listing_type)}
        </span>
      </div>

      <div className="p-5">
        <p className="text-xl font-bold text-kera-slate">
          {formatListingPrice(price, currency)}
        </p>
        {pricePerSqm != null && (
          <p className="mt-0.5 text-xs text-slate-500">
            {formatListingPricePerSqm(pricePerSqm, currency, t.common.perSqm)}
          </p>
        )}
        <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-kera-primary" />
          {property.address}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-md bg-slate-50 px-2 py-1 font-medium">
            {property.cadastral_code}
          </span>
          {property.area_sqm > 0 && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              {property.area_sqm} {t.common.sqm}
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-sm font-medium text-slate-700">
          {property.title}
        </p>
      </div>
    </Link>
  );
}

interface FeaturedPropertiesProps {
  properties: MapProperty[];
  displayCurrency?: "USD" | "GEL";
  emptyMessage?: string;
}

export function FeaturedPropertiesGrid({
  properties,
  displayCurrency = "USD",
  emptyMessage,
}: FeaturedPropertiesProps) {
  const t = useT();
  const message = emptyMessage ?? t.featured.empty;

  if (properties.length === 0) {
    return (
      <div className="kera-card mx-auto max-w-xl p-10 text-center">
        <p className="text-slate-600">{message}</p>
        <Link
          href="/dashboard/add-property"
          className="kera-btn mt-4 inline-flex px-6 py-2.5"
        >
          {t.featured.listCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          displayCurrency={displayCurrency}
        />
      ))}
    </div>
  );
}
