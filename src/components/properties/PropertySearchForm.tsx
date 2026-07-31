"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLocale, useT } from "@/i18n/LocaleProvider";
import {
  getAreaDisplayLabel,
  getCityLabel,
  getDealTypes,
  getDistrictLabel,
  getLandStatusOptions,
  getLocationAreaFieldLabel,
  getLocationAreaPlaceholder,
  getPropertyTypes,
  getSearchCities,
} from "@/i18n/nav";
import { getDistrictsForCity } from "@/lib/locations/georgia";
import {
  getLocationAreaMode,
  isMunicipalityAllAreas,
  MUNICIPALITY_ALL_AREAS,
} from "@/lib/locations/location-area";
import { getVillagesForMunicipality } from "@/lib/locations/municipality-villages";
import type { PropertySearchParams } from "@/lib/types/property";
import { getDefaultAreaForCity } from "@/components/shared/LocationFields";

type FormVariant = "hero" | "compact";

function Field({
  label,
  children,
  className = "",
  variant,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  variant: FormVariant;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label
        className={
          variant === "hero"
            ? "mb-2 flex min-h-[2rem] items-end text-xs font-semibold leading-snug text-slate-500"
            : "mb-0.5 block text-[10px] font-semibold leading-tight text-slate-500 sm:text-xs"
        }
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const compactInput = "kera-input !py-1.5 !px-3 !text-xs sm:!text-sm";

interface PropertySearchFormProps {
  initialParams?: PropertySearchParams;
  className?: string;
  variant?: FormVariant;
}

export function PropertySearchForm({
  initialParams = {},
  className = "",
  variant = "compact",
}: PropertySearchFormProps) {
  const t = useT();
  const { locale } = useLocale();
  const router = useRouter();
  const dealTypes = getDealTypes(t);
  const propertyTypes = getPropertyTypes(t);
  const cities = getSearchCities(t);
  const landStatuses = getLandStatusOptions(t);
  const isHero = variant === "hero";
  const inputClass = isHero ? "kera-input" : compactInput;

  const [propertyType, setPropertyType] = useState(
    initialParams.property_type ?? "",
  );
  const [city, setCity] = useState(initialParams.city ?? "");
  const [areaValue, setAreaValue] = useState(() => {
    if (initialParams.village) return initialParams.village;
    if (initialParams.district) return initialParams.district;
    if (initialParams.city) return getDefaultAreaForCity(initialParams.city);
    return "";
  });

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
  const showLandStatus = propertyType === "land";
  const areaLabel = getLocationAreaFieldLabel(t, areaMode);
  const areaPlaceholder = getLocationAreaPlaceholder(t, areaMode);
  const defaultDealType = initialParams.deal_type ?? "sale";
  const submitLabel = isHero ? t.hero.search : t.properties.searchSubmit;

  function handleCityChange(nextCity: string) {
    setCity(nextCity);
    const nextMode = nextCity ? getLocationAreaMode(nextCity) : "hidden";
    setAreaValue(nextMode === "village-select" ? MUNICIPALITY_ALL_AREAS : "");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of form.entries()) {
      if (value && String(value).trim()) {
        params.set(key, String(value));
      }
    }

    if (city) {
      const cityLabel = getCityLabel(t, city);
      const areaLabelText = getAreaDisplayLabel(
        t,
        locale,
        city,
        areaValue,
        areaMode,
      );
      const location = areaLabelText
        ? `${cityLabel}, ${areaLabelText}`
        : cityLabel;
      params.set("location", location);
      params.set("city", city);
      params.delete("village");
      params.delete("district");
      if (areaValue && !isMunicipalityAllAreas(areaValue)) {
        if (areaMode === "village-select") {
          params.set("village", areaValue);
        } else {
          params.set("district", areaValue);
        }
      }
    }

    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`kera-card shadow-lg ${
        isHero
          ? "-mt-6 space-y-5 p-5 sm:space-y-6 sm:p-6 lg:-mt-10 lg:p-7"
          : "space-y-2.5 p-3 sm:space-y-3 sm:p-4"
      } ${className}`}
    >
      <div className={`flex flex-wrap ${isHero ? "gap-2.5" : "gap-1.5"}`}>
        {dealTypes.map(({ value, label }) => (
          <label key={value} className="cursor-pointer">
            <input
              type="radio"
              name="deal_type"
              value={value}
              defaultChecked={value === defaultDealType}
              className="peer sr-only"
            />
            <span
              className={
                isHero
                  ? "inline-flex min-w-[5.5rem] items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all peer-checked:border-kera-primary peer-checked:bg-kera-primary-light peer-checked:text-kera-primary peer-checked:shadow-sm sm:min-w-[6.5rem] sm:px-5"
                  : "inline-flex min-w-[4.75rem] items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all peer-checked:border-kera-primary peer-checked:bg-kera-primary-light peer-checked:text-kera-primary peer-checked:shadow-sm sm:min-w-[5.5rem] sm:px-3.5"
              }
            >
              {label}
            </span>
          </label>
        ))}
      </div>

      <div
        className={
          isHero
            ? "grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:flex lg:items-end lg:gap-5"
            : "grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-end lg:gap-3"
        }
      >
        <Field
          label={t.hero.propertyType}
          variant={variant}
          className="col-span-2 sm:col-span-1 lg:min-w-0 lg:flex-[1.35]"
        >
          <select
            name="property_type"
            className={inputClass}
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <option value="">{t.hero.propertyType}</option>
            {propertyTypes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.hero.city} variant={variant} className="lg:min-w-0 lg:flex-1">
          <select
            name="city"
            className={inputClass}
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
          <Field label={areaLabel} variant={variant} className="lg:min-w-0 lg:flex-[1.2]">
            <select
              name="district"
              className={inputClass}
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
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
          <Field label={areaLabel} variant={variant} className="lg:min-w-0 lg:flex-[1.2]">
            <select
              name="village"
              className={inputClass}
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
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
          <Field label={areaLabel} variant={variant} className="lg:min-w-0 lg:flex-[1.2]">
            <input
              name="district"
              type="text"
              className={inputClass}
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
              placeholder={areaPlaceholder}
            />
          </Field>
        )}

        {showLandStatus && (
          <Field
            label={t.hero.landStatus}
            variant={variant}
            className="col-span-2 sm:col-span-1 lg:min-w-0 lg:flex-[1.25]"
          >
            <select
              name="land_status"
              className={inputClass}
              defaultValue={initialParams.land_status ?? ""}
            >
              {landStatuses.map(({ value, label }) => (
                <option key={value || "any"} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label={t.hero.bedrooms} variant={variant} className="lg:min-w-0 lg:flex-[0.75]">
          <input
            name="bedrooms"
            type="number"
            min={0}
            placeholder="0+"
            defaultValue={initialParams.bedrooms ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label={t.hero.minPrice} variant={variant} className="lg:min-w-0 lg:flex-1">
          <input
            name="min_price"
            type="number"
            min={0}
            placeholder="0"
            defaultValue={initialParams.min_price ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label={t.hero.maxPrice} variant={variant} className="lg:min-w-0 lg:flex-1">
          <input
            name="max_price"
            type="number"
            min={0}
            placeholder="∞"
            defaultValue={initialParams.max_price ?? ""}
            className={inputClass}
          />
        </Field>

        {!isHero && (
          <div className="col-span-2 flex items-end sm:col-span-3 lg:col-span-auto lg:ml-auto lg:flex-shrink-0">
            <button
              type="submit"
              className="kera-btn w-full min-w-0 px-5 py-2 text-xs font-bold shadow-sm sm:min-w-[9.5rem] sm:text-sm"
            >
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {submitLabel}
            </button>
          </div>
        )}
      </div>

      {isHero && (
        <div className="flex justify-stretch border-t border-slate-100 pt-5 sm:justify-end">
          <button
            type="submit"
            className="kera-btn w-full min-w-0 px-8 py-3 text-sm font-bold shadow-sm sm:w-auto sm:min-w-[11rem] sm:text-base"
          >
            <Search className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
