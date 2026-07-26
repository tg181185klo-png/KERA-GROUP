"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Hash, MapPin, Phone } from "lucide-react";
import { PropertyMap } from "@/components/map/PropertyMap";
import type { MapProperty } from "@/lib/types/property-listing";
import {
  formatPrice,
  formatPricePerSqm,
} from "@/lib/cadastral";
import { LISTING_TYPE_LABELS } from "@/lib/types/property-listing";
import { Badge } from "@/components/ui/Badge";

interface PropertyDetailClientProps {
  property: MapProperty;
}

export function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const ownerName = `${property.owner_first_name} ${property.owner_last_name}`;
  const images =
    property.images.length > 0
      ? property.images
      : [
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
        ];

  return (
    <section className="kera-section bg-kera-page">
      <div className="kera-container">
        <Link
          href="/properties"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-kera-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          ყველა განცხადება
        </Link>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={images[0]}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((src, index) => (
                  <div
                    key={src}
                    className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"
                  >
                    <Image
                      src={src}
                      alt={`${property.title} ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="kera-map-shell mt-6 h-[min(50vh,420px)] min-h-[280px]">
              <PropertyMap
                properties={[property]}
                selectedId={property.id}
                fitOnLoad
                showSidebarOnSelect={false}
              />
            </div>
          </div>

          <div>
            <Badge variant={property.listing_type === "sale" ? "blue" : "amber"}>
              {LISTING_TYPE_LABELS[property.listing_type]}
            </Badge>

            <h1 className="mt-3 font-display text-2xl font-bold text-kera-slate sm:text-3xl">
              {property.title}
            </h1>

            <p className="mt-4 text-3xl font-bold text-kera-primary">
              {formatPrice(property.total_price)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {property.area_sqm} მ²
              {property.price_per_sqm
                ? ` · ${formatPricePerSqm(property.price_per_sqm)}`
                : ""}
            </p>

            <dl className="mt-8 space-y-4">
              <DetailItem icon={Hash} label="საკადასტრო კოდი" value={property.cadastral_code} />
              <DetailItem icon={MapPin} label="მისამართი" value={property.address} />
              <DetailItem icon={MapPin} label="მფლობელი" value={ownerName} />
              <DetailItem icon={Phone} label="ტელეფონი" value={property.phone_number} />
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`tel:${property.phone_number.replace(/\s/g, "")}`}
                className="kera-btn inline-flex px-6 py-3"
              >
                დაუკავშირდით
              </a>
              <Link
                href={`/map?selected=${property.id}`}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                რუკაზე ნახვა
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
      <div>
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className="text-sm font-medium text-slate-800">{value}</dd>
      </div>
    </div>
  );
}
