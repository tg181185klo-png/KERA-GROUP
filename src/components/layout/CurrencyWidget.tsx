"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/LocaleProvider";
import { FALLBACK_NBG_RATES, type NbgRate } from "@/lib/nbg-rates";

async function loadRates(): Promise<NbgRate[]> {
  try {
    const res = await fetch("/api/currency/rates");
    if (!res.ok) return FALLBACK_NBG_RATES;

    const data = (await res.json()) as { rates?: NbgRate[] };
    return data.rates?.length ? data.rates : FALLBACK_NBG_RATES;
  } catch {
    return FALLBACK_NBG_RATES;
  }
}

function RatePill({
  code,
  rate,
  compact,
}: {
  code: string;
  rate: number;
  compact?: boolean;
}) {
  const decimals = compact ? 2 : 4;

  return (
    <span className="flex min-w-0 items-center gap-0.5">
      <span className="shrink-0 font-bold text-kera-primary">{code}</span>
      <span className="truncate font-semibold tabular-nums text-slate-600">
        {rate.toFixed(decimals)} ₾
      </span>
    </span>
  );
}

export function CurrencyWidget({
  compact = false,
  variant = compact ? "compact" : "default",
}: {
  compact?: boolean;
  variant?: "default" | "compact" | "header";
}) {
  const t = useT();
  const [rates, setRates] = useState<NbgRate[]>(FALLBACK_NBG_RATES);

  useEffect(() => {
    void loadRates().then(setRates);
  }, []);

  if (variant === "header") {
    return (
      <div
        className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200/90 bg-slate-50/90 px-1.5 py-1 sm:gap-1.5 sm:px-2 sm:py-1.5 lg:px-2.5"
        title={t.currency.nbgTitle}
        aria-label={t.currency.nbgTitle}
      >
        {rates.map(({ code, rate }, index) => (
          <div key={code} className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5">
            {index > 0 && (
              <span className="h-3 w-px shrink-0 bg-slate-300/80" aria-hidden />
            )}
            <span className="text-[11px] sm:text-xs">
              <RatePill code={code} rate={rate} compact />
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "compact" || compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {rates.map(({ code, rate }) => (
          <div
            key={code}
            className="flex min-w-0 items-center gap-1.5 rounded-lg bg-kera-page px-2.5 py-1"
          >
            <RatePill code={code} rate={rate} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-kera-page text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2.5 font-semibold">{t.currency.currencyCol}</th>
            <th className="px-4 py-2.5 font-semibold">{t.currency.rateCol}</th>
          </tr>
        </thead>
        <tbody>
          {rates.map(({ code, rate }) => (
            <tr key={code} className="border-t border-slate-50">
              <td className="px-4 py-3 font-bold text-kera-primary">{code}</td>
              <td className="px-4 py-3 font-semibold text-kera-slate">
                {rate.toFixed(4)} ₾
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CurrencySection() {
  const t = useT();

  return (
    <section id="currency" className="bg-kera-page py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="kera-section-title">{t.currency.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.currency.subtitle}</p>
          </div>
        </div>
        <div className="kera-card max-w-md p-1">
          <CurrencyWidget />
        </div>
      </div>
    </section>
  );
}
