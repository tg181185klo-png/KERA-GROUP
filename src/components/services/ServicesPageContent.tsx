"use client";

import { useCallback, useEffect } from "react";
import { useT } from "@/i18n/LocaleProvider";
import { getServices, type ServiceCardKey } from "@/i18n/nav";
import { ServiceSectionBlock } from "@/components/services/ServiceSectionBlock";
import { ServiceCardsGrid } from "@/components/services/ServiceCardsGrid";

function parseServiceHash(hash: string): ServiceCardKey | null {
  const key = hash.replace(/^#/, "");
  const valid: ServiceCardKey[] = [
    "emigrantPurchase",
    "developerServices",
    "propertyListing",
    "propertyMediaListing",
    "propertyFullSupport",
  ];
  return valid.includes(key as ServiceCardKey) ? (key as ServiceCardKey) : null;
}

export function ServicesPageContent() {
  const t = useT();
  const sections = getServices(t);

  const scrollToHash = useCallback((hash: string) => {
    const key = parseServiceHash(hash);
    if (!key) return;
    document.getElementById(key)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToHash(window.location.hash);
    const onHash = () => scrollToHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [scrollToHash]);

  return (
    <section className="bg-kera-page pb-12 pt-2 sm:pb-16 sm:pt-3">
      <div className="kera-container">
        <h1 className="kera-section-title mb-6 sm:mb-8">{t.services.pageTitle}</h1>

        <div className="mb-10">
          <ServiceCardsGrid />
        </div>

        <div className="space-y-16 lg:space-y-20">
          {sections.map((service) => (
            <ServiceSectionBlock
              key={service.key}
              service={service}
              packageAnchors={
                service.key === "propertyListing"
                  ? {
                      "2": "propertyMediaListing",
                      "3": "propertyFullSupport",
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
