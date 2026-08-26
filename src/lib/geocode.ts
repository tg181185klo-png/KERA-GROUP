const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const NULL_CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { lat: number; lng: number } | null>();
const cacheTimestamps = new Map<string, number>();

function cacheKey(address: string): string {
  return address.trim().toLowerCase();
}

function readCached(key: string): { lat: number; lng: number } | null | undefined {
  const cachedAt = cacheTimestamps.get(key);
  if (!cachedAt || !cache.has(key)) return undefined;

  const hit = cache.get(key) ?? null;
  const ttl = hit == null ? NULL_CACHE_TTL_MS : CACHE_TTL_MS;
  if (Date.now() - cachedAt < ttl) return hit;

  cache.delete(key);
  cacheTimestamps.delete(key);
  return undefined;
}

/** Geocode a Georgian address via OpenStreetMap Nominatim (fallback when cadastral coords missing). */
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const key = cacheKey(trimmed);
  const cached = readCached(key);
  if (cached !== undefined) return cached;

  const query = trimmed.includes("საქართველო") || /georgia/i.test(trimmed)
    ? trimmed
    : `${trimmed}, Georgia`;

  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "ge");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "KERAGroup/1.0 (https://keragroup.ge; property-map-geocoding)",
      },
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      cache.set(key, null);
      cacheTimestamps.set(key, Date.now());
      return null;
    }

    const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const hit = data[0];
    if (!hit?.lat || !hit.lon) {
      cache.set(key, null);
      cacheTimestamps.set(key, Date.now());
      return null;
    }

    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      cache.set(key, null);
      cacheTimestamps.set(key, Date.now());
      return null;
    }

    const coords = { lat, lng };
    cache.set(key, coords);
    cacheTimestamps.set(key, Date.now());
    return coords;
  } catch {
    cache.set(key, null);
    cacheTimestamps.set(key, Date.now());
    return null;
  }
}
