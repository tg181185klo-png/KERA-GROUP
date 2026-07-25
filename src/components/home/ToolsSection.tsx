import { MortgageCalculator } from "@/components/home/MortgageCalculator";
import { CurrencyWidget } from "@/components/layout/CurrencyWidget";

export function ToolsSection() {
  return (
    <section id="calculator" className="kera-section bg-kera-page">
      <div className="kera-container">
        {/* მობილური: ერთმანეთის ქვემოთ | დესკტოპი: გვერდიგვერდ */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8">
          <div id="currency" className="kera-card flex h-full min-h-0 flex-col p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold text-kera-slate sm:text-xl">
                ვალუტის კურსები
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                საქართველოს ეროვნული ბანკის ოფიციალური კურსი
              </p>
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
