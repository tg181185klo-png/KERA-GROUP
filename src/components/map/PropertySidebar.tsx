"use client";

import { X, Phone, MapPin, Hash, DollarSign } from "lucide-react";
import type { MapProperty } from "@/lib/types/property-listing";
import {
  formatPrice,
  formatPricePerSqm,
} from "@/lib/cadastral";
import { LISTING_TYPE_LABELS } from "@/lib/types/property-listing";
import { Badge } from "@/components/ui/Badge";

interface PropertySidebarProps {
  property: MapProperty;
  onClose: () => void;
}

export function PropertySidebar({ property, onClose }: PropertySidebarProps) {
  const ownerName = `${property.owner_first_name} ${property.owner_last_name}`;

  return (
    <div className="absolute right-0 top-0 z-[1000] h-full w-full max-w-sm overflow-y-auto border-l border-slate-200 bg-white shadow-2xl sm:w-96">
      <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
        <h2 className="font-bold text-slate-900">{property.title}</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="დახურვა"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

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
          {LISTING_TYPE_LABELS[property.listing_type]}
        </Badge>

        <DetailRow icon={Hash} label="კად. კოდი" value={property.cadastral_code} />
        <DetailRow icon={MapPin} label="მფლობელი" value={ownerName} />
        <DetailRow icon={MapPin} label="მისამართი" value={property.address} />
        <DetailRow icon={Phone} label="ტელეფონი" value={property.phone_number} />

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-kera-blue">
            <DollarSign className="h-5 w-5" />
            <span className="text-2xl font-bold">
              {formatPrice(property.total_price)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {property.area_sqm} მ² ·{" "}
            {property.price_per_sqm
              ? formatPricePerSqm(property.price_per_sqm)
              : "—"}
          </p>
        </div>
      </div>
    </div>
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
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
