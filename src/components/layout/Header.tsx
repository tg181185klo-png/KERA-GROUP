"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { KeraLogo } from "@/components/brand/KeraLogo";
import { LinkButton } from "@/components/ui/Button";
import { CurrencyWidget } from "@/components/layout/CurrencyWidget";
import { NAV_LINKS } from "@/lib/constants";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <KeraLogo size="sm" priority />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-kera-blue"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <CurrencyWidget compact />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition hover:text-kera-blue"
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
          className="rounded-xl p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="მენიუ"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <LinkButton href="/signup" variant="secondary" className="mt-2 w-full">
              რეგისტრაცია
            </LinkButton>
            <LinkButton href="/login" variant="ghost" className="w-full">
              შესვლა
            </LinkButton>
            <LinkButton href="/dashboard/add-property" className="w-full">
              ქონების განთავსება
            </LinkButton>
          </nav>
        </div>
      )}
    </header>
  );
}
