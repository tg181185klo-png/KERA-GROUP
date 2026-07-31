"use client";

import { MortgageCalculator } from "@/components/home/MortgageCalculator";
import { CurrencyWidget } from "@/components/layout/CurrencyWidget";
import { useT } from "@/i18n/LocaleProvider";

export function ToolsSection() {
  const t = useT();

  return (
    <section id="calculator" className="kera-section bg-kera-page">
      <div className="kera-container">
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8">
          <div
            id="currency"
            className="kera-card flex h-full min-h-0 scroll-mt-[calc(var(--header-height)+1rem)] flex-col p-6 sm:scroll-mt-[calc(var(--header-height-lg)+1rem)] sm:p-8"
          >
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold text-kera-slate sm:text-xl">
                {t.currency.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{t.currency.subtitle}</p>
            </div>
            <div className="flex-1">
              <CurrencyWidget />
            </div>
          </div>

          <MortgageCalculator />
        </div>
      </div>
    </section>
  );
}
