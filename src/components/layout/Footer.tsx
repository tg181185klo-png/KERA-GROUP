import Image from "next/image";
import Link from "next/link";
import { LOGO_IMAGE } from "@/lib/brand";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  SITE_NAME,
  SITE_NAME_GE,
} from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src={LOGO_IMAGE}
                alt={SITE_NAME}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <div>
                <p className="font-display text-base font-bold text-kera-slate">
                  {SITE_NAME}
                </p>
                <p className="text-xs text-slate-500">{SITE_NAME_GE}</p>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Premium Real Estate Ecosystem — Real Estate · Development ·
              Investment · Property Management · Media
            </p>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-kera-slate">
              ნავიგაცია
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/" className="hover:text-kera-primary">
                  მთავარი
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-kera-primary">
                  ქონების განთავსება
                </Link>
              </li>
              <li>
                <Link href="/#currency" className="hover:text-kera-primary">
                  ვალუტის კურსები
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-kera-primary">
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
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-kera-primary">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a href={CONTACT_PHONE_HREF} className="hover:text-kera-primary">
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
