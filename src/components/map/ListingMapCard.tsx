"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getListingTypeLabel } from "@/i18n/nav";
import type { MapProperty } from "@/lib/types/property-listing";
import { formatPrice, formatPricePerSqm } from "@/lib/cadastral";
import { getPricePerSqm, resolveAreaSqm } from "@/lib/price-display";
import { cn } from "@/lib/utils";

interface ListingMapCardProps {
  property: MapProperty;
  selected?: boolean;
  onSelect: (property: MapProperty) => void;
}

export function ListingMapCard({
  property,
  selected = false,
  onSelect,
}: ListingMapCardProps) {
  const t = useT();
  const imageUrl =
    property.images[0] ??
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";
  const pricePerSqm = getPricePerSqm(property);
  const areaSqm = resolveAreaSqm(property);

  return (
    <button
      type="button"
      data-listing-id={property.id}
      onClick={() => onSelect(property)}
      className={cn(
        "kera-card w-full overflow-hidden text-left transition ring-2 ring-transparent",
        selected
          ? "border-kera-primary ring-kera-primary/30 shadow-md"
          : "hover:border-slate-300",
      )}
    >
      <div className="relative aspect-[16/10] bg-slate-100">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className="object-cover"
          sizes="320px"
        />
        <span className="absolute left-2 top-2 rounded-lg bg-kera-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          {getListingTypeLabel(t, property.deal_type ?? property.listing_type)}
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <p className="font-display text-base font-bold text-kera-slate">
          {formatPrice(property.total_price)}
        </p>
        {pricePerSqm != null && (
          <p className="text-xs text-slate-500">
            {formatPricePerSqm(pricePerSqm, t.common.perSqm)}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800">
          {property.title}
        </h3>
        <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{property.address}</span>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {property.cadastral_code}
          {areaSqm > 0 && ` · ${areaSqm} ${t.common.sqm}`}
        </p>
        <Link
          href={`/properties/${property.id}`}
          onClick={(e) => e.stopPropagation()}
          className="kera-link mt-2 inline-block text-xs"
        >
          {t.properties.fullPage}
        </Link>
      </div>
    </button>
  );
}
