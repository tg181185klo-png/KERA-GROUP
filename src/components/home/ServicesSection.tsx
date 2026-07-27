"use client";

import {
  Building2,
  Camera,
  ChartLine,
  HardHat,
  KeyRound,
} from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getServices } from "@/i18n/nav";

const ICONS = {
  building: Building2,
  crane: HardHat,
  chart: ChartLine,
  key: KeyRound,
  camera: Camera,
} as const;

export function ServicesSection() {
  const t = useT();
  const services = getServices(t);

  return (
    <section id="services" className="kera-section bg-white">
      <div className="kera-container">
        <div className="mb-10 max-w-2xl">
          <p className="kera-eyebrow">{t.services.eyebrow}</p>
          <h2 className="kera-section-title mt-2">{t.services.title}</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
            {t.services.subtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {services.map(({ key, title, desc, icon }) => {
            const Icon = ICONS[icon];
            return (
              <article
                key={key}
                className="kera-card group flex flex-col p-5 sm:p-6"
              >
                <div className="kera-icon-box mb-4 transition-colors group-hover:bg-kera-primary group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <h3 className="font-display text-base font-bold text-kera-slate">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {desc}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
