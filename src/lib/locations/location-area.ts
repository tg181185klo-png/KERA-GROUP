import type { SearchCityId } from "./georgia";
import { CITIES_WITH_DISTRICTS, OTHER_CITIES } from "./georgia";

/** Self-governing cities — no predefined districts/villages; free-text area input. */
export const SELF_GOVERNING_CITIES = [
  "rustavi",
  "gori",
  "zugdidi",
  "poti",
] as const satisfies readonly SearchCityId[];

export type SelfGoverningCity = (typeof SELF_GOVERNING_CITIES)[number];

export type CityWithDistricts = keyof typeof CITIES_WITH_DISTRICTS;

export type MunicipalityId = Exclude<
  (typeof OTHER_CITIES)[number],
  SelfGoverningCity
>;

export const MUNICIPALITY_IDS = OTHER_CITIES.filter(
  (id): id is MunicipalityId =>
    !(SELF_GOVERNING_CITIES as readonly string[]).includes(id),
);

export type LocationAreaMode =
  | "district-select"
  | "district-text"
  | "village-select"
  | "hidden";

/** Hero search value when the entire municipality is selected. */
export const MUNICIPALITY_ALL_AREAS = "all" as const;

export function isMunicipalityAllAreas(value: string): boolean {
  return value === MUNICIPALITY_ALL_AREAS;
}

export function isSelfGoverningCity(city: string): city is SelfGoverningCity {
  return (SELF_GOVERNING_CITIES as readonly string[]).includes(city);
}

export function isMunicipality(city: string): city is MunicipalityId {
  return (MUNICIPALITY_IDS as readonly string[]).includes(city);
}

export function getLocationAreaMode(city: string): LocationAreaMode {
  if (!city) return "hidden";
  if (city in CITIES_WITH_DISTRICTS) return "district-select";
  if (isSelfGoverningCity(city)) return "district-text";
  if (isMunicipality(city)) return "village-select";
  return "hidden";
}

export function cityUsesVillageField(city: string): boolean {
  return getLocationAreaMode(city) === "village-select";
}

export function cityUsesDistrictField(city: string): boolean {
  const mode = getLocationAreaMode(city);
  return mode === "district-select" || mode === "district-text";
}
