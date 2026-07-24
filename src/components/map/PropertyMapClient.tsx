"use client";

import { useEffect, useState } from "react";
import { PropertyMap } from "@/components/map/PropertyMap";
import type { MapProperty } from "@/lib/types/property-listing";

export function PropertyMapClient() {
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings/map")
      .then((res) => res.json())
      .then((data) => {
        setProperties(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 text-slate-500">
        რუკა იტვირთება...
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 text-slate-500">
        აქტიური განცხადებები რუკაზე არ მოიძებნა
      </div>
    );
  }

  return <PropertyMap properties={properties} />;
}
