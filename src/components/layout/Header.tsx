"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { KeraLogo } from "@/components/brand/KeraLogo";
import { LinkButton } from "@/components/ui/Button";
import { CurrencyWidget } from "@/components/layout/CurrencyWidget";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const pathOnly = href.split("#")[0];
  const active =
    pathOnly === "/"
      ? pathname === "/" && href === "/"
      : pathOnly !== "/" && pathname.startsWith(pathOnly);

  return (
    <Link
      href={href}
      className={cn(
        "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-kera-primary-light text-kera-primary"
          : "text-slate-600 hover:bg-slate-50 hover:text-kera-slate"
      )}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_3px_rgba(15,23,42,0.04)] backdrop-blur-md supports-[backdrop-filter]:bg-white/92">
      <div className="kera-container">
        <div className="grid h-[var(--header-height)] grid-cols-[1fr_auto_1fr] items-center gap-2 lg:h-[var(--header-height-lg)] lg:gap-4">
          {/* Logo */}
          <div className="flex items-center justify-start">
            <KeraLogo size="sm" priority />
          </div>

          {/* Navigation — centered */}
          <nav className="hidden items-center justify-center gap-0.5 md:flex lg:gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* Actions — right aligned, balanced with logo column */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="hidden lg:block">
              <CurrencyWidget variant="header" />
            </div>

            <div className="hidden h-6 w-px bg-slate-200 lg:block" aria-hidden />

            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-kera-blue"
              >
                შესვლა
              </Link>
              <LinkButton href="/signup" variant="secondary" size="sm">
                რეგისტრაცია
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
      </div>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[var(--header-height)] z-40 bg-slate-900/20 backdrop-blur-[1px] md:hidden"
            aria-label="მენიუს დახურვა"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden">
            <nav className="flex flex-col gap-0.5">
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
              <CurrencyWidget variant="header" />
            </div>
            <div className="mt-4 flex flex-col gap-2">
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
