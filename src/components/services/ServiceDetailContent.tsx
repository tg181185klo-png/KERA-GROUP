"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getServices, type ServiceKey } from "@/i18n/nav";

interface ServiceDetailContentProps {
  serviceKey: ServiceKey;
}

function PackageIncludes({ includes }: { includes: string | readonly string[] }) {
  if (Array.isArray(includes)) {
    return (
      <ul className="mt-1 list-disc space-y-1.5 pl-4">
        {includes.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return <span>{includes}</span>;
}

export function ServiceDetailContent({ serviceKey }: ServiceDetailContentProps) {
  const t = useT();
  const services = getServices(t);
  const service = services.find((s) => s.key === serviceKey);

  if (!service) return null;

  return (
    <section className="kera-section bg-white">
      <div className="kera-container max-w-4xl">
        <Link
          href="/#services"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-kera-primary transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.services.backToServices}
        </Link>

        <header className="mb-10">
          <p className="kera-eyebrow">{t.services.eyebrow}</p>
          <h1 className="kera-section-title mt-2">{service.title}</h1>
          {service.subtitle && (
            <p className="mt-2 text-base font-medium text-kera-primary">
              {service.subtitle}
            </p>
          )}
        </header>

        <div className="space-y-4">
          {service.intro.map((paragraph, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed text-slate-600 sm:text-base"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {service.features && service.features.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 font-display text-xl font-bold text-kera-slate">
              {t.services.whatIncludes}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {service.features.map((feature, i) => (
                <div key={i} className="kera-card flex flex-col p-5 sm:p-6">
                  <h3 className="font-display text-base font-bold leading-snug text-kera-slate">
                    {feature.title}
                  </h3>
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
          <div className="mt-12">
            <div className="grid gap-4 lg:grid-cols-1">
              {service.packages.map((pkg) => (
                <div
                  key={pkg.number}
                  className="kera-card border-kera-primary/20 p-5 sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-kera-primary-light text-sm font-bold text-kera-primary">
                      {pkg.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-bold leading-snug text-kera-slate sm:text-lg">
                        {pkg.title}
                      </h3>
                      {pkg.description && (
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                          {pkg.description}
                        </p>
                      )}
                      <div className="mt-4 text-sm leading-relaxed text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {t.services.includesLabel}:{" "}
                        </span>
                        <PackageIncludes includes={pkg.includes} />
                      </div>
                      <p className="mt-4 rounded-lg bg-kera-primary-light/60 px-3 py-2 text-sm text-slate-700">
                        <span className="block font-semibold text-kera-primary">
                          {t.services.pricingLabel}
                        </span>
                        {pkg.pricing}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
