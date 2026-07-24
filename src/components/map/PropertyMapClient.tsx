"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PropertyMap } from "@/components/map/PropertyMap";
import type { MapProperty } from "@/lib/types/property-listing";

interface PropertyMapClientProps {
  emptyMessage?: string;
  showAdminHint?: boolean;
}

export function PropertyMapClient({
  emptyMessage = "დამტკიცებული განცხადებები რუკაზე ჯერ არ არის. ადმინის დამტკიცების შემდეგ კადასტრის კოდები აქ გამოჩნდება.",
  showAdminHint = true,
}: PropertyMapClientProps) {
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/listings/map")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "რუკის ჩატვირთვა ვერ მოხერხდა");
        }
        setProperties(Array.isArray(data) ? data : []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-slate-50 text-slate-500">
        რუკა იტვირთება...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 bg-red-50 px-6 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center text-slate-500">
        <p className="max-w-md text-sm">{emptyMessage}</p>
        {showAdminHint && (
          <Link
            href="/admin"
            className="text-sm font-medium text-kera-blue hover:underline"
          >
            ადმინ პანელი → განცხადების დამტკიცება
          </Link>
        )}
      </div>
    );
  }

  return <PropertyMap properties={properties} />;
}
