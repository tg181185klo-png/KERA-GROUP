import type { MapProperty } from "@/lib/types/property-listing";

export type MapDealType = "sale" | "rent" | "daily_rent" | "pledge";
export type LocationTier = "metropolis" | "city" | "village";

export const DEAL_MARKER_COLORS: Record<MapDealType, string> = {
  sale: "#2ECC71",
  rent: "#3498DB",
  daily_rent: "#00BCD4",
  pledge: "#9B59B6",
};

export const LOCATION_ACCENT_COLORS: Record<LocationTier, string> = {
  metropolis: "#34495E",
  city: "#E67E22",
  village: "#795548",
};

const METROPOLIS_PATTERNS = [
  /თბილის/i,
  /tbilisi/i,
  /ბათუმ/i,
  /batumi/i,
  /ქუთაის/i,
  /kutaisi/i,
  /რუსთავ/i,
  /rustavi/i,
];

const VILLAGE_PATTERNS = [/სოფ(?:ელი|\b)/i, /სოფ\./i, /,\s*ს\./i];

const REGIONAL_CITY_PATTERNS = [
  /ზუგდიდ/i,
  /zugdidi/i,
  /გორი/i,
  /gori/i,
  /ფოთ/i,
  /poti/i,
  /თელავ/i,
  /telavi/i,
  /ახალციხ/i,
  /akhalt/i,
  /მცხეთ/i,
  /mtskheta/i,
  /გარდაბან/i,
  /gardabani/i,
  /მარნეულ/i,
  /marneuli/i,
  /ბაღდათ/i,
  /baghdati/i,
  /ზესტაფონ/i,
  /zestaponi/i,
  /ჭიათურ/i,
  /chiatura/i,
  /სამტრედ/i,
  /samtredia/i,
  /საგარეჯ/i,
  /sagarejo/i,
  /ბოლნის/i,
  /bolnisi/i,
  /დმანის/i,
  /dmanisi/i,
  /kaspi/i,
  /კასპ/i,
  /kobuleti/i,
  /ქობულეთ/i,
  /ozurgeti/i,
  /ოზურგეთ/i,
];

export function getMapDealType(property: MapProperty): MapDealType {
  const raw = String(property.deal_type ?? property.listing_type ?? "sale")
    .toLowerCase()
    .trim();

  if (raw === "rent") return "rent";
  if (raw === "daily_rent" || raw === "daily") return "daily_rent";
  if (raw === "pledge") return "pledge";
  return "sale";
}

export function getLocationTier(address: string): LocationTier {
  const value = address.trim();
  if (!value) return "city";

  if (VILLAGE_PATTERNS.some((pattern) => pattern.test(value))) {
    return "village";
  }

  if (METROPOLIS_PATTERNS.some((pattern) => pattern.test(value))) {
    return "metropolis";
  }

  if (REGIONAL_CITY_PATTERNS.some((pattern) => pattern.test(value))) {
    return "city";
  }

  const segments = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (segments.length >= 2) {
    const tail = segments.slice(1).join(" ");
    if (VILLAGE_PATTERNS.some((pattern) => pattern.test(tail))) {
      return "village";
    }
    return "city";
  }

  if (segments.length === 1 && segments[0].length <= 24) {
    return "village";
  }

  return "city";
}

export function getMarkerStyle(property: MapProperty) {
  const dealType = getMapDealType(property);
  const locationTier = getLocationTier(property.address);

  return {
    dealType,
    locationTier,
    background: DEAL_MARKER_COLORS[dealType],
    accent: LOCATION_ACCENT_COLORS[locationTier],
  };
}

export function getPolygonFillColor(property: MapProperty): string {
  return getMarkerStyle(property).background;
}
