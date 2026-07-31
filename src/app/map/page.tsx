"use client";

import { Suspense } from "react";
import { ListingsMapExplorerClient } from "@/components/map/ListingsMapExplorerClient";
import { useT } from "@/i18n/LocaleProvider";

function MapPageInner() {
  const t = useT();

  return (
    <div className="kera-map-viewport flex flex-col bg-white">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-slate-500">
            {t.common.loading}
          </div>
        }
      >
        <ListingsMapExplorerClient fullScreen />
      </Suspense>
    </div>
  );
}

export default function MapPage() {
  return <MapPageInner />;
}
