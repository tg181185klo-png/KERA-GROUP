"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { LOGO_IMAGE } from "@/lib/brand";
import { NAV_LINKS, CONTACT_PHONE_HREF, SITE_NAME } from "@/lib/constants";
import { CurrencyWidget } from "./CurrencyWidget";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[4.25rem]">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src={LOGO_IMAGE}
              alt={SITE_NAME}
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
              priority
            />
            <span className="font-display hidden text-lg font-bold tracking-tight text-kera-slate sm:block">
              კერა ჯგუფი
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-kera-zinc/80 transition-colors hover:text-kera-primary"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 xl:flex">
            <CurrencyWidget compact />
            <Link
              href="/submit"
              className="kera-btn shadow-sm shadow-kera-primary/20"
            >
              ქონების განთავსება
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={CONTACT_PHONE_HREF}
              className="rounded-lg p-2 text-kera-zinc"
              aria-label="დარეკვა"
            >
              <Phone className="h-5 w-5" />
            </a>
            <button
              type="button"
              className="rounded-lg p-2 text-kera-zinc"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="მენიუ"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-kera-zinc hover:bg-kera-primary-light hover:text-kera-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="mt-3 border-t border-slate-100 pt-3">
                <CurrencyWidget />
              </div>
              <Link
                href="/submit"
                className="kera-btn mt-3 block text-center"
                onClick={() => setMobileOpen(false)}
              >
                ქონების განთავსება
              </Link>
            </nav>
          </div>
        )}
      </div>

      <div className="hidden border-t border-slate-100 bg-kera-page/50 px-4 py-2.5 lg:block xl:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <CurrencyWidget compact />
          <Link href="/submit" className="kera-btn shrink-0 px-4 py-2 text-sm">
            ქონების განთავსება
          </Link>
        </div>
      </div>
    </header>
  );
}
