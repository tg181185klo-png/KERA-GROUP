"use client";

import { useEffect, useRef, useState } from "react";
import type { MapProperty } from "@/lib/types/property-listing";
import { PropertySidebar } from "@/components/map/PropertySidebar";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  properties: MapProperty[];
}

export function PropertyMap({ properties }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [selected, setSelected] = useState<MapProperty | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current).setView([41.7151, 44.8271], 12);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      properties.forEach((property) => {
        if (property.geojson_polygon) {
          const poly = L.polygon(
            property.geojson_polygon.coordinates[0].map(([lng, lat]) => [
              lat,
              lng,
            ]),
            {
              color: property.listing_type === "sale" ? "#00AEEF" : "#F59E0B",
              fillColor:
                property.listing_type === "sale" ? "#00AEEF" : "#F59E0B",
              fillOpacity: 0.25,
              weight: 2,
            },
          );

          poly.on("click", () => setSelected(property));
          poly.addTo(map);
        } else if (property.latitude && property.longitude) {
          const marker = L.circleMarker(
            [property.latitude, property.longitude],
            {
              radius: 8,
              color: "#00AEEF",
              fillColor: "#00AEEF",
              fillOpacity: 0.8,
            },
          );
          marker.on("click", () => setSelected(property));
          marker.addTo(map);
        }
      });
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [properties]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {selected && (
        <PropertySidebar
          property={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
