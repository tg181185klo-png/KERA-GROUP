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
  const layersRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [selected, setSelected] = useState<MapProperty | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: true }).setView(
        [41.7151, 44.8271],
        12,
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      layersRef.current = L.layerGroup().addTo(map);
      setReady(true);

      setTimeout(() => map.invalidateSize(), 100);
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !layersRef.current) return;

    let cancelled = false;

    async function drawMarkers() {
      const L = (await import("leaflet")).default;
      if (cancelled || !layersRef.current || !mapRef.current) return;

      layersRef.current.clearLayers();
      const bounds: [number, number][] = [];

      properties.forEach((property) => {
        if (property.geojson_polygon?.coordinates?.[0]?.length) {
          const poly = L.polygon(
            property.geojson_polygon.coordinates[0].map(([lng, lat]) => [
              lat,
              lng,
            ]),
            {
              color: property.listing_type === "sale" ? "#00AEEF" : "#F59E0B",
              fillColor:
                property.listing_type === "sale" ? "#00AEEF" : "#F59E0B",
              fillOpacity: 0.3,
              weight: 2,
            },
          );
          poly.bindTooltip(property.cadastral_code, {
            permanent: false,
            direction: "top",
          });
          poly.on("click", () => setSelected(property));
          poly.addTo(layersRef.current!);

          property.geojson_polygon.coordinates[0].forEach(([lng, lat]) => {
            bounds.push([lat, lng]);
          });
        } else if (property.latitude && property.longitude) {
          const marker = L.circleMarker(
            [property.latitude, property.longitude],
            {
              radius: 10,
              color: property.listing_type === "sale" ? "#00AEEF" : "#F59E0B",
              fillColor:
                property.listing_type === "sale" ? "#00AEEF" : "#F59E0B",
              fillOpacity: 0.85,
              weight: 2,
            },
          );
          marker.bindTooltip(property.cadastral_code);
          marker.on("click", () => setSelected(property));
          marker.addTo(layersRef.current!);
          bounds.push([property.latitude, property.longitude]);
        }
      });

      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }

      mapRef.current.invalidateSize();
    }

    drawMarkers();

    return () => {
      cancelled = true;
    };
  }, [properties, ready]);

  return (
    <div className="relative h-full min-h-[320px] w-full">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      {selected && (
        <PropertySidebar
          property={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
