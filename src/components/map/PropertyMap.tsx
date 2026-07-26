"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CadastralMapPreview,
  MapProperty,
} from "@/lib/types/property-listing";
import { PropertySidebar } from "@/components/map/PropertySidebar";
import { buildMapPopupHtml, getPropertyBounds } from "@/lib/map-popup";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  properties: MapProperty[];
  preview?: CadastralMapPreview | null;
  selectedId?: string | null;
  onSelect?: (property: MapProperty | null) => void;
  fitOnLoad?: boolean;
  showSidebarOnSelect?: boolean;
}

function collectBounds(
  properties: MapProperty[],
  preview?: CadastralMapPreview | null,
): [number, number][] {
  const bounds: [number, number][] = [];

  properties.forEach((property) => {
    bounds.push(...getPropertyBounds(property));
  });

  if (preview?.geojson_polygon?.coordinates?.[0]?.length) {
    preview.geojson_polygon.coordinates[0].forEach(([lng, lat]) => {
      bounds.push([lat, lng]);
    });
  } else if (preview?.latitude && preview?.longitude) {
    bounds.push([preview.latitude, preview.longitude]);
  }

  return bounds;
}

function polygonStyle(
  property: MapProperty,
  selectedId: string | null,
  hoveredId: string | null,
) {
  const isSale = property.listing_type === "sale";
  const baseColor = isSale ? "#00AEEF" : "#F59E0B";
  const isSelected = property.id === selectedId;
  const isHovered = property.id === hoveredId;

  return {
    color: isSelected ? "#ef7d00" : baseColor,
    fillColor: isSelected ? "#ef7d00" : baseColor,
    fillOpacity: isSelected ? 0.45 : isHovered ? 0.4 : 0.28,
    weight: isSelected ? 3 : isHovered ? 2.5 : 2,
  };
}

export function PropertyMap({
  properties,
  preview = null,
  selectedId = null,
  onSelect,
  fitOnLoad = true,
  showSidebarOnSelect = true,
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layersRef = useRef<import("leaflet").LayerGroup | null>(null);
  const previewLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const layerByIdRef = useRef<Map<string, import("leaflet").Layer>>(new Map());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sidebarProperty, setSidebarProperty] = useState<MapProperty | null>(
    null,
  );
  const [ready, setReady] = useState(false);
  const initialFitDone = useRef(false);

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
      previewLayerRef.current = L.layerGroup().addTo(map);
      setReady(true);

      setTimeout(() => map.invalidateSize(), 100);
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = null;
      previewLayerRef.current = null;
      layerByIdRef.current.clear();
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
      layerByIdRef.current.clear();

      properties.forEach((property) => {
        const style = polygonStyle(property, selectedId, hoveredId);

        if (property.geojson_polygon?.coordinates?.[0]?.length) {
          const poly = L.polygon(
            property.geojson_polygon.coordinates[0].map(([lng, lat]) => [
              lat,
              lng,
            ]),
            style,
          );

          poly.bindPopup(buildMapPopupHtml(property), {
            maxWidth: 280,
            className: "kera-map-popup",
          });

          poly.on("mouseover", () => setHoveredId(property.id));
          poly.on("mouseout", () =>
            setHoveredId((current) =>
              current === property.id ? null : current,
            ),
          );
          poly.on("click", () => {
            onSelect?.(property);
            if (showSidebarOnSelect) setSidebarProperty(property);
          });

          poly.addTo(layersRef.current!);
          layerByIdRef.current.set(property.id, poly);
        } else if (property.latitude && property.longitude) {
          const marker = L.circleMarker(
            [property.latitude, property.longitude],
            {
              radius: style.weight === 3 ? 12 : 10,
              color: style.color,
              fillColor: style.fillColor,
              fillOpacity: style.fillOpacity + 0.2,
              weight: style.weight,
            },
          );

          marker.bindPopup(buildMapPopupHtml(property), { maxWidth: 280 });
          marker.on("mouseover", () => setHoveredId(property.id));
          marker.on("mouseout", () =>
            setHoveredId((current) =>
              current === property.id ? null : current,
            ),
          );
          marker.on("click", () => {
            onSelect?.(property);
            if (showSidebarOnSelect) setSidebarProperty(property);
          });

          marker.addTo(layersRef.current!);
          layerByIdRef.current.set(property.id, marker);
        }
      });

      mapRef.current.invalidateSize();
    }

    drawMarkers();

    return () => {
      cancelled = true;
    };
  }, [properties, ready, selectedId, hoveredId, onSelect, showSidebarOnSelect]);

  useEffect(() => {
    if (!ready || !mapRef.current || !previewLayerRef.current) return;

    let cancelled = false;

    async function drawPreview() {
      const L = (await import("leaflet")).default;
      if (cancelled || !previewLayerRef.current || !mapRef.current) return;

      previewLayerRef.current.clearLayers();

      if (!preview) return;

      if (preview.geojson_polygon?.coordinates?.[0]?.length) {
        const poly = L.polygon(
          preview.geojson_polygon.coordinates[0].map(([lng, lat]) => [
            lat,
            lng,
          ]),
          {
            color: "#EA580C",
            fillColor: "#FB923C",
            fillOpacity: 0.35,
            weight: 3,
            dashArray: "8 6",
          },
        );
        poly.bindTooltip(
          preview.address
            ? `${preview.cadastral_code} — ${preview.address}`
            : preview.cadastral_code,
          { permanent: false, direction: "top" },
        );
        poly.addTo(previewLayerRef.current);
      } else if (preview.latitude && preview.longitude) {
        const marker = L.circleMarker(
          [preview.latitude, preview.longitude],
          {
            radius: 12,
            color: "#EA580C",
            fillColor: "#FB923C",
            fillOpacity: 0.9,
            weight: 3,
          },
        );
        marker.bindTooltip(preview.cadastral_code);
        marker.addTo(previewLayerRef.current);
      }
    }

    drawPreview();

    return () => {
      cancelled = true;
    };
  }, [preview, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    if (fitOnLoad && !initialFitDone.current && properties.length > 0) {
      const bounds = collectBounds(properties, preview);
      if (bounds.length === 1) {
        mapRef.current.setView(bounds[0], 16);
      } else if (bounds.length > 1) {
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
      initialFitDone.current = true;
      return;
    }

    if (preview?.latitude && preview?.longitude && !selectedId) {
      mapRef.current.setView([preview.latitude, preview.longitude], 16);
    }

    mapRef.current.invalidateSize();
  }, [properties, preview, ready, fitOnLoad, selectedId]);

  useEffect(() => {
    if (!ready || !mapRef.current || !selectedId) return;

    const property = properties.find((item) => item.id === selectedId);
    if (!property) return;

    const bounds = getPropertyBounds(property);
    if (bounds.length === 1) {
      mapRef.current.setView(bounds[0], 17, { animate: true });
    } else if (bounds.length > 1) {
      mapRef.current.fitBounds(bounds, {
        padding: [48, 48],
        maxZoom: 17,
        animate: true,
      });
    }

    if (showSidebarOnSelect) {
      setSidebarProperty(property);
    }
  }, [selectedId, properties, ready, showSidebarOnSelect]);

  const activeSidebar = showSidebarOnSelect ? sidebarProperty : null;

  return (
    <div className="relative isolate h-full min-h-[320px] w-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      {activeSidebar && (
        <PropertySidebar
          property={activeSidebar}
          onClose={() => {
            setSidebarProperty(null);
            onSelect?.(null);
          }}
        />
      )}
    </div>
  );
}
