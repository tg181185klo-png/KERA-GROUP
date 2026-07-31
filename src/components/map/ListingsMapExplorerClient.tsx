"use client";

import { useSearchParams } from "next/navigation";
import { ListingsMapExplorer } from "@/components/map/ListingsMapExplorer";

interface ListingsMapExplorerClientProps {
  fullScreen?: boolean;
}

export function ListingsMapExplorerClient({
  fullScreen = false,
}: ListingsMapExplorerClientProps) {
  const searchParams = useSearchParams();
  const selected = searchParams.get("selected");

  if (fullScreen) {
    return (
      <ListingsMapExplorer
        initialSelectedId={selected}
        layout="map-only"
        fullBleed
        className="h-full min-h-0"
      />
    );
  }

  return <ListingsMapExplorer initialSelectedId={selected} layout="map-only" />;
}
