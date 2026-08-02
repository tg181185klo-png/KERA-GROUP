"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  ChartLine,
  Globe,
  HardHat,
  Home,
  Search,
} from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getServices, parseServiceHash, type ServiceKey } from "@/i18n/nav";
import { ServiceDetailModal } from "@/components/home/ServiceDetailModal";

const ICONS = {
  home: Home,
  search: Search,
  globe: Globe,
  crane: HardHat,
  chart: ChartLine,
  building: Building2,
} as const;

export function ServicesSection() {
  const t = useT();
  const services = getServices(t);
  const [activeKey, setActiveKey] = useState<ServiceKey | null>(null);

  const syncFromHash = useCallback(() => {
    const key = parseServiceHash(window.location.hash);
    setActiveKey(key);
    if (key) {
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  function openDetail(key: ServiceKey) {
    window.location.hash = `services-${key}`;
    setActiveKey(key);
  }

  function closeDetail() {
    setActiveKey(null);
    if (window.location.hash.startsWith("#services-")) {
      history.replaceState(null, "", window.location.pathname + "#services");
    }
  }

  return (
    <>
      <section id="services" className="kera-section bg-white">
        <div className="kera-container">
          <div className="mb-10 max-w-3xl">
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
                <button
                  key={key}
                  type="button"
                  onClick={() => openDetail(key)}
                  className="kera-card group flex flex-col p-5 text-left transition hover:border-kera-primary/30 hover:shadow-md sm:p-6"
                >
                  <div className="kera-icon-box mb-4 transition-colors group-hover:bg-kera-primary group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <h3 className="font-display text-sm font-bold leading-snug text-kera-slate sm:text-base">
                    {title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {desc}
                  </p>
                  <span className="mt-3 text-xs font-semibold text-kera-primary sm:text-sm">
                    {t.services.learnMore}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <ServiceDetailModal serviceKey={activeKey} onClose={closeDetail} />
    </>
  );
}
