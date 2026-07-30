import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/i18n/server";
import { LOGO_MARK } from "@/lib/brand";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getMessages(locale);

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.keragroup.ge",
    ),
    title: `${t.brand.name} | ${t.meta.title}`,
    description: t.meta.description,
    icons: {
      icon: [{ url: LOGO_MARK, type: "image/png" }],
      shortcut: LOGO_MARK,
      apple: [{ url: LOGO_MARK, type: "image/png" }],
    },
    openGraph: {
      title: `${t.brand.name} | ${t.meta.title}`,
      description: t.meta.description,
      images: [LOGO_MARK],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col overflow-x-hidden bg-kera-page font-sans text-kera-slate antialiased">
        <LocaleProvider initialLocale={locale}>
          <Header />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
