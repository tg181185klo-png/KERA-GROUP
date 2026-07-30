"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/LocaleProvider";
import type {
  CadastralMapPreview,
  MapProperty,
} from "@/lib/types/property-listing";
import { PropertySidebar } from "@/components/map/PropertySidebar";
import { buildMapPopupHtml } from "@/lib/map-popup";
import {
  getPropertyBounds,
  getPropertyCenter,
  POLYGON_MIN_ZOOM,
  shouldShowPolygons,
} from "@/lib/map-geometry";
import { isMappableProperty } from "@/lib/property-normalize";
import { priceMarkerIconOptions } from "@/lib/map-markers";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

interface PropertyMapProps {
  properties: MapProperty[];
  preview?: CadastralMapPreview | null;
  selectedId?: string | null;
  onSelect?: (property: MapProperty | null) => void;
  fitOnLoad?: boolean;
  showSidebarOnSelect?: boolean;
  /** Always draw cadastral polygons (property detail page). */
  forcePolygons?: boolean;
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
  const isSelected = property.id === selectedId;
  const isHovered = property.id === hoveredId;

  return {
    color: "#ffffff",
    fillColor: isSelected ? "#ef4444" : isSale ? "#f97316" : "#3b82f6",
    fillOpacity: isSelected ? 0.55 : isHovered ? 0.5 : 0.42,
    weight: isSelected ? 3 : 2,
  };
}

