import type { Messages } from "./messages";

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
    { value: "buy", label: t.dealTypes.buy },
    { value: "rent", label: t.dealTypes.rent },
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
