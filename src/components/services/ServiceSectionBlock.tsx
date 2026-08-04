"use client";

import { useT } from "@/i18n/LocaleProvider";
import type { ServiceKey } from "@/i18n/nav";

type ServicePackage = {
  number: string;
  title: string;
  description?: string;
  includes: string | readonly string[];
  pricing: string;
};

type ServiceData = {
  key: ServiceKey;
  title: string;
  subtitle: string;
  intro: readonly string[];
  features?: readonly {
    title: string;
    bullets: readonly string[];
  }[];
  packages?: readonly ServicePackage[];
};

interface ServiceSectionBlockProps {
  service: ServiceData;
  packageAnchors?: Record<string, string>;
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

export function ServiceSectionBlock({
  service,
  packageAnchors,
}: ServiceSectionBlockProps) {
  const t = useT();

  const showPackageHeading =
    service.packages &&
    service.packages.length > 0 &&
    service.key !== "propertyListing";

  return (
    <article id={service.key} className="scroll-mt-28">
      <header className="mb-6 border-b border-slate-100 pb-6">
        <h2 className="font-display text-xl font-bold text-kera-slate sm:text-2xl">
          {service.title}
        </h2>
        {service.subtitle && (
          <p className="mt-1 text-base font-medium text-kera-primary">
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
        <div className="mt-10">
          <h3 className="mb-5 font-display text-lg font-bold text-kera-slate">
            {t.services.whatIncludes}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {service.features.map((feature, i) => (
              <div key={i} className="kera-card flex flex-col p-5 sm:p-6">
                <h4 className="font-display text-base font-bold leading-snug text-kera-slate">
                  {feature.title}
                </h4>
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
        <div className="mt-10">
          {showPackageHeading && (
            <h3 className="mb-5 font-display text-lg font-bold text-kera-slate">
              {t.services.choosePackage}
            </h3>
          )}
          <div className="grid gap-4">
            {service.packages.map((pkg) => {
              const anchorId = packageAnchors?.[pkg.number];
              return (
                <div
                  key={pkg.number}
                  id={anchorId}
                  className="scroll-mt-28 kera-card border-kera-primary/20 p-5 sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-kera-primary-light text-sm font-bold text-kera-primary">
                      {pkg.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-base font-bold leading-snug text-kera-slate sm:text-lg">
                        {pkg.title}
                      </h4>
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
                      {pkg.pricing && (
                        <p className="mt-4 rounded-lg bg-kera-primary-light/60 px-3 py-2 text-sm text-slate-700">
                          <span className="block font-semibold text-kera-primary">
                            {t.services.pricingLabel}
                          </span>
                          {pkg.pricing}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
