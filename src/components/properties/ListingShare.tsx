"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { getSiteUrl } from "@/lib/site-url";

interface ListingShareProps {
  id: string;
  title: string;
  compact?: boolean;
}

function listingUrl(id: string): string {
  return `${getSiteUrl()}/properties/${id}`;
}

export function ListingShare({ id, title, compact = false }: ListingShareProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const url = listingUrl(id);
  const text = `${title} — ${url}`;

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, text: title, url });
    } catch {
      // User dismissed the share sheet.
    }
  }

  const links = [
    {
      key: "facebook",
      label: t.properties.shareFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: <FacebookIcon />,
    },
    {
      key: "whatsapp",
      label: t.properties.shareWhatsapp,
      href: `https://wa.me/?text=${encodeURIComponent(text)}`,
      icon: <WhatsAppIcon />,
    },
    {
      key: "telegram",
      label: t.properties.shareTelegram,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      icon: <TelegramIcon />,
    },
    {
      key: "viber",
      label: t.properties.shareViber,
      href: `viber://forward?text=${encodeURIComponent(text)}`,
      icon: <ViberIcon />,
    },
  ] as const;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t.properties.share}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {canNativeShare && (
          <button
            type="button"
            onClick={() => void nativeShare()}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-kera-primary hover:text-kera-primary"
          >
            <Share2 className="h-3.5 w-3.5" />
            {t.properties.share}
          </button>
        )}
        {links.map((item) => (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            title={item.label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-kera-primary hover:text-kera-primary"
          >
            {item.icon}
          </a>
        ))}
        <button
          type="button"
          onClick={() => void copyLink()}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-kera-primary hover:text-kera-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
          {copied ? t.properties.shareCopied : t.properties.shareCopy}
        </button>
      </div>
    </div>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
      <path d="M12.04 4C7.61 4 4 7.55 4 11.91c0 1.4.37 2.76 1.08 3.96L4 20l4.26-1.05a8.1 8.1 0 0 0 3.78.93h.01c4.43 0 8.04-3.55 8.04-7.91C20.09 7.55 16.47 4 12.04 4zm4.68 11.18c-.2.55-1.14 1.04-1.58 1.08-.41.04-.92.06-1.49-.09-.34-.09-.78-.25-1.34-.49-2.36-1.02-3.9-3.4-4.02-3.56-.12-.16-.95-1.26-.95-2.4 0-1.15.6-1.71.81-1.94.21-.23.46-.29.61-.29h.44c.14 0 .33-.05.52.4.2.47.67 1.63.73 1.75.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.24-.1.47.14.23.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.14 1.13z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
      <path d="M19.8 5.2 3.9 11.1c-1.1.4-1.1 1-.2 1.3l4.1 1.3 1.6 4.8c.2.6.1.8.6.8.4 0 .6-.2.8-.4l2.3-2.2 4.1 3c.8.4 1.3.2 1.5-.7l2.7-12.6c.3-1.1-.4-1.6-1.6-1.2zM9.7 14.3l8.6-5.4c.4-.3.8-.1.5.2l-7.3 6.6-.3 3.1-1.5-4.5z" />
    </svg>
  );
}

function ViberIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
      <path d="M16.9 3.6C15.2 2.6 13.2 2 11.2 2 6.2 2 2.2 6 2.2 11c0 1.6.4 3.1 1.2 4.4L2 22l6.8-1.3c1.3.7 2.7 1.1 4.2 1.1 5 0 9-4 9-9 0-2.1-.7-4.1-2.1-5.7-.6-.7-1.4-1.6-3-3.5zM12.9 18.6c-1.3 0-2.6-.3-3.7-.9l-.3-.2-4 .8.8-3.9-.2-.3c-.7-1.2-1.1-2.5-1.1-3.9 0-4.1 3.4-7.5 7.5-7.5 2 0 3.8.8 5.2 2.2 1.4 1.4 2.1 3.2 2.1 5.2 0 4.2-3.4 7.5-7.3 8.5z" />
    </svg>
  );
}
