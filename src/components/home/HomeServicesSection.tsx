"use client";

import { useT } from "@/i18n/LocaleProvider";
import { ServiceCardsGrid } from "@/components/services/ServiceCardsGrid";

export function HomeServicesSection() {
  const t = useT();

  return (
    <section id="services" className="kera-section bg-kera-page">
      <div className="kera-container">
        <h2 className="kera-section-title mb-6 sm:mb-8">
          {t.services.pageTitle}
        </h2>
        <ServiceCardsGrid />
      </div>
    </section>
  );
}
