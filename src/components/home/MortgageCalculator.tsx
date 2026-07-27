"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { calculateMortgage, formatPrice } from "@/lib/format";

const MAX_USD = 5_000_000;
const GEL_USD_RATE = 2.65;
const MAX_GEL = Math.round(MAX_USD * GEL_USD_RATE);

export function MortgageCalculator() {
  const t = useT();
  const [currency, setCurrency] = useState<"USD" | "GEL">("USD");
  const [amount, setAmount] = useState(150000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8);

  const maxAmount = currency === "USD" ? MAX_USD : MAX_GEL;
  const minAmount = currency === "USD" ? 10000 : 26500;
  const step = currency === "USD" ? 5000 : 13250;

  const result = useMemo(
    () => calculateMortgage(amount, years, rate),
    [amount, years, rate],
  );

  function handleCurrencyChange(next: "USD" | "GEL") {
    if (next === currency) return;
    setCurrency(next);
    setAmount((prev) =>
      next === "GEL"
        ? Math.min(Math.round(prev * GEL_USD_RATE), MAX_GEL)
        : Math.min(Math.round(prev / GEL_USD_RATE), MAX_USD),
    );
  }

  return (
    <div className="kera-card flex h-full flex-col p-6 sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="kera-icon-box shrink-0">
          <Calculator className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-kera-slate sm:text-xl">
            {t.mortgage.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t.mortgage.subtitle}</p>
        </div>
      </div>

      <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {(["USD", "GEL"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleCurrencyChange(c)}
            className={`min-w-[3.5rem] flex-1 rounded-lg px-4 py-1.5 text-center text-sm font-semibold transition-colors ${
              currency === c
                ? "bg-kera-primary text-white"
                : "bg-transparent text-slate-600 hover:text-kera-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 flex justify-between text-sm font-medium text-slate-700">
            <span>
              {t.mortgage.amount} ({currency})
            </span>
            <span className="font-bold text-kera-primary">
              {formatPrice(amount, currency)}
            </span>
          </label>
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            step={step}
            value={Math.min(amount, maxAmount)}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-kera-primary"
          />
        </div>

        <div>
          <label className="mb-2 flex justify-between text-sm font-medium text-slate-700">
            <span>{t.mortgage.years}</span>
            <span className="font-bold text-kera-primary">
              {years} {t.mortgage.yearsUnit}
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-kera-primary"
          />
        </div>

        <div>
          <label className="mb-2 flex justify-between text-sm font-medium text-slate-700">
            <span>{t.mortgage.annualRate}</span>
            <span className="font-bold text-kera-primary">{rate}%</span>
          </label>
          <input
            type="range"
            min={1}
            max={20}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-kera-tbc"
          />
        </div>
      </div>

      <div className="mt-auto rounded-2xl bg-kera-slate p-5 text-white sm:p-6">
        <p className="text-sm text-white/70">{t.mortgage.monthly}</p>
        <p className="font-display mt-1 text-3xl font-bold sm:text-4xl">
          {formatPrice(result.monthlyPayment, currency)}
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/70">
          <span>
            {t.mortgage.totalPayable}{" "}
            <strong className="text-white">
              {formatPrice(result.totalPayment, currency)}
            </strong>
          </span>
          <span>
            {t.mortgage.totalInterestLabel}{" "}
            <strong className="text-kera-primary">
              {formatPrice(result.totalInterest, currency)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
