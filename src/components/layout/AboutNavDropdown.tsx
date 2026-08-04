"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useT } from "@/i18n/LocaleProvider";
import { getServices } from "@/i18n/nav";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AboutNavDropdownProps {
  className?: string;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}

export function AboutNavDropdown({
  className,
  onNavigate,
  variant = "desktop",
}: AboutNavDropdownProps) {
  const t = useT();
  const pathname = usePathname();
  const services = getServices(t);
  const [open, setOpen] = useState(false);

  const menuActive =
    pathname.startsWith("/services/") || pathname === "/#services";

  if (variant === "mobile") {
    return (
      <div className={className}>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {t.nav.services}
          <ChevronDown
            className={cn("h-4 w-4 transition", open && "rotate-180")}
          />
        </button>
        {open && (
          <div className="ml-2 border-l-2 border-kera-primary/20 pl-3">
            {services.map((service) => (
              <Link
                key={service.key}
                href={service.href}
                className="block rounded-lg py-2.5 text-sm text-slate-600 transition hover:text-kera-primary"
                onClick={onNavigate}
              >
                {service.title}
              </Link>
            ))}
            <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <p className="mb-1 font-semibold text-slate-600">
                {t.services.contactInMenu}
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-1.5 py-1 hover:text-kera-primary"
              >
                <Mail className="h-3.5 w-3.5" />
                {CONTACT_EMAIL}
              </a>
              <a
                href={CONTACT_PHONE_HREF}
                className="flex items-center gap-1.5 py-1 hover:text-kera-primary"
              >
                <Phone className="h-3.5 w-3.5" />
                {CONTACT_PHONE}
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/#services"
        className={cn(
          "inline-flex items-center gap-0.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-sm font-medium transition lg:px-2.5",
          menuActive || open
            ? "bg-kera-primary-light text-kera-primary"
            : "text-slate-600 hover:bg-slate-50 hover:text-kera-slate",
        )}
      >
        {t.nav.services}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition", open && "rotate-180")}
        />
      </Link>

      {open && (
        <div className="absolute left-0 top-full z-50 min-w-[min(100vw-2rem,22rem)] pt-1">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
            <ul className="py-1">
              {services.map((service) => (
                <li key={service.key}>
                  <Link
                    href={service.href}
                    className="block px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-kera-primary-light hover:text-kera-primary"
                    onClick={() => setOpen(false)}
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.services.contactInMenu}
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-2 text-xs text-slate-600 transition hover:text-kera-primary"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {CONTACT_EMAIL}
              </a>
              <a
                href={CONTACT_PHONE_HREF}
                className="mt-1 flex items-center gap-2 text-xs text-slate-600 transition hover:text-kera-primary"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {CONTACT_PHONE}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
