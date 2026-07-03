import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LOGO_IMAGE } from "@/lib/brand";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://keragroup.vercel.app"
  ),
  title: `${SITE_NAME} | Premium Real Estate Platform`,
  description:
    "კერა ჯგუფი — უძრავი ქონების სრული სერვისი: Real Estate, Development, Investment, Management & Media.",
  icons: {
    icon: LOGO_IMAGE,
    shortcut: LOGO_IMAGE,
    apple: LOGO_IMAGE,
  },
  openGraph: {
    title: `${SITE_NAME} | Premium Real Estate Platform`,
    description:
      "კერა ჯგუფი — უძრავი ქონების სრული სერვისი: Real Estate, Development, Investment, Management & Media.",
    images: [LOGO_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col bg-kera-page font-sans text-kera-slate antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
