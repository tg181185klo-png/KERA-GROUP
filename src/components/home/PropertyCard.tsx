import Image from "next/image";
import Link from "next/link";
import { MapPin, Maximize2 } from "lucide-react";
import type { MapProperty } from "@/lib/types/property-listing";
import { formatPrice as formatCadastralPrice } from "@/lib/cadastral";
import { LISTING_TYPE_LABELS } from "@/lib/types/property-listing";

const USD_TO_GEL = 2.65;

interface PropertyCardProps {
  property: MapProperty;
  displayCurrency?: "USD" | "GEL";
}

function getDisplayPrice(
  property: MapProperty,
  displayCurrency: "USD" | "GEL"
): { price: number; currency: string } {
  if (displayCurrency === "GEL") {
    return {
      price: Math.round(property.total_price * USD_TO_GEL),
      currency: "GEL",
    };
  }
  return { price: property.total_price, currency: "USD" };
}

function formatPrice(price: number, currency: string): string {
  const symbol = currency === "GEL" ? "₾" : "$";
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(price);
  return currency === "GEL" ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

export function PropertyCard({
  property,
  displayCurrency = "USD",
}: PropertyCardProps) {
  const imageUrl =
    property.images?.[0] ??
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

  const { price, currency } = getDisplayPrice(property, displayCurrency);

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
          {LISTING_TYPE_LABELS[property.listing_type]}
        </span>
      </div>

      <div className="p-5">
        <p className="text-xl font-bold text-kera-slate">
          {formatPrice(price, currency)}
        </p>
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
              {property.area_sqm} მ²
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-sm font-medium text-slate-700">
          {property.title}
        </p>
        {property.price_per_sqm != null && (
          <p className="mt-1 text-xs text-slate-400">
            {formatCadastralPrice(property.price_per_sqm)} / მ²
          </p>
        )}
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
  emptyMessage = "ამ ეტაპზე დამტკიცებული განცხადებები არ მოიძებნა.",
}: FeaturedPropertiesProps) {
  if (properties.length === 0) {
    return (
      <div className="kera-card mx-auto max-w-xl p-10 text-center">
        <p className="text-slate-600">{emptyMessage}</p>
        <Link
          href="/dashboard/add-property"
          className="kera-btn mt-4 inline-flex px-6 py-2.5"
        >
          ქონების განთავსება
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
