"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { DEAL_TYPES, PROPERTY_TYPES } from "@/lib/constants";

export function HeroSearch() {
  const router = useRouter();

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
      <section className="relative h-[320px] overflow-hidden sm:h-[380px] lg:h-[420px]">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          alt="Premium Real Estate"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-kera-slate/80 via-kera-slate/50 to-transparent" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-kera-primary sm:text-sm">
            Premium Real Estate Ecosystem
          </p>
          <h1 className="font-display max-w-3xl text-lg font-bold leading-snug tracking-tight text-white sm:text-xl lg:text-2xl">
            კერა ჯგუფი — უძრავი ქონების სრული სერვისი
          </h1>
          <p className="mt-3 max-w-lg text-xs leading-relaxed text-white/85 sm:text-sm sm:leading-relaxed">
            Real Estate · Development · Investment · Property Management ·
            Media — ერთი პრემიუმ პლატფორმა.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/signup"
              className="inline-flex items-center rounded-xl bg-kera-amber px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-600"
            >
              რეგისტრაცია
            </a>
            <a
              href="/login"
              className="inline-flex items-center rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              შესვლა
            </a>
          </div>
        </div>
      </section>

      <section id="search" className="bg-kera-page pb-6 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={handleSubmit}
            className="kera-card -mt-2 p-4 shadow-md sm:p-6 lg:-mt-8"
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {DEAL_TYPES.map(({ value, label }) => (
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
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  ქონების ტიპი
                </label>
                <select
                  name="property_type"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-kera-primary focus:ring-2 focus:ring-kera-primary/20"
                >
                  {PROPERTY_TYPES.map(({ value, label }) => (
                    <option key={value || "all"} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  ლოკაცია
                </label>
                <input
                  name="location"
                  type="text"
                  placeholder="მაგ: ვაკე, ბათუმი..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-kera-primary focus:ring-2 focus:ring-kera-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  ოთახების რაოდენობა
                </label>
                <input
                  name="bedrooms"
                  type="number"
                  min={0}
                  placeholder="0+"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-kera-primary focus:ring-2 focus:ring-kera-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  მინ. ფასი
                </label>
                <input
                  name="min_price"
                  type="number"
                  min={0}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-kera-primary focus:ring-2 focus:ring-kera-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  მაქს. ფასი
                </label>
                <input
                  name="max_price"
                  type="number"
                  min={0}
                  placeholder="∞"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-kera-primary focus:ring-2 focus:ring-kera-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="kera-btn mt-4 flex w-full items-center justify-center gap-2 py-3 sm:w-auto sm:px-8"
            >
              <Search className="h-4 w-4" />
              ძებნა
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
