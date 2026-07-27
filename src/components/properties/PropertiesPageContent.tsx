"use client";

import { Suspense } from "react";
import { ListingsMapExplorerClient } from "@/components/map/ListingsMapExplorerClient";
import { useT } from "@/i18n/LocaleProvider";

function PropertiesHeader() {
  const t = useT();

  return (
    <div className="mb-6 max-w-2xl">
      <p className="kera-eyebrow">{t.properties.eyebrow}</p>
      <h1 className="kera-section-title mt-2">{t.properties.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
        {t.properties.subtitle}
      </p>
    </div>
  );
}

export function PropertiesPageContent() {
  const t = useT();

  return (
    <section className="kera-section bg-kera-page">
      <div className="kera-container">
        <PropertiesHeader />

        <div className="min-h-[640px]">
          <Suspense
            fallback={
              <div className="flex h-[420px] items-center justify-center text-slate-500">
                {t.common.loading}
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
