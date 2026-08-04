"use client";

import { useCallback, useEffect } from "react";
import {
  Building2,
  Camera,
  Globe,
  Handshake,
  HardHat,
} from "lucide-react";
import Link from "next/link";
import { useT } from "@/i18n/LocaleProvider";
import { getServiceCards, getServices, type ServiceCardKey } from "@/i18n/nav";
import { ServiceSectionBlock } from "@/components/services/ServiceSectionBlock";

const ICONS = {
  globe: Globe,
  crane: HardHat,
  building: Building2,
  camera: Camera,
  handshake: Handshake,
} as const;

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
  const cards = getServiceCards(t);
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

        <div className="mb-10 grid grid-cols-5 gap-3 max-lg:overflow-x-auto max-lg:pb-2 lg:gap-4">
          {cards.map((card) => {
            const Icon = ICONS[card.icon];
            return (
              <Link
                key={card.key}
                href={card.href}
                className="kera-card flex min-w-[9.5rem] flex-col p-3 transition hover:border-kera-primary/30 hover:shadow-md sm:min-w-[11rem] sm:p-4 lg:min-w-0"
              >
                <div className="kera-icon-box mb-3 h-9 w-9 [&_svg]:h-4 [&_svg]:w-4">
                  <Icon strokeWidth={2.25} />
                </div>
                <h2 className="line-clamp-3 font-display text-xs font-bold leading-snug text-kera-slate sm:text-sm">
                  {card.title}
                </h2>
                <p className="mt-2 line-clamp-4 flex-1 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                  {card.cardDesc}
                </p>
              </Link>
            );
          })}
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
