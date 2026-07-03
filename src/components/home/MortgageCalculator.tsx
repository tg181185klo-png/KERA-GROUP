"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { calculateMortgage } from "@/lib/format";

export function MortgageCalculator() {
  const [amount, setAmount] = useState(150000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8);

  const result = useMemo(
    () => calculateMortgage(amount, years, rate),
    [amount, years, rate]
  );

  return (
    <section id="calculator" className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="kera-icon-box mx-auto mb-4">
            <Calculator className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <h2 className="kera-section-title">იპოთეკური კალკულატორი</h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            გამოთვალეთ სავარაუდო ყოველთვიური გადასახადი სწრაფად და მარტივად.
          </p>
        </div>

        <div className="kera-card mx-auto mt-10 max-w-2xl p-6 sm:p-8">
          <div className="space-y-6">
            <div>
              <label className="mb-2 flex justify-between text-sm font-medium text-slate-700">
                <span>სესხის თანხა (USD)</span>
                <span className="font-bold text-kera-primary">
                  ${amount.toLocaleString()}
                </span>
              </label>
              <input
                type="range"
                min={10000}
                max={1000000}
                step={5000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-kera-primary"
              />
            </div>

            <div>
              <label className="mb-2 flex justify-between text-sm font-medium text-slate-700">
                <span>ვადა (წელი)</span>
                <span className="font-bold text-kera-primary">{years} წელი</span>
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
                <span>წლიური პროცენტი (%)</span>
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

          <div className="mt-8 rounded-2xl bg-kera-slate p-6 text-white">
            <p className="text-sm text-white/70">ყოველთვიური გადასახადი</p>
            <p className="font-display mt-1 text-4xl font-bold">
              ${result.monthlyPayment.toLocaleString()}
            </p>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/70">
              <span>
                სულ გადასახდელი{" "}
                <strong className="text-white">
                  ${result.totalPayment.toLocaleString()}
                </strong>
              </span>
              <span>
                სულ საპროცენტო{" "}
                <strong className="text-kera-primary">
                  ${result.totalInterest.toLocaleString()}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
