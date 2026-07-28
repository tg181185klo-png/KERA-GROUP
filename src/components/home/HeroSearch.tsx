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
import {
  getDistrictsForCity,
} from "@/lib/locations/georgia";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex min-h-[2rem] items-end text-xs font-medium leading-tight text-slate-500">
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
            className="kera-card -mt-6 p-4 shadow-lg sm:p-6 lg:-mt-10"
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {dealTypes.map(({ value, label }) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="deal_type"
                    value={value}
                    defaultChecked={value === "sale"}
                    className="peer sr-only"
                  />
                  <span className="inline-flex min-w-[5.5rem] items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors peer-checked:border-kera-primary peer-checked:bg-kera-primary-light peer-checked:text-kera-primary">
                    {label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Field label={t.hero.propertyType}>
                  <select
                    name="property_type"
                    className="kera-input"
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

                <Field label={t.hero.city}>
                  <select
                    name="city"
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

                {showDistrict && (
                  <Field label={t.hero.district}>
                    <select
                      name="district"
                      className="kera-input"
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
                  <Field label={t.hero.landStatus}>
                    <select name="land_status" className="kera-input" defaultValue="">
                      {landStatuses.map(({ value, label }) => (
                        <option key={value || "any"} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                <Field label={t.hero.bedrooms}>
                  <input
                    name="bedrooms"
                    type="number"
                    min={0}
                    placeholder="0+"
                    className="kera-input"
                  />
                </Field>

                <Field label={t.hero.minPrice}>
                  <input
                    name="min_price"
                    type="number"
                    min={0}
                    placeholder="0"
                    className="kera-input"
                  />
                </Field>

                <Field label={t.hero.maxPrice}>
                  <input
                    name="max_price"
                    type="number"
                    min={0}
                    placeholder="∞"
                    className="kera-input"
                  />
                </Field>
              </div>

              <button
                type="submit"
                className="kera-btn flex w-full shrink-0 items-center justify-center gap-2 px-6 py-2.5 lg:min-w-[7.5rem] lg:w-auto"
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
