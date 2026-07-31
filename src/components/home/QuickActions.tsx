"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calculator, CircleDollarSign, Plus, Search } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import {
  CURRENCY_SECTION_ID,
  queueScrollToSection,
  scrollToSection,
} from "@/lib/scroll-to-section";

export function QuickActions() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();

  function openCurrencySection() {
    if (pathname === "/") {
      scrollToSection(CURRENCY_SECTION_ID);
      return;
    }

    queueScrollToSection(CURRENCY_SECTION_ID);
    router.push("/");
  }

  const actions: Array<{
    key: string;
    href?: string;
    icon: typeof Search;
    label: string;
    description: string;
    onClick?: () => void;
  }> = [
    {
      key: "search",
      href: "/#search",
      icon: Search,
      label: t.quickActions.search.label,
      description: t.quickActions.search.desc,
    },
    {
      key: "list",
      href: "/dashboard/add-property",
      icon: Plus,
      label: t.quickActions.list.label,
      description: t.quickActions.list.desc,
    },
    {
      key: "calculator",
      href: "/#calculator",
      icon: Calculator,
      label: t.quickActions.mortgage.label,
      description: t.quickActions.mortgage.desc,
    },
    {
      key: "currency",
      icon: CircleDollarSign,
      label: t.quickActions.currency.label,
      description: t.quickActions.currency.desc,
      onClick: openCurrencySection,
    },
  ];

  return (
    <section className="bg-kera-page pb-4 pt-2 sm:pb-6">
      <div className="kera-container">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {actions.map(({ key, href, icon: Icon, label, description, onClick }) => {
            const className =
              "kera-card group flex min-h-[88px] items-center gap-3 p-4 sm:gap-4 sm:p-5";

            const content = (
              <>
                <div className="kera-icon-box transition-colors group-hover:bg-kera-primary group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold leading-snug text-kera-slate sm:text-base">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {description}
                  </p>
                </div>
              </>
            );

            if (onClick) {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={onClick}
                  className={`${className} w-full text-left`}
                >
                  {content}
                </button>
              );
            }

            if (!href) return null;

            return (
              <Link key={key} href={href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
