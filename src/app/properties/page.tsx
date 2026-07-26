import { Suspense } from "react";
import { ListingsMapExplorerClient } from "@/components/map/ListingsMapExplorerClient";

export default function PropertiesPage() {
  return (
    <section className="kera-section bg-kera-page">
      <div className="kera-container">
        <div className="mb-6 max-w-2xl">
          <p className="kera-eyebrow">Active Listings</p>
          <h1 className="kera-section-title mt-2">ქონების კატალოგი</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            მხოლოდ დამტკიცებული განცხადებები. აირჩიეთ ბარათი ან კადასტრის პოლიგონი
            რუკაზე — ორივე სინქრონიზებულია.
          </p>
        </div>

        <div className="min-h-[640px]">
          <Suspense
            fallback={
              <div className="flex h-[420px] items-center justify-center text-slate-500">
                იტვირთება...
              </div>
            }
          >
            <ListingsMapExplorerClient />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
