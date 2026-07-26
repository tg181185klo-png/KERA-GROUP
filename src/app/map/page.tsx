import { Suspense } from "react";
import { ListingsMapExplorerClient } from "@/components/map/ListingsMapExplorerClient";

export default function MapPage() {
  return (
    <div className="kera-map-viewport flex flex-col bg-white p-3 sm:p-4">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-slate-500">
            იტვირთება...
          </div>
        }
      >
        <ListingsMapExplorerClient fullScreen />
      </Suspense>
    </div>
  );
}
