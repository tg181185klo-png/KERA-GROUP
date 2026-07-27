"use client";

import { PropertySubmitForm } from "@/components/submit/PropertySubmitForm";
import { useT } from "@/i18n/LocaleProvider";

export function SubmitPageContent() {
  const t = useT();

  return (
    <section className="kera-section bg-kera-page">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="kera-eyebrow">{t.submit.eyebrow}</p>
          <h1 className="kera-section-title mt-3">{t.submit.title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
            {t.submit.subtitle}
          </p>
        </div>

        <div className="kera-card p-6 sm:p-8">
          <PropertySubmitForm />
        </div>
      </div>
    </section>
  );
}
