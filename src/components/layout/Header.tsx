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
import { useT } from "@/i18n/LocaleProvider";
import { getNavLinks } from "@/i18n/nav";
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
        "whitespace-nowrap rounded-lg px-2 py-1.5 text-sm font-medium transition lg:px-2.5",
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
        <div className="flex h-[var(--header-height)] items-center gap-2 lg:h-[var(--header-height-lg)] lg:gap-3">
          <KeraLogo size="header" compactTagline priority className="shrink-0" />

          <nav
            className="hidden shrink-0 items-center gap-0.5 lg:flex xl:gap-1"
            aria-label={t.footer.navigation}
          >
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          <div className="min-w-0 flex-1" aria-hidden />

          <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">
            <div className="hidden lg:block">
              <CurrencyWidget variant="header" />
            </div>

            <div className="hidden h-5 w-px bg-slate-200 lg:block" aria-hidden />

            <div className="hidden items-center gap-1.5 lg:flex xl:gap-2">
              {authLoading ? (
                <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" aria-hidden />
              ) : isLoggedIn ? (
                <UserMenu />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-kera-blue"
                  >
                    {t.header.login}
                  </Link>
                  <LinkButton href="/signup" variant="secondary" size="sm" className="whitespace-nowrap">
                    {t.header.signup}
                  </LinkButton>
                </>
              )}
            </div>

            <button
              type="button"
              className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={t.header.menu}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <LanguageSwitcher compact className="shrink-0" />
          </div>
        </div>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[var(--header-height)] z-40 bg-slate-900/20 backdrop-blur-[1px] lg:hidden"
            aria-label={t.header.closeMenu}
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 border-t border-slate-100 bg-white px-4 py-4 shadow-lg lg:hidden">
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
