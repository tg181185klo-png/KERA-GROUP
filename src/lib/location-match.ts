import type { Messages } from "@/i18n/messages";
import { en as enMessages } from "@/i18n/messages/en";
import { ka as kaMessages } from "@/i18n/messages/ka";
import {
  getCityLabel,
  getDistrictLabel,
} from "@/i18n/nav";
import type { Locale } from "@/i18n/types";
import { ALL_SEARCH_CITIES, getDistrictsForCity } from "@/lib/locations/georgia";
import {
  getLocationAreaMode,
  isMunicipalityAllAreas,
} from "@/lib/locations/location-area";
import {
  getVillageLabel,
  getVillagesForMunicipality,
} from "@/lib/locations/municipality-villages";
import type { PropertySearchParams } from "@/lib/types/property";

export type ResolvedPropertyLocation = {
  cityId: string;
  areaId?: string;
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripAdministrativeSuffix(segment: string): string {
  return segment
    .replace(/\bmunicipality\b/gi, "")
    .replace(/\bmunitsip(alitet)?i\b/gi, "")
    .replace(/\braioni\b/gi, "")
    .replace(/\bdistrict\b/gi, "")
    .trim();
}

function extractVillageName(address: string): string | null {
  const patterns = [
    /\bvillage\s+([^,]+)/i,
    /\bsop(?:eli|\.)\s*([^,]+)/i,
    /სოფ(?:ელი|\.)?\s*([^,]+)/i,
  ];

  for (const pattern of patterns) {
    const match = address.match(pattern);
    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
  }

  return null;
}

function getCityLabelsForId(id: string): string[] {
  const labels = new Set<string>();
  const kaCity =
    kaMessages.hero.cities[id as keyof typeof kaMessages.hero.cities];
  const enCity =
    enMessages.hero.cities[id as keyof typeof enMessages.hero.cities];
  if (kaCity) labels.add(normalize(kaCity));
  if (enCity) labels.add(normalize(enCity));
  labels.add(normalize(id.replace(/-/g, " ")));
  return [...labels].filter((label) => label.length > 0);
}

function getDistrictLabelsForId(id: string): string[] {
  const labels = new Set<string>();
  const kaDistrict =
    kaMessages.hero.districts[id as keyof typeof kaMessages.hero.districts];
  const enDistrict =
    enMessages.hero.districts[id as keyof typeof enMessages.hero.districts];
  if (kaDistrict) labels.add(normalize(kaDistrict));
  if (enDistrict) labels.add(normalize(enDistrict));
  return [...labels].filter((label) => label.length > 0);
}

function buildCityCandidates(): Array<{ id: string; labels: string[] }> {
  return ALL_SEARCH_CITIES.map((id) => ({
    id,
    labels: getCityLabelsForId(id),
  }));
}

function matchCityInSegment(
  segment: string,
  candidates: Array<{ id: string; labels: string[] }>,
): string | null {
  const normalizedSegment = normalize(stripAdministrativeSuffix(segment));
  if (!normalizedSegment) return null;

  const sortedCandidates = [...candidates].sort(
    (a, b) =>
      Math.max(...b.labels.map((label) => label.length)) -
      Math.max(...a.labels.map((label) => label.length)),
  );

  for (const candidate of sortedCandidates) {
    const labels = [...candidate.labels].sort((a, b) => b.length - a.length);
    for (const label of labels) {
      if (normalizedSegment === label) return candidate.id;
      if (normalizedSegment.startsWith(`${label} `)) return candidate.id;
      if (label.length >= 4 && normalizedSegment.includes(label)) {
        return candidate.id;
      }
    }
  }

  return null;
}

function resolveAreaId(
  cityId: string,
  address: string,
): string | undefined {
  const mode = getLocationAreaMode(cityId);
  const segments = address.split(",").map((part) => part.trim()).filter(Boolean);
  const secondPart = segments[1];

  if (mode === "district-select") {
    if (!secondPart) return undefined;
    const normalizedSecond = normalize(secondPart);
    for (const districtId of getDistrictsForCity(cityId)) {
      for (const label of getDistrictLabelsForId(districtId)) {
        if (
          normalizedSecond === label ||
          normalizedSecond.includes(label)
        ) {
          return districtId;
        }
      }
    }
    return undefined;
  }

  if (mode === "village-select") {
    const villageName = extractVillageName(address) ?? secondPart;
    if (!villageName) return undefined;

    const normalizedVillage = normalize(villageName);
    for (const village of getVillagesForMunicipality(cityId)) {
      const kaLabel = normalize(village.ka);
      const enLabel = normalize(village.en);
      if (
        normalizedVillage === kaLabel ||
        normalizedVillage === enLabel ||
        normalizedVillage.includes(kaLabel) ||
        normalizedVillage.includes(enLabel)
      ) {
        return village.id;
      }
    }
    return undefined;
  }

  if (mode === "district-text" && secondPart) {
    return normalize(secondPart);
  }

  return undefined;
}

export function resolvePropertyLocation(
  address: string,
): ResolvedPropertyLocation | null {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const candidates = buildCityCandidates();
  const segments = trimmed.split(",").map((part) => part.trim()).filter(Boolean);

  let cityId =
    matchCityInSegment(segments[0] ?? trimmed, candidates) ??
    matchCityInSegment(stripAdministrativeSuffix(segments[0] ?? trimmed), candidates);

  if (!cityId) {
    const normalizedFull = normalize(trimmed);
    const sortedCandidates = [...candidates].sort(
      (a, b) =>
        Math.max(...b.labels.map((label) => label.length)) -
        Math.max(...a.labels.map((label) => label.length)),
    );

    for (const candidate of sortedCandidates) {
      const labels = [...candidate.labels].sort((a, b) => b.length - a.length);
      for (const label of labels) {
        if (label.length >= 4 && normalizedFull.includes(label)) {
          cityId = candidate.id;
          break;
        }
      }
      if (cityId) break;
    }
  }

  if (!cityId) return null;

  return {
    cityId,
    areaId: resolveAreaId(cityId, trimmed),
  };
}

export function propertyMatchesLocation(
  address: string,
  _title: string,
  params: PropertySearchParams,
  _t: Messages,
  _locale: Locale,
): boolean {
  if (!params.city) return true;

  const resolved = resolvePropertyLocation(address);
  if (!resolved) return false;
  if (resolved.cityId !== params.city) return false;

  const mode = getLocationAreaMode(params.city);

  if (
    params.village &&
    !isMunicipalityAllAreas(params.village) &&
    mode === "village-select"
  ) {
    return resolved.areaId === params.village;
  }

  if (params.district?.trim()) {
    if (mode === "district-select") {
      return resolved.areaId === params.district;
    }
    if (mode === "district-text") {
      return normalize(resolved.areaId ?? "") === normalize(params.district);
    }
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
