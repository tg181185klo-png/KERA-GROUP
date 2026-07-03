import Link from "next/link";
import { Calculator, CircleDollarSign, Plus, Search } from "lucide-react";

const ACTIONS = [
  {
    href: "/#search",
    icon: Search,
    label: "ქონების ძებნა",
    description: "ფილტრი და პარამეტრები",
  },
  {
    href: "/submit",
    icon: Plus,
    label: "ქონების განთავსება",
    description: "განათავსე განცხადება",
  },
  {
    href: "/#calculator",
    icon: Calculator,
    label: "იპოთეკის კალკულატორი",
    description: "ყოველთვიური გადასახადი",
  },
  {
    href: "/#currency",
    icon: CircleDollarSign,
    label: "ვალუტის კურსები",
    description: "NBG ოფიციალური კურსი",
  },
] as const;

export function QuickActions() {
  return (
    <section className="bg-kera-page pb-2 pt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {ACTIONS.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="kera-card group flex items-center gap-3 p-4 sm:gap-4 sm:p-5"
            >
              <div className="kera-icon-box transition-colors group-hover:bg-kera-primary group-hover:text-white">
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold leading-snug text-kera-slate sm:text-base">
                  {label}
                </p>
                <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
