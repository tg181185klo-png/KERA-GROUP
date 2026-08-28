import type { Map as LeafletMap } from "leaflet";

/** Satellite imagery + place labels — no NAPR cadastral parcel overlay. */
export function addKeraBaseLayers(map: LeafletMap, L: typeof import("leaflet")) {
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "© Esri",
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
}
