"use client";

import { useEffect, useState } from "react";

interface Rate {
  code: string;
  rate: number;
}

const FALLBACK_RATES: Rate[] = [
  { code: "USD", rate: 2.65 },
  { code: "EUR", rate: 2.88 },
  { code: "GBP", rate: 3.35 },
];

async function fetchNbgRates(): Promise<Rate[]> {
  try {
    const res = await fetch(
      "https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json"
    );
    if (!res.ok) return FALLBACK_RATES;

    const data = await res.json();
    const currencies = data?.[0]?.currencies ?? [];
    const codes = ["USD", "EUR", "GBP"];

    const rates = codes
      .map((code) => {
        const item = currencies.find(
          (c: { code: string; rate: number }) => c.code === code
        );
        return item ? { code, rate: item.rate } : null;
      })
      .filter(Boolean) as Rate[];

    return rates.length > 0 ? rates : FALLBACK_RATES;
  } catch {
    return FALLBACK_RATES;
  }
}

export function CurrencyWidget({
  compact = false,
  variant = compact ? "compact" : "default",
}: {
  compact?: boolean;
  variant?: "default" | "compact" | "header";
}) {
  const [rates, setRates] = useState<Rate[]>(FALLBACK_RATES);

  useEffect(() => {
    fetchNbgRates().then(setRates);
  }, []);

  if (variant === "header") {
    return (
      <div
        className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-slate-50/90 px-3 py-1.5"
        title="NBG ოფიციალური კურსი"
      >
        {rates.map(({ code, rate }, index) => (
          <div key={code} className="flex items-center gap-2.5">
            {index > 0 && (
              <span className="h-3 w-px bg-slate-300/80" aria-hidden />
            )}
            <span className="flex items-baseline gap-1 text-xs">
              <span className="font-bold text-kera-primary">{code}</span>
              <span className="font-semibold tabular-nums text-slate-600">
                {rate.toFixed(2)} ₾
              </span>
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
            className="flex items-center gap-1.5 rounded-lg bg-kera-page px-2.5 py-1"
          >
            <span className="text-xs font-bold text-kera-primary">{code}</span>
            <span className="text-xs font-semibold text-kera-slate">
              {rate.toFixed(4)} ₾
            </span>
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
            <th className="px-4 py-2.5 font-semibold">ვალუტა</th>
            <th className="px-4 py-2.5 font-semibold">NBG კურსი</th>
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
  return (
    <section id="currency" className="bg-kera-page py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="kera-section-title">ვალუტის კურსები</h2>
            <p className="mt-2 text-sm text-slate-600">
              საქართველოს ეროვნული ბანკის ოფიციალური კურსი
            </p>
          </div>
        </div>
        <div className="kera-card max-w-md p-1">
          <CurrencyWidget />
        </div>
      </div>
    </section>
  );
}
