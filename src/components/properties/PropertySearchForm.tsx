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
  id,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  variant: FormVariant;
  id: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label
        htmlFor={id}
        className={
          variant === "hero"
            ? "mb-2 flex min-h-[2rem] items-end text-xs font-semibold leading-snug text-slate-500"
            : "mb-1 block text-xs font-semibold leading-tight text-slate-600"
        }
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const compactInput = "kera-input kera-input-compact";

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
  const submitLabel = t.hero.search;

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
      role="search"
      aria-label={t.hero.search}
      className={`kera-card shadow-lg ${
        isHero
          ? "-mt-6 space-y-5 p-5 sm:space-y-6 sm:p-6 lg:-mt-10 lg:p-7"
          : "space-y-2.5 p-3 sm:space-y-3 sm:p-4"
      } ${className}`}
    >
      <div
        className={`flex flex-wrap ${
          isHero ? "gap-2.5" : "gap-2 sm:gap-2.5"
        }`}
        role="group"
        aria-label={t.hero.search}
      >
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
            ? "hero-search-fields grid min-w-0 grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:flex lg:items-end lg:gap-5"
            : "flex w-full min-w-0 max-w-full flex-wrap items-end gap-2.5 lg:flex-nowrap lg:gap-2"
        }
      >
        <Field
          id="search-property-type"
          label={t.hero.propertyType}
          variant={variant}
          className={
            isHero
              ? "col-span-2 sm:col-span-1 lg:col-span-1"
              : "min-w-[calc(50%-0.3125rem)] flex-[1.2] sm:min-w-[9rem] lg:min-w-0"
          }
        >
          <select
            id="search-property-type"
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

        <Field
          id="search-city"
          label={t.hero.city}
          variant={variant}
          className={
            isHero
              ? "col-span-1"
              : "min-w-[calc(50%-0.3125rem)] flex-1 sm:min-w-[9rem] lg:min-w-0"
          }
        >
          <select
            id="search-city"
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
          <Field
            id="search-district"
            label={areaLabel}
            variant={variant}
            className={
              isHero ? "col-span-1" : "min-w-[calc(50%-0.3125rem)] flex-1 sm:min-w-[9rem] lg:min-w-0"
            }
          >
            <select
              id="search-district"
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
          <Field
            id="search-village"
            label={areaLabel}
            variant={variant}
            className={
              isHero ? "col-span-1" : "min-w-[calc(50%-0.3125rem)] flex-1 sm:min-w-[9rem] lg:min-w-0"
            }
          >
            <select
              id="search-village"
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
          <Field
            id="search-district-text"
            label={areaLabel}
            variant={variant}
            className={
              isHero ? "col-span-1" : "min-w-[calc(50%-0.3125rem)] flex-1 sm:min-w-[9rem] lg:min-w-0"
            }
          >
            <input
              id="search-district-text"
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
            id="search-land-status"
            label={t.hero.landStatus}
            variant={variant}
            className={
              isHero
                ? "col-span-2 sm:col-span-1"
                : "min-w-[calc(50%-0.3125rem)] flex-1 sm:min-w-[9rem] lg:min-w-0"
            }
          >
            <select
              id="search-land-status"
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

        <Field
          id="search-bedrooms"
          label={t.hero.bedrooms}
          variant={variant}
          className={
            isHero
              ? "col-span-1"
              : "min-w-[calc(50%-0.3125rem)] flex-[0.85] sm:min-w-[5.5rem] lg:min-w-0"
          }
        >
          <input
            id="search-bedrooms"
            name="bedrooms"
            type="number"
            min={0}
            placeholder="0+"
            defaultValue={initialParams.bedrooms ?? ""}
            className={inputClass}
          />
        </Field>

        <Field
          id="search-min-price"
          label={t.hero.minPrice}
          variant={variant}
          className={
            isHero
              ? "col-span-1"
              : "min-w-[calc(50%-0.3125rem)] flex-1 sm:min-w-[7rem] lg:min-w-0"
          }
        >
          <input
            id="search-min-price"
            name="min_price"
            type="number"
            min={0}
            placeholder="0"
            defaultValue={initialParams.min_price ?? ""}
            className={inputClass}
          />
        </Field>

        <Field
          id="search-max-price"
          label={t.hero.maxPrice}
          variant={variant}
          className={
            isHero
              ? "col-span-1"
              : "min-w-[calc(50%-0.3125rem)] flex-1 sm:min-w-[7rem] lg:min-w-0"
          }
        >
          <input
            id="search-max-price"
            name="max_price"
            type="number"
            min={0}
            placeholder="∞"
            defaultValue={initialParams.max_price ?? ""}
            className={inputClass}
          />
        </Field>

        {!isHero && (
          <div className="w-full shrink-0 sm:w-auto lg:ml-auto">
            <button
              type="submit"
              className="kera-btn w-full min-w-[5.25rem] px-3 py-1.5 text-xs font-bold shadow-sm sm:w-auto"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
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
