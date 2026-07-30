import type { Messages } from "./messages";
import { ALL_SEARCH_CITIES } from "@/lib/locations/georgia";
import {
  isMunicipalityAllAreas,
  type LocationAreaMode,
} from "@/lib/locations/location-area";
import {
  getVillageLabel,
  getVillagesForMunicipality,
} from "@/lib/locations/municipality-villages";
import type { Locale } from "./types";

export function getNavLinks(t: Messages) {
  return [
    { href: "/#services", label: t.nav.services },
    { href: "/map", label: t.nav.map },
    { href: "/properties", label: t.nav.properties },
    { href: "/#calculator", label: t.nav.calculator },
    { href: "/dashboard/add-property", label: t.nav.list },
  ] as const;
}

export function getFooterLinks(t: Messages) {
  return [
    { href: "/", label: t.nav.home },
    { href: "/#services", label: t.nav.services },
    { href: "/#map", label: t.nav.map },
    { href: "/#featured", label: t.nav.properties },
    { href: "/dashboard/add-property", label: t.nav.list },
    { href: "/#calculator", label: t.nav.calculator },
  ] as const;
}

export function getDealTypes(t: Messages) {
  return [
    { value: "sale", label: t.dealTypes.buySell },
    { value: "rent", label: t.dealTypes.rent },
    { value: "pledge", label: t.dealTypes.pledge },
  ] as const;
}

export function getPropertyTypes(t: Messages) {
  return [
    { value: "apartment", label: t.propertyTypes.apartment },
    { value: "house", label: t.propertyTypes.house },
    { value: "commercial", label: t.propertyTypes.commercial },
    { value: "land", label: t.propertyTypes.land },
  ] as const;
}

export function getSearchCities(t: Messages) {
  return ALL_SEARCH_CITIES.map((id) => ({
    value: id,
    label: t.hero.cities[id as keyof typeof t.hero.cities],
  }));
}

export function getLandStatusOptions(t: Messages) {
  return [
    { value: "", label: t.landStatus.any },
    { value: "agricultural", label: t.landStatus.agricultural },
    { value: "non_agricultural", label: t.landStatus.nonAgricultural },
  ] as const;
}

export function getDistrictLabel(
  t: Messages,
  districtId: string,
): string {
  return (
    t.hero.districts[districtId as keyof typeof t.hero.districts] ?? districtId
  );
}

export function getCityLabel(t: Messages, cityId: string): string {
  return t.hero.cities[cityId as keyof typeof t.hero.cities] ?? cityId;
}

export function getLocationAreaFieldLabel(
  t: Messages,
  mode: LocationAreaMode,
): string {
  if (mode === "village-select") return t.hero.village;
  return t.hero.district;
}

export function getLocationAreaPlaceholder(
  t: Messages,
  mode: LocationAreaMode,
): string {
  if (mode === "village-select") return t.hero.selectVillage;
  if (mode === "district-text") return t.hero.districtFreePlaceholder;
  return t.hero.selectDistrict;
}

export function getAreaDisplayLabel(
  t: Messages,
  locale: Locale,
  cityId: string,
  areaValue: string,
  mode: LocationAreaMode,
): string {
  if (!areaValue || isMunicipalityAllAreas(areaValue)) return "";
  if (mode === "district-select") {
    return getDistrictLabel(t, areaValue);
  }
  if (mode === "village-select") {
    return getVillageLabel(
      getVillagesForMunicipality(cityId),
      areaValue,
      locale,
    );
  }
  return areaValue.trim();
}

export function getServices(t: Messages) {
  return [
    { key: "realty", ...t.services.realty, icon: "building" as const },
    { key: "developments", ...t.services.developments, icon: "crane" as const },
    { key: "invest", ...t.services.invest, icon: "chart" as const },
    { key: "management", ...t.services.management, icon: "key" as const },
    { key: "media", ...t.services.media, icon: "camera" as const },
  ];
}

export function getListingTypeLabel(
  t: Messages,
  type: "sale" | "rent",
): string {
  return type === "rent" ? t.listingTypes.rent : t.listingTypes.sale;
}

export function getMapDealTypeLabel(
  t: Messages,
  type: "sale" | "rent" | "daily_rent" | "pledge",
): string {
  return t.map.legend.deals[type];
}
