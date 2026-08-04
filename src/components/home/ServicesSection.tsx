"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Camera,
  Globe,
  Handshake,
  HardHat,
} from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getServiceCards } from "@/i18n/nav";

const ICONS = {
  globe: Globe,
  crane: HardHat,
  building: Building2,
  camera: Camera,
  handshake: Handshake,
} as const;

export function ServicesSection() {
  const t = useT();
  const services = getServiceCards(t);

  return (
    <section id="services" className="kera-section bg-white">
      <div className="kera-container">
        <div className="mb-12 max-w-3xl">
          <p className="kera-eyebrow">{t.services.eyebrow}</p>
          <h2 className="kera-section-title mt-2">{t.services.pageTitle}</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            {t.services.pageSubtitle}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {services.map((service) => {
            const Icon = ICONS[service.icon];
            return (
              <article
                key={service.key}
                className="kera-card flex flex-col p-6 sm:p-8"
              >
                <div className="kera-icon-box mb-5 w-fit">
                  <Icon className="h-6 w-6" strokeWidth={2.25} />
                </div>
                <h3 className="font-display text-lg font-bold leading-snug text-kera-slate sm:text-xl">
                  {service.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 sm:text-base">
                  {service.shortDesc}
                </p>
                <Link
                  href={service.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-kera-primary transition hover:underline"
                >
                  {t.services.learnMore}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
