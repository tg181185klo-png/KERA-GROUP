"use client";

import { useMemo } from "react";
import { useLocale, useT } from "@/i18n/LocaleProvider";
import {
  getDistrictLabel,
  getLocationAreaFieldLabel,
  getLocationAreaPlaceholder,
  getSearchCities,
} from "@/i18n/nav";
import { getDistrictsForCity } from "@/lib/locations/georgia";
import {
  getLocationAreaMode,
  MUNICIPALITY_ALL_AREAS,
} from "@/lib/locations/location-area";
import { getVillagesForMunicipality } from "@/lib/locations/municipality-villages";
import { composeLocationAddress } from "@/lib/location-match";

interface LocationFieldsProps {
  city: string;
  areaValue: string;
  onCityChange: (city: string) => void;
  onAreaChange: (area: string) => void;
  onAddressChange?: (address: string) => void;
  cityLabel?: string;
  className?: string;
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="mb-2 block text-xs font-semibold leading-snug text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export function LocationFields({
  city,
  areaValue,
  onCityChange,
  onAreaChange,
  onAddressChange,
  cityLabel,
  className = "",
}: LocationFieldsProps) {
  const t = useT();
  const { locale } = useLocale();
  const cities = getSearchCities(t);

  const areaMode = useMemo(
    () => (city ? getLocationAreaMode(city) : "hidden"),
    [city],
  );

  const districts = useMemo(
    () => (areaMode === "district-select" ? getDistrictsForCity(city) : []),
    [areaMode, city],
  );

  const villages = useMemo(
    () =>
      areaMode === "village-select" ? getVillagesForMunicipality(city) : [],
    [areaMode, city],
  );

  const showAreaField = areaMode !== "hidden";
  const areaLabel = getLocationAreaFieldLabel(t, areaMode);
  const areaPlaceholder = getLocationAreaPlaceholder(t, areaMode);

  function emitAddress(nextCity: string, nextArea: string) {
    onAddressChange?.(composeLocationAddress(t, locale, nextCity, nextArea));
  }

  function handleCityChange(nextCity: string) {
    onCityChange(nextCity);
    const nextMode = nextCity ? getLocationAreaMode(nextCity) : "hidden";
    const nextArea =
      nextMode === "village-select" ? MUNICIPALITY_ALL_AREAS : "";
    onAreaChange(nextArea);
    emitAddress(nextCity, nextArea);
  }

  function handleAreaChange(nextArea: string) {
    onAreaChange(nextArea);
    emitAddress(city, nextArea);
  }

  return (
    <div className={`grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      <Field label={cityLabel ?? t.hero.city}>
        <select
          className="kera-input"
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
        >
          <option value="">{t.hero.selectCity}</option>
          {cities.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      {showAreaField && areaMode === "district-select" && (
        <Field label={areaLabel}>
          <select
            className="kera-input"
            value={areaValue}
            onChange={(e) => handleAreaChange(e.target.value)}
          >
            <option value="">{areaPlaceholder}</option>
            {districts.map((id) => (
              <option key={id} value={id}>
                {getDistrictLabel(t, id)}
              </option>
            ))}
          </select>
        </Field>
      )}

      {showAreaField && areaMode === "village-select" && (
        <Field label={areaLabel}>
          <select
            className="kera-input"
            value={areaValue}
            onChange={(e) => handleAreaChange(e.target.value)}
          >
            <option value={MUNICIPALITY_ALL_AREAS}>{t.hero.allAreas}</option>
            {villages.map((village) => (
              <option key={village.id} value={village.id}>
                {locale === "ka" ? village.ka : village.en}
              </option>
            ))}
          </select>
        </Field>
      )}

      {showAreaField && areaMode === "district-text" && (
        <Field label={areaLabel}>
          <input
            type="text"
            className="kera-input"
            value={areaValue}
            onChange={(e) => handleAreaChange(e.target.value)}
            placeholder={areaPlaceholder}
          />
        </Field>
      )}
    </div>
  );
}

export function getDefaultAreaForCity(cityId: string): string {
  const mode = getLocationAreaMode(cityId);
  return mode === "village-select" ? MUNICIPALITY_ALL_AREAS : "";
}
