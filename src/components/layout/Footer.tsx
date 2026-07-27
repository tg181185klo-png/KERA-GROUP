"use client";

import Link from "next/link";
import { KeraLogo } from "@/components/brand/KeraLogo";
import { useT } from "@/i18n/LocaleProvider";
import { getFooterLinks } from "@/i18n/nav";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
} from "@/lib/constants";

export function Footer() {
  const t = useT();
  const footerLinks = getFooterLinks(t);

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="kera-container py-12 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="max-w-sm">
            <KeraLogo size="md" />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              {t.brand.footerTagline}
            </p>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-kera-slate">
              {t.footer.navigation}
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-slate-600 sm:grid-cols-1">
              {footerLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-kera-primary">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin" className="transition hover:text-kera-primary">
                  {t.nav.admin}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-kera-slate">
              {t.footer.contact}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition hover:text-kera-primary"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT_PHONE_HREF}
                  className="transition hover:text-kera-primary"
                >
                  {CONTACT_PHONE}
                </a>
              </li>
              <li>{t.footer.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {t.brand.name}. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
