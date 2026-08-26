/** Web Mercator tile helpers for NAPR tile proxy. */
const EARTH_RADIUS = 6378137;

export function tileToBBox(
  x: number,
  y: number,
  z: number,
): [number, number, number, number] {
  const n = 2 ** z;
  const lonMin = (x / n) * 360 - 180;
  const lonMax = ((x + 1) / n) * 360 - 180;
  const latRad1 = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const latRad2 = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n)));
  const latMax = (latRad1 * 180) / Math.PI;
  const latMin = (latRad2 * 180) / Math.PI;
  return [lonMin, latMin, lonMax, latMax];
}

export function getNaprWebCadMapBase(): string {
  const raw =
    process.env.CADASTRAL_API_URL ??
    "http://gisappsn.reestri.gov.ge/ArcGIS/rest/services/CadRepGeo/MapServer";

  if (raw.includes("WebCadMap")) return raw.replace(/\/+$/, "");
  return raw.replace(/CadRepGeo\/MapServer\/?$/, "WebCadMap/MapServer");
}

export function getNaprCadastralWmsUrl(): string {
  const raw =
    process.env.CADASTRAL_API_URL ??
    "http://gisappsn.reestri.gov.ge/ArcGIS/rest/services/CadRepGeo/MapServer";
  return raw.replace(/\/+$/, "") + "/WMSServer";
}

/** Meters per pixel at equator for zoom level (256px tiles). */
export function metersPerPixel(z: number): number {
  return (2 * Math.PI * EARTH_RADIUS) / (256 * 2 ** z);
}
