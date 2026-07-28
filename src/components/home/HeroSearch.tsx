"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import {
  getCityLabel,
  getDealTypes,
  getDistrictLabel,
  getLandStatusOptions,
  getPropertyTypes,
  getSearchCities,
} from "@/i18n/nav";
import { getDistrictsForCity } from "@/lib/locations/georgia";

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
    <div className={`shrink-0 ${className}`}>
      <label className="mb-1 block truncate text-[11px] font-medium leading-tight text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export function HeroSearch() {
  const t = useT();
  const router = useRouter();
  const dealTypes = getDealTypes(t);
  const propertyTypes = getPropertyTypes(t);
  const cities = getSearchCities(t);
  const landStatuses = getLandStatusOptions(t);

  const [propertyType, setPropertyType] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const districts = useMemo(
    () => (city ? getDistrictsForCity(city) : []),
    [city],
  );
  const showDistrict = districts.length > 0;
  const showLandStatus = propertyType === "land";

  function handleCityChange(nextCity: string) {
    setCity(nextCity);
    setDistrict("");
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
      const districtLabel = district ? getDistrictLabel(t, district) : "";
      const location = districtLabel
        ? `${cityLabel}, ${districtLabel}`
        : cityLabel;
      params.set("location", location);
      params.set("city", city);
      if (district) params.set("district", district);
    }

    const query = params.toString();
    router.push(query ? `/?${query}#featured` : "/#featured");
  }

  return (
    <>
      <section className="relative h-[min(52vh,420px)] min-h-[280px] overflow-hidden sm:min-h-[340px] lg:min-h-[420px]">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          alt={t.hero.imageAlt}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-kera-slate/85 via-kera-slate/55 to-kera-slate/20" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
          <h1 className="font-display text-nowrap text-lg font-bold leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl xl:text-4xl">
            {t.hero.title}
          </h1>
          <p className="mt-3 text-nowrap text-xs leading-relaxed text-white/90 sm:text-sm lg:text-base">
            {t.hero.subtitle}
          </p>
        </div>
      </section>

      <section id="search" className="relative z-10 bg-kera-page pb-8 pt-0">
        <div className="kera-container">
          <form
            onSubmit={handleSubmit}
            className="kera-card -mt-6 overflow-hidden p-4 shadow-lg sm:p-5 lg:-mt-10"
          >
            <div className="flex items-end gap-2 overflow-x-auto pb-1">
              <div className="flex shrink-0 items-end gap-1.5 self-end pb-[1px]">
                {dealTypes.map(({ value, label }) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="deal_type"
                      value={value}
                      defaultChecked={value === "sale"}
                      className="peer sr-only"
                    />
                    <span className="inline-flex items-center justify-center text-nowrap rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 transition-colors peer-checked:border-kera-primary peer-checked:bg-kera-primary-light peer-checked:text-kera-primary sm:px-3">
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              <Field label={t.hero.propertyType} className="w-[7.5rem]">
                <select
                  name="property_type"
                  className="kera-input text-sm"
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

              <Field label={t.hero.city} className="w-[6.5rem]">
                <select
                  name="city"
                  className="kera-input text-sm"
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

              {showDistrict && (
                <Field label={t.hero.district} className="w-[7.5rem]">
                  <select
                    name="district"
                    className="kera-input text-sm"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    <option value="">{t.hero.selectDistrict}</option>
                    {districts.map((id) => (
                      <option key={id} value={id}>
                        {getDistrictLabel(t, id)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {showLandStatus && (
                <Field label={t.hero.landStatus} className="w-[8rem]">
                  <select
                    name="land_status"
                    className="kera-input text-sm"
                    defaultValue=""
                  >
                    {landStatuses.map(({ value, label }) => (
                      <option key={value || "any"} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label={t.hero.bedrooms} className="w-[4.5rem]">
                <input
                  name="bedrooms"
                  type="number"
                  min={0}
                  placeholder="0+"
                  className="kera-input text-sm"
                />
              </Field>

              <Field label={t.hero.minPrice} className="w-[5.5rem]">
                <input
                  name="min_price"
                  type="number"
                  min={0}
                  placeholder="0"
                  className="kera-input text-sm"
                />
              </Field>

              <Field label={t.hero.maxPrice} className="w-[5.5rem]">
                <input
                  name="max_price"
                  type="number"
                  min={0}
                  placeholder="∞"
                  className="kera-input text-sm"
                />
              </Field>

              <button
                type="submit"
                className="kera-btn flex shrink-0 items-center justify-center gap-1.5 self-end px-4 py-2 text-sm"
              >
                <Search className="h-4 w-4" />
                {t.hero.search}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
