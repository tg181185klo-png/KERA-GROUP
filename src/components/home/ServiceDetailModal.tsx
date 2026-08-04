"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import type { ServiceKey } from "@/i18n/nav";
import { getServices } from "@/i18n/nav";

interface ServiceDetailModalProps {
  serviceKey: ServiceKey | null;
  onClose: () => void;
}

export function ServiceDetailModal({
  serviceKey,
  onClose,
}: ServiceDetailModalProps) {
  const t = useT();
  const services = getServices(t);
  const service = services.find((s) => s.key === serviceKey);

  useEffect(() => {
    if (!serviceKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [serviceKey, onClose]);

  if (!service) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label={t.services.closeDetail}
        onClick={onClose}
      />
      <div className="relative max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div className="pr-8">
            <h3
              id="service-detail-title"
              className="font-display text-lg font-bold text-kera-slate sm:text-xl"
            >
              {service.title}
            </h3>
            {service.subtitle && (
              <p className="mt-1 text-sm text-kera-primary">{service.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label={t.services.closeDetail}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
          {service.intro.map((paragraph, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed text-slate-600 sm:text-base"
            >
              {paragraph}
            </p>
          ))}

          {service.features && service.features.length > 0 && (
            <div>
              <h4 className="mb-4 font-display text-base font-bold text-kera-slate">
                {t.services.whatIncludes}
              </h4>
              <div className="space-y-4">
                {service.features.map((feature, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <h5 className="font-display text-sm font-bold text-kera-slate sm:text-base">
                      {feature.title}
                    </h5>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
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
              <h4 className="mb-4 font-display text-base font-bold text-kera-slate">
                {t.services.choosePackage}
              </h4>
              <div className="space-y-4">
                {service.packages.map((pkg) => (
                  <div
                    key={pkg.number}
                    className="rounded-xl border border-kera-primary/15 bg-white p-4 shadow-sm"
                  >
                    <h5 className="font-display text-sm font-bold text-kera-slate sm:text-base">
                      {pkg.title}
                    </h5>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      <span className="font-semibold text-slate-700">
                        {t.services.includesLabel}:{" "}
                      </span>
                      {pkg.includes}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      <span className="font-semibold text-slate-700">
                        {t.services.pricingLabel}:{" "}
                      </span>
                      {pkg.pricing}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