export function PropertyMap({
  properties,
  preview = null,
  selectedId = null,
  onSelect,
  fitOnLoad = true,
  showSidebarOnSelect = true,
  forcePolygons = false,
}: PropertyMapProps) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const clusterRef = useRef<import("leaflet").MarkerClusterGroup | null>(null);
  const polygonLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const previewLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const layerByIdRef = useRef<Map<string, import("leaflet").Layer>>(new Map());
  const propertiesRef = useRef(properties);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sidebarProperty, setSidebarProperty] = useState<MapProperty | null>(
    null,
  );
  const [ready, setReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12);
  const initialFitDone = useRef(false);

  propertiesRef.current = properties;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      await import("leaflet.markercluster");

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: true }).setView(
        [41.7151, 44.8271],
        7,
      );
      mapRef.current = map;

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "© Esri · NAPR",
          maxZoom: 19,
        },
      ).addTo(map);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          opacity: 0.75,
        },
      ).addTo(map);

      clusterRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 64,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: POLYGON_MIN_ZOOM,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          const size = count < 10 ? 44 : count < 100 ? 52 : 60;
          return L.divIcon({
            html: `<div class="kera-cluster-icon"><span>${count}</span></div>`,
            className: "kera-cluster-marker",
            iconSize: [size, size],
          });
        },
      });
      map.addLayer(clusterRef.current);

      polygonLayerRef.current = L.layerGroup().addTo(map);
      previewLayerRef.current = L.layerGroup().addTo(map);

      map.on("zoomend", () => setZoomLevel(map.getZoom()));
      setZoomLevel(map.getZoom());
      setReady(true);

      setTimeout(() => map.invalidateSize(), 150);
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      clusterRef.current = null;
      polygonLayerRef.current = null;
      previewLayerRef.current = null;
      layerByIdRef.current.clear();
      setReady(false);
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !clusterRef.current || !polygonLayerRef.current)
      return;

    let cancelled = false;

    async function drawLayers() {
      const L = (await import("leaflet")).default;
      if (
        cancelled ||
        !clusterRef.current ||
        !polygonLayerRef.current ||
        !mapRef.current
      ) {
        return;
      }

      const showPolygons =
        forcePolygons || shouldShowPolygons(mapRef.current.getZoom());

      clusterRef.current.clearLayers();
      polygonLayerRef.current.clearLayers();
      layerByIdRef.current.clear();

      const mappable = properties.filter(isMappableProperty);

      mappable.forEach((property) => {
        const style = polygonStyle(property, selectedId, hoveredId);
        const center = getPropertyCenter(property);
        if (!center) return;

        const handleSelect = () => {
          onSelect?.(property);
          if (showSidebarOnSelect) setSidebarProperty(property);
        };

        if (showPolygons && property.geojson_polygon?.coordinates?.[0]?.length) {
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

          poly.bindTooltip(property.cadastral_code, {
            permanent: mapRef.current!.getZoom() >= 16,
            direction: "center",
            className: "kera-cadastral-label",
          });

          poly.on("mouseover", () => setHoveredId(property.id));
          poly.on("mouseout", () =>
            setHoveredId((current) =>
              current === property.id ? null : current,
            ),
          );
          poly.on("click", handleSelect);

          poly.addTo(polygonLayerRef.current!);
          layerByIdRef.current.set(property.id, poly);
        } else if (!showPolygons || !property.geojson_polygon) {
          const marker = L.marker(center, {
            icon: L.divIcon(priceMarkerIconOptions(property, selectedId)),
          });

          marker.bindPopup(buildMapPopupHtml(property), { maxWidth: 280 });
          marker.on("click", handleSelect);
          marker.on("mouseover", () => setHoveredId(property.id));
          marker.on("mouseout", () =>
            setHoveredId((current) =>
              current === property.id ? null : current,
            ),
          );

          clusterRef.current!.addLayer(marker);
          layerByIdRef.current.set(property.id, marker);
        }
      });

      mapRef.current.invalidateSize();
    }

    drawLayers();

    return () => {
      cancelled = true;
    };
  }, [
    properties,
    ready,
    selectedId,
    hoveredId,
    onSelect,
    showSidebarOnSelect,
    forcePolygons,
    zoomLevel,
  ]);

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
            fillOpacity: 0.4,
            weight: 3,
            dashArray: "6 4",
          },
        );
        poly.bindTooltip(preview.cadastral_code, {
          permanent: true,
          direction: "center",
          className: "kera-cadastral-label",
        });
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
        marker.bindTooltip(preview.cadastral_code, { permanent: true });
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

    if (fitOnLoad && !initialFitDone.current) {
      const bounds = collectBounds(properties, preview);
      if (bounds.length === 1) {
        mapRef.current.setView(bounds[0], forcePolygons ? 17 : 15);
        initialFitDone.current = true;
      } else if (bounds.length > 1) {
        mapRef.current.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
        initialFitDone.current = true;
      } else if (properties.length === 0 && !preview) {
        mapRef.current.setView([41.7151, 44.8271], 7);
      }
    }

    mapRef.current.invalidateSize();
  }, [properties, preview, ready, fitOnLoad, forcePolygons]);

  useEffect(() => {
    if (!ready || !mapRef.current || !selectedId) return;

    const property = propertiesRef.current.find((item) => item.id === selectedId);
    if (!property || !isMappableProperty(property)) return;

    const bounds = getPropertyBounds(property);
    if (bounds.length === 1) {
      mapRef.current.setView(bounds[0], 17, { animate: true });
    } else if (bounds.length > 1) {
      mapRef.current.fitBounds(bounds, {
        padding: [56, 56],
        maxZoom: 18,
        animate: true,
      });
    }

    if (showSidebarOnSelect) {
      setSidebarProperty(property);
    }
  }, [selectedId, ready, showSidebarOnSelect]);

  const activeSidebar = showSidebarOnSelect ? sidebarProperty : null;
  const showZoomHint =
    !forcePolygons && properties.some(isMappableProperty) && zoomLevel < POLYGON_MIN_ZOOM;

  return (
    <div className="relative isolate h-full min-h-[320px] w-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      {showZoomHint && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-full border border-white/20 bg-slate-900/75 px-4 py-2 text-center text-xs text-white shadow-lg backdrop-blur">
          {t.map.zoomHint}
        </div>
      )}
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
