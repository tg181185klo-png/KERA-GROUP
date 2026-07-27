"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getDealTypes, getPropertyTypes } from "@/i18n/nav";

export function HeroSearch() {
  const t = useT();
  const router = useRouter();
  const dealTypes = getDealTypes(t);
  const propertyTypes = getPropertyTypes(t);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of form.entries()) {
      if (value && String(value).trim()) {
        params.set(key, String(value));
      }
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
          <p className="kera-eyebrow mb-2 sm:tracking-[0.25em]">{t.hero.eyebrow}</p>
          <h1 className="font-display max-w-3xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            {t.hero.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
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
                    defaultChecked={value === "buy"}
                    className="peer sr-only"
                  />
                  <span className="inline-block rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors peer-checked:border-kera-primary peer-checked:bg-kera-primary-light peer-checked:text-kera-primary">
                    {label}
                  </span>
                </label>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  {t.hero.propertyType}
                </label>
                <select name="property_type" className="kera-input">
                  <option value="">{t.hero.propertyType}</option>
                  {propertyTypes.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  {t.hero.location}
                </label>
                <input
                  name="location"
                  type="text"
                  placeholder={t.hero.locationPlaceholder}
                  className="kera-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  {t.hero.bedrooms}
                </label>
                <input
                  name="bedrooms"
                  type="number"
                  min={0}
                  placeholder="0+"
                  className="kera-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  {t.hero.minPrice}
                </label>
                <input
                  name="min_price"
                  type="number"
                  min={0}
                  placeholder="0"
                  className="kera-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  {t.hero.maxPrice}
                </label>
                <input
                  name="max_price"
                  type="number"
                  min={0}
                  placeholder="∞"
                  className="kera-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="kera-btn mt-5 flex w-full items-center justify-center gap-2 py-3 sm:w-auto sm:px-8"
            >
              <Search className="h-4 w-4" />
              {t.hero.search}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
