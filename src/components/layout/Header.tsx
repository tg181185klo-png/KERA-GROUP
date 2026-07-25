"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { KeraLogo } from "@/components/brand/KeraLogo";
import { LinkButton } from "@/components/ui/Button";
import { CurrencyWidget } from "@/components/layout/CurrencyWidget";
import { NAV_LINKS } from "@/lib/constants";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
      <div className="kera-container">
        <div className="flex h-16 items-center justify-between gap-3 lg:h-[4.25rem]">
          <KeraLogo size="sm" priority />

          <nav className="hidden items-center gap-6 xl:gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-kera-blue"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex xl:gap-3">
            <CurrencyWidget compact />
            <Link
              href="/login"
              className="whitespace-nowrap px-2 text-sm font-medium text-slate-600 transition hover:text-kera-blue"
            >
              შესვლა
            </Link>
            <LinkButton href="/signup" variant="secondary" size="sm">
              რეგისტრაცია
            </LinkButton>
            <LinkButton href="/dashboard/add-property" size="sm">
              ქონების განთავსება
            </LinkButton>
          </div>

          <button
            type="button"
            className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="მენიუ"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-40 bg-slate-900/20 backdrop-blur-[1px] md:hidden"
            aria-label="მენიუს დახურვა"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 rounded-xl border border-slate-100 bg-kera-page p-3">
              <CurrencyWidget compact />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <LinkButton href="/dashboard/add-property" className="w-full">
                ქონების განთავსება
              </LinkButton>
              <LinkButton href="/signup" variant="secondary" className="w-full">
                რეგისტრაცია
              </LinkButton>
              <LinkButton href="/login" variant="ghost" className="w-full">
                შესვლა
              </LinkButton>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
