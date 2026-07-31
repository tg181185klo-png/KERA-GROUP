"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CurrencyWidget } from "@/components/layout/CurrencyWidget";
import { useT } from "@/i18n/LocaleProvider";

export default function CurrencyPage() {
  const t = useT();

  return (
    <section className="bg-kera-page py-8 sm:py-12">
      <div className="kera-container">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-kera-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.nav.home}
        </Link>

        <div className="mx-auto max-w-md">
          <h1 className="kera-page-header mb-2">{t.currency.title}</h1>
          <p className="mb-6 text-sm text-slate-600">{t.currency.subtitle}</p>

          <div className="kera-card overflow-hidden p-1">
            <CurrencyWidget />
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            {t.currency.nbgTitle}
          </p>
        </div>
      </div>
    </section>
  );
}
