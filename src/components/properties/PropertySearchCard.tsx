"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/i18n/LocaleProvider";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { MapProperty } from "@/lib/types/property-listing";
import {
  formatListingPrice,
  formatListingPricePerSqm,
  getDisplayPrices,
} from "@/lib/price-display";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

interface PropertySearchCardProps {
  property: MapProperty;
  displayCurrency?: "USD" | "GEL";
  returnQuery?: string;
}

function getLocationLabel(address: string): string {
  const first = address.split(",")[0]?.trim();
  return first || address;
}

export function PropertySearchCard({
  property,
  displayCurrency = "USD",
  returnQuery,
}: PropertySearchCardProps) {
  const t = useT();
  const imageUrl = property.images?.[0] ?? PLACEHOLDER;
  const { price, pricePerSqm, currency } = getDisplayPrices(
    property,
    displayCurrency,
  );
  const timeAgo = formatRelativeTime(property.created_at, t.searchResults.time);

  const metaParts: string[] = [getLocationLabel(property.address)];
  if (property.bedrooms != null && property.bedrooms > 0) {
    metaParts.push(t.searchResults.rooms(property.bedrooms));
  }
  if (property.area_sqm > 0) {
    metaParts.push(`${property.area_sqm} ${t.common.sqm}`);
  }

  const detailHref = returnQuery
    ? `/properties/${property.id}?back=${encodeURIComponent(`/properties?${returnQuery}`)}`
    : `/properties/${property.id}`;

  return (
    <Link
      href={detailHref}
      className="group block w-[11.5rem] shrink-0 sm:w-[13rem]"
    >
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md hover:ring-slate-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="208px"
          />
          {timeAgo && (
            <span className="absolute left-2 top-2 rounded-md bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              {timeAgo}
            </span>
          )}
        </div>

        <div className="space-y-1 px-2.5 py-2.5">
          <p className="text-base font-bold leading-tight text-kera-slate">
            {formatListingPrice(price, currency)}
          </p>
          {pricePerSqm != null && (
            <p className="text-[11px] leading-tight text-slate-500">
              {formatListingPricePerSqm(pricePerSqm, currency, t.common.perSqm)}
            </p>
          )}
          <p className="line-clamp-2 text-xs leading-snug text-slate-600">
            {metaParts.join(" - ")}
          </p>
        </div>
      </div>
    </Link>
  );
}
