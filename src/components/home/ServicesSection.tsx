"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Globe } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getServices, parseServiceHash, type ServiceKey } from "@/i18n/nav";
import { ServiceDetailModal } from "@/components/home/ServiceDetailModal";

const ICONS = {
  globe: Globe,
  building: Building2,
} as const;

export function ServicesSection() {
  const t = useT();
  const services = getServices(t);
  const [activeKey, setActiveKey] = useState<ServiceKey | null>(null);

  const syncFromHash = useCallback(() => {
    const key = parseServiceHash(window.location.hash);
    setActiveKey(key);
    const anchor = key ? `services-${key}` : null;
    if (anchor) {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
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
          <div className="mb-12 max-w-3xl">
            <p className="kera-eyebrow">{t.services.eyebrow}</p>
            <h2 className="kera-section-title mt-2">{t.services.pageTitle}</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              {t.services.pageSubtitle}
            </p>
          </div>

          <div className="space-y-16 lg:space-y-20">
            {services.map((service) => {
              const Icon = ICONS[service.icon];
              return (
                <article
                  key={service.key}
                  id={`services-${service.key}`}
                  className="scroll-mt-28"
                >
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                    <div className="kera-icon-box shrink-0">
                      <Icon className="h-6 w-6" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl font-bold text-kera-slate sm:text-2xl">
                        {service.title}
                      </h3>
                      {service.subtitle && (
                        <p className="mt-1 text-base font-medium text-kera-primary">
                          {service.subtitle}
                        </p>
                      )}
                      <div className="mt-4 space-y-3">
                        {service.intro.map((paragraph, i) => (
                          <p
                            key={i}
                            className="text-sm leading-relaxed text-slate-600 sm:text-base"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => openDetail(service.key)}
                        className="mt-4 text-sm font-semibold text-kera-primary transition hover:underline sm:hidden"
                      >
                        {t.services.learnMore}
                      </button>
                    </div>
                  </div>

                  {service.features && service.features.length > 0 && (
                    <div>
                      <h4 className="mb-5 font-display text-lg font-bold text-kera-slate">
                        {t.services.whatIncludes}
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {service.features.map((feature, i) => (
                          <div
                            key={i}
                            className="kera-card flex flex-col p-5 sm:p-6"
                          >
                            <h5 className="font-display text-base font-bold leading-snug text-kera-slate">
                              {feature.title}
                            </h5>
                            <ul className="mt-3 flex-1 list-disc space-y-2 pl-4 text-sm leading-relaxed text-slate-600">
                              {feature.bullets.map((bullet, j) => (
                                <li key={j}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {service.packages && service.packages.length > 0 && (
                    <div>
                      <h4 className="mb-5 font-display text-lg font-bold text-kera-slate">
                        {t.services.choosePackage}
                      </h4>
                      <div className="grid gap-4 lg:grid-cols-3">
                        {service.packages.map((pkg) => (
                          <div
                            key={pkg.number}
                            className="kera-card flex flex-col border-kera-primary/20 p-5 sm:p-6"
                          >
                            <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-kera-primary-light text-sm font-bold text-kera-primary">
                              {pkg.number}
                            </span>
                            <h5 className="font-display text-base font-bold leading-snug text-kera-slate">
                              {pkg.title}
                            </h5>
                            <div className="mt-4 flex-1 space-y-3 text-sm leading-relaxed text-slate-600">
                              <p>
                                <span className="block font-semibold text-slate-800">
                                  {t.services.includesLabel}
                                </span>
                                {pkg.includes}
                              </p>
                              <p className="rounded-lg bg-kera-primary-light/60 px-3 py-2 text-slate-700">
                                <span className="block font-semibold text-kera-primary">
                                  {t.services.pricingLabel}
                                </span>
                                {pkg.pricing}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ServiceDetailModal serviceKey={activeKey} onClose={closeDetail} />
    </>
  );
}
