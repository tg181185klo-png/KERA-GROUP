import { PropertyMapClient } from "@/components/map/PropertyMapClient";
import Link from "next/link";

export function HomeMapSection() {
  return (
    <section id="map" className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-kera-primary">
              Cadastral Map
            </p>
            <h2 className="kera-section-title mt-2">ინტერაქტიული რუკა</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              დამტკიცებული განცხადებები კადასტრის კოდებით. დააჭირეთ პოლიგონს
              დეტალების სანახავად.
            </p>
          </div>
          <Link
            href="/map"
            className="text-sm font-medium text-kera-blue hover:underline"
          >
            სრული ეკრანი →
          </Link>
        </div>

        <div className="h-[420px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm sm:h-[520px]">
          <PropertyMapClient />
        </div>
      </div>
    </section>
  );
}
