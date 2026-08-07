"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { calculateMortgage, formatPrice } from "@/lib/format";

const MAX_USD = 5_000_000;
const GEL_USD_RATE = 2.65;
const MAX_GEL = Math.round(MAX_USD * GEL_USD_RATE);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
};

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: SliderFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const displayValue = draft ?? String(value);

  function commitDraft(raw: string) {
    const parsed = Number(raw.replace(",", "."));
    if (!Number.isFinite(parsed)) {
      setDraft(null);
      return;
    }
    onChange(clamp(parsed, min, max));
    setDraft(null);
  }

  return (
    <div>
      <label className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>{label}</span>
        <div className="flex shrink-0 items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={displayValue}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={(event) => commitDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
            className="w-[5.75rem] border-0 bg-transparent px-2.5 py-1.5 text-right text-sm font-semibold text-kera-primary outline-none focus:ring-2 focus:ring-inset focus:ring-kera-primary/20"
          />
          <span className="flex min-w-[2.75rem] items-center justify-center border-l border-slate-200 bg-slate-50 px-2 text-xs font-semibold tracking-wide text-slate-500">
            {suffix}
          </span>
        </div>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          setDraft(null);
          onChange(Number(event.target.value));
        }}
        className="w-full accent-kera-primary"
      />
    </div>
  );
}

export function MortgageCalculator() {
  const t = useT();
  const [currency, setCurrency] = useState<"USD" | "GEL">("USD");
  const [amount, setAmount] = useState(150000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(8);

  const maxAmount = currency === "USD" ? MAX_USD : MAX_GEL;
  const minAmount = currency === "USD" ? 10000 : 26500;
  const step = currency === "USD" ? 5000 : 13250;

  const result = useMemo(
    () => calculateMortgage(amount, months, rate),
    [amount, months, rate],
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
        <SliderField
          key={`amount-${currency}`}
          label={t.mortgage.amount}
          value={Math.min(amount, maxAmount)}
          min={minAmount}
          max={maxAmount}
          step={step}
          suffix={currency}
          onChange={setAmount}
        />

        <SliderField
          label={t.mortgage.months}
          value={months}
          min={6}
          max={360}
          step={1}
          suffix={t.mortgage.monthsUnit}
          onChange={setMonths}
        />

        <SliderField
          label={t.mortgage.annualRate}
          value={rate}
          min={1}
          max={50}
          step={0.1}
          suffix="%"
          onChange={setRate}
        />
      </div>

      <div className="mt-6 rounded-2xl bg-kera-slate p-5 text-white sm:p-6">
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
