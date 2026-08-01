"use client";

import Link from "next/link";
import { X, Phone, MapPin, Hash, DollarSign } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getListingTypeLabel } from "@/i18n/nav";
import type { MapProperty } from "@/lib/types/property-listing";
import { formatPrice, formatPricePerSqm } from "@/lib/cadastral";
import { getPricePerSqm, resolveAreaSqm } from "@/lib/price-display";
import { Badge } from "@/components/ui/Badge";

interface PropertySidebarProps {
  property: MapProperty;
  onClose: () => void;
}

export function PropertySidebar({ property, onClose }: PropertySidebarProps) {
  const t = useT();
  const ownerName = `${property.owner_first_name} ${property.owner_last_name}`;
  const pricePerSqm = getPricePerSqm(property);
  const areaSqm = resolveAreaSqm(property);

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-20 bg-slate-900/25 backdrop-blur-[1px] sm:hidden"
        aria-label={t.common.close}
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 z-30 flex h-full w-full max-w-sm flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl sm:w-96">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 className="line-clamp-2 pr-2 font-display text-base font-bold text-slate-900">
            {property.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={t.common.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {property.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-48 w-full object-cover"
            />
          )}

          <div className="space-y-4 p-5">
            <Badge variant={property.listing_type === "sale" ? "blue" : "amber"}>
              {getListingTypeLabel(t, property.deal_type ?? property.listing_type)}
            </Badge>

            <DetailRow icon={Hash} label={t.map.cadCode} value={property.cadastral_code} />
            <DetailRow icon={MapPin} label={t.map.owner} value={ownerName} />
            <DetailRow icon={MapPin} label={t.map.address} value={property.address} />
            <DetailRow icon={Phone} label={t.map.phone} value={property.phone_number} />

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-kera-blue">
                <DollarSign className="h-5 w-5 shrink-0" />
                <div>
                  <span className="text-2xl font-bold">
                    {formatPrice(property.total_price)}
                  </span>
                  {pricePerSqm != null && (
                    <p className="text-xs text-slate-500">
                      {formatPricePerSqm(pricePerSqm, t.common.perSqm)}
                    </p>
                  )}
                </div>
              </div>
              {areaSqm > 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  {areaSqm} {t.common.sqm}
                </p>
              )}
            </div>

            <Link
              href={`/properties/${property.id}`}
              className="kera-btn mt-2 inline-flex w-full justify-center py-2.5 text-sm"
            >
              {t.properties.fullPage}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({
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
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="break-words text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
