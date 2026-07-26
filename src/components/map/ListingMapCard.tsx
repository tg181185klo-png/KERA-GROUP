"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { MapProperty } from "@/lib/types/property-listing";
import { formatPrice, formatPricePerSqm } from "@/lib/cadastral";
import { LISTING_TYPE_LABELS } from "@/lib/types/property-listing";
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
  const imageUrl =
    property.images[0] ??
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

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
          {LISTING_TYPE_LABELS[property.listing_type]}
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <p className="font-display text-base font-bold text-kera-slate">
          {formatPrice(property.total_price)}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800">
          {property.title}
        </h3>
        <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{property.address}</span>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {property.cadastral_code} · {property.area_sqm} მ²
          {property.price_per_sqm
            ? ` · ${formatPricePerSqm(property.price_per_sqm)}`
            : ""}
        </p>
        <Link
          href={`/properties/${property.id}`}
          onClick={(e) => e.stopPropagation()}
          className="kera-link mt-2 inline-block text-xs"
        >
          სრული გვერდი →
        </Link>
      </div>
    </button>
  );
}
