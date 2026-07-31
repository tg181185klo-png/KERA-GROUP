import type { Messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";
import {
  getCityLabel,
  getDistrictLabel,
} from "@/i18n/nav";
import {
  getLocationAreaMode,
  isMunicipalityAllAreas,
} from "@/lib/locations/location-area";
import {
  getVillageLabel,
  getVillagesForMunicipality,
} from "@/lib/locations/municipality-villages";
import type { PropertySearchParams } from "@/lib/types/property";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function propertyMatchesLocation(
  address: string,
  title: string,
  params: PropertySearchParams,
  t: Messages,
  locale: Locale,
): boolean {
  if (!params.city) return true;

  const haystack = normalize(`${address} ${title}`);
  const cityLabel = normalize(getCityLabel(t, params.city));

  if (!haystack.includes(cityLabel)) {
    return false;
  }

  const mode = getLocationAreaMode(params.city);

  if (
    params.village &&
    !isMunicipalityAllAreas(params.village) &&
    mode === "village-select"
  ) {
    const villageLabel = normalize(
      getVillageLabel(
        getVillagesForMunicipality(params.city),
        params.village,
        locale,
      ),
    );
    return haystack.includes(villageLabel);
  }

  if (params.district?.trim()) {
    const districtRaw = normalize(params.district);
    if (mode === "district-select") {
      const districtLabel = normalize(getDistrictLabel(t, params.district));
      return (
        haystack.includes(districtLabel) || haystack.includes(districtRaw)
      );
    }
    return haystack.includes(districtRaw);
  }

  return true;
}

export function composeLocationAddress(
  t: Messages,
  locale: Locale,
  cityId: string,
  areaValue: string,
): string {
  if (!cityId) return "";

  const cityLabel = getCityLabel(t, cityId);
  const mode = getLocationAreaMode(cityId);

  if (!areaValue || isMunicipalityAllAreas(areaValue)) {
    return cityLabel;
  }

  if (mode === "district-select") {
    return `${cityLabel}, ${getDistrictLabel(t, areaValue)}`;
  }

  if (mode === "village-select") {
    const villageLabel = getVillageLabel(
      getVillagesForMunicipality(cityId),
      areaValue,
      locale,
    );
    return `${cityLabel}, ${villageLabel}`;
  }

  return `${cityLabel}, ${areaValue.trim()}`;
}
