"use client";

import Image from "next/image";
import { useT } from "@/i18n/LocaleProvider";

export function HeroSearch() {
  const t = useT();

  return (
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
        <h1 className="font-display text-lg font-bold leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl xl:text-4xl">
          {t.hero.title}
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-white/90 sm:text-sm lg:text-base">
          {t.hero.subtitle}
        </p>
      </div>
    </section>
  );
}
