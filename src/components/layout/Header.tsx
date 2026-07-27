"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { KeraLogo } from "@/components/brand/KeraLogo";
import { LinkButton } from "@/components/ui/Button";
import { CurrencyWidget } from "@/components/layout/CurrencyWidget";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { UserMenu, useAuthUser } from "@/components/layout/UserMenu";
import { useT, useLocale } from "@/i18n/LocaleProvider";
import { getNavLinks } from "@/i18n/nav";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  label,
  compact,
}: {
  href: string;
  label: string;
  compact?: boolean;
}) {
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
        "whitespace-nowrap rounded-lg py-2 font-medium transition",
        compact ? "px-2 text-xs xl:px-2.5 xl:text-sm" : "px-3 text-sm",
        active
          ? "bg-kera-primary-light text-kera-primary"
          : "text-slate-600 hover:bg-slate-50 hover:text-kera-slate",
      )}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const t = useT();
  const { locale } = useLocale();
  const navLinks = getNavLinks(t);
  const { isLoggedIn, loading: authLoading } = useAuthUser();
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
          <div className="flex items-center justify-start">
            <KeraLogo size="header" priority />
          </div>

          <nav className="hidden items-center justify-center gap-0.5 md:flex lg:gap-0.5 xl:gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                compact={locale === "en"}
              />
            ))}
          </nav>

          <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-1.5 xl:gap-2">
            <div className="hidden xl:block">
              <CurrencyWidget variant="header" />
            </div>

            <div className="hidden h-6 w-px bg-slate-200 xl:block" aria-hidden />

            <div className="hidden items-center gap-1.5 md:flex xl:gap-2">
              {authLoading ? (
                <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" aria-hidden />
              ) : isLoggedIn ? (
                <UserMenu />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-kera-blue xl:px-3 xl:text-sm"
                  >
                    {t.header.login}
                  </Link>
                  <LinkButton href="/signup" variant="secondary" size="sm">
                    {t.header.signup}
                  </LinkButton>
                </>
              )}
            </div>

            <button
              type="button"
              className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={t.header.menu}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <LanguageSwitcher compact className="ml-0.5 shrink-0" />
          </div>
        </div>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[var(--header-height)] z-40 bg-slate-900/20 backdrop-blur-[1px] md:hidden"
            aria-label={t.header.closeMenu}
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden">
            <nav className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
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
            <div className="mt-4">
              {authLoading ? (
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" aria-hidden />
              ) : isLoggedIn ? (
                <UserMenu variant="mobile" />
              ) : (
                <div className="flex flex-col gap-2">
                  <LinkButton href="/signup" variant="secondary" className="w-full">
                    {t.header.signup}
                  </LinkButton>
                  <LinkButton href="/login" variant="ghost" className="w-full">
                    {t.header.login}
                  </LinkButton>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
