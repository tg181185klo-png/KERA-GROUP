"use client";

import { useEffect, useRef } from "react";
import type { GeoJSON } from "geojson";
import "leaflet/dist/leaflet.css";

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  polygon: GeoJSON.Polygon | null;
  onLocationChange: (lat: number, lng: number) => void;
}

export function MapPicker({
  latitude,
  longitude,
  polygon,
  onLocationChange,
}: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current) return;

      const lat = latitude ?? 41.7151;
      const lng = longitude ?? 44.8271;

      const map = L.map(containerRef.current).setView([lat, lng], 15);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      if (latitude && longitude) {
        markerRef.current = L.marker([latitude, longitude], { icon }).addTo(map);
      }

      if (polygon) {
        polygonRef.current = L.polygon(
          polygon.coordinates[0].map(([lng, lat]) => [lat, lng]),
          { color: "#00AEEF", fillColor: "#00AEEF", fillOpacity: 0.2 },
        ).addTo(map);
        map.fitBounds(polygonRef.current.getBounds(), { padding: [30, 30] });
      }

      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          markerRef.current = L.marker([clickLat, clickLng], { icon }).addTo(map);
        }
        onLocationChange(clickLat, clickLng);
      });
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    async function updateMap() {
      const L = (await import("leaflet")).default;

      if (markerRef.current) {
        markerRef.current.setLatLng([latitude!, longitude!]);
      }

      if (polygonRef.current) {
        polygonRef.current.remove();
        polygonRef.current = null;
      }

      if (polygon) {
        polygonRef.current = L.polygon(
          polygon.coordinates[0].map(([lng, lat]) => [lat, lng]),
          { color: "#00AEEF", fillColor: "#00AEEF", fillOpacity: 0.2 },
        ).addTo(mapRef.current!);
        mapRef.current!.fitBounds(polygonRef.current.getBounds(), {
          padding: [30, 30],
        });
      } else {
        mapRef.current!.setView([latitude!, longitude!], 15);
      }
    }

    updateMap();
  }, [latitude, longitude, polygon]);

  return (
    <div
      ref={containerRef}
      className="h-72 w-full overflow-hidden rounded-xl border border-slate-200"
    />
  );
}
