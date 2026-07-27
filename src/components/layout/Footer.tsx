import Link from "next/link";
import { KeraLogo } from "@/components/brand/KeraLogo";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  SITE_NAME,
} from "@/lib/constants";

const FOOTER_LINKS = [
  { href: "/", label: "მთავარი" },
  { href: "/#services", label: "სერვისები" },
  { href: "/#map", label: "რუკა" },
  { href: "/#featured", label: "ქონება" },
  { href: "/dashboard/add-property", label: "განთავსება" },
  { href: "/#calculator", label: "კალკულატორი" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="kera-container py-12 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="max-w-sm">
            <KeraLogo size="md" />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Premium Real Estate Ecosystem — Real Estate · Development ·
              Investment · Property Management · Media
            </p>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-kera-slate">
              ნავიგაცია
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-slate-600 sm:grid-cols-1">
              {FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-kera-primary">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin" className="transition hover:text-kera-primary">
                  ადმინ პანელი
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-kera-slate">
              კონტაქტი
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
              <li>{CONTACT_ADDRESS}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {SITE_NAME}. ყველა უფლება დაცულია.
        </div>
      </div>
    </footer>
  );
}
