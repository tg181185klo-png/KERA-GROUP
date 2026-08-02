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

export type ServiceKey =
  | "fullService"
  | "individualSearch"
  | "remoteService"
  | "developerSales"
  | "propertyRealization";

export function getNavLinks(t: Messages) {
  return [
    { href: "/map", label: t.nav.map },
    { href: "/properties", label: t.nav.properties },
    { href: "/#calculator", label: t.nav.calculator },
    { href: "/dashboard/add-property", label: t.nav.list },
  ] as const;
}

export function getFooterLinks(t: Messages) {
  return [
    { href: "/", label: t.nav.home },
    { href: "/#services", label: t.nav.about },
    { href: "/map", label: t.nav.map },
    { href: "/properties", label: t.nav.properties },
    { href: "/dashboard/add-property", label: t.nav.list },
    { href: "/#calculator", label: t.nav.calculator },
    { href: "/#currency", label: t.quickActions.currency.label },
  ] as const;
}

export function getDealTypes(t: Messages) {
  return [
    { value: "sale", label: t.dealTypes.buySell },
    { value: "rent", label: t.dealTypes.rent },
    { value: "pledge", label: t.dealTypes.pledge },
  ] as const;
}

export function getMapDealTypeOptions(t: Messages) {
  return [
    { value: "sale", label: t.map.legend.deals.sale },
    { value: "rent", label: t.map.legend.deals.rent },
    { value: "daily_rent", label: t.map.legend.deals.daily_rent },
    { value: "pledge", label: t.map.legend.deals.pledge },
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
  if (mode === "district-text") return t.hero.city;
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
    {
      key: "fullService" as const,
      title: t.services.fullService.title,
      desc: t.services.fullService.shortDesc,
      detail: t.services.fullService.detail,
      icon: "home" as const,
    },
    {
      key: "individualSearch" as const,
      title: t.services.individualSearch.title,
      desc: t.services.individualSearch.shortDesc,
      detail: t.services.individualSearch.detail,
      icon: "search" as const,
    },
    {
      key: "remoteService" as const,
      title: t.services.remoteService.title,
      desc: t.services.remoteService.shortDesc,
      detail: t.services.remoteService.detail,
      icon: "globe" as const,
    },
    {
      key: "developerSales" as const,
      title: t.services.developerSales.title,
      desc: t.services.developerSales.shortDesc,
      detail: t.services.developerSales.detail,
      icon: "crane" as const,
    },
    {
      key: "propertyRealization" as const,
      title: t.services.propertyRealization.title,
      desc: t.services.propertyRealization.shortDesc,
      detail: t.services.propertyRealization.detail,
      icon: "chart" as const,
    },
  ];
}

export function serviceHash(key: ServiceKey): string {
  return `services-${key}`;
}

export function parseServiceHash(hash: string): ServiceKey | null {
  const match = hash.replace(/^#/, "").match(/^services-(\w+)$/);
  if (!match) return null;
  const key = match[1] as ServiceKey;
  const valid: ServiceKey[] = [
    "fullService",
    "individualSearch",
    "remoteService",
    "developerSales",
    "propertyRealization",
  ];
  return valid.includes(key) ? key : null;
}

export function getListingTypeLabel(
  t: Messages,
  type: "sale" | "rent" | "daily_rent" | "pledge",
): string {
  if (type === "daily_rent") return t.map.legend.deals.daily_rent;
  if (type === "pledge") return t.map.legend.deals.pledge;
  if (type === "rent") return t.listingTypes.rent;
  return t.listingTypes.sale;
}

export function getMapDealTypeLabel(
  t: Messages,
  type: "sale" | "rent" | "daily_rent" | "pledge",
): string {
  return t.map.legend.deals[type];
}
