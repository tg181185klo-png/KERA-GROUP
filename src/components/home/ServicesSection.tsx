import {
  Building2,
  Camera,
  ChartLine,
  HardHat,
  KeyRound,
} from "lucide-react";
import { SERVICES } from "@/lib/constants";

const ICONS = {
  building: Building2,
  crane: HardHat,
  chart: ChartLine,
  key: KeyRound,
  camera: Camera,
} as const;

export function ServicesSection() {
  return (
    <section id="services" className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-kera-primary">
              KERA Ecosystem
            </p>
            <h2 className="kera-section-title mt-2">
              პრემიუმ სერვისების ეკოსისტემა
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
              ხუთი მიმართულება, ერთი სტანდარტი — თქვენი ქონების სრული მართვა და
              განვითარება.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SERVICES.map(({ title, description, icon }) => {
            const Icon = ICONS[icon];
            return (
              <article
                key={title}
                className="kera-card group flex flex-col p-5 sm:p-6"
              >
                <div className="kera-icon-box mb-4 transition-colors group-hover:bg-kera-primary group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <h3 className="font-display text-base font-bold text-kera-slate">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
