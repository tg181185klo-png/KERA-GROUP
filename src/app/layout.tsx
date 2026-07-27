import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LOGO_SVG } from "@/lib/brand";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://keragroup.ge"
  ),
  title: `${SITE_NAME} | Premium Real Estate Platform`,
  description:
    "კერა ჯგუფი — უძრავი ქონების სრული სერვისი: Real Estate, Development, Investment, Management & Media.",
  icons: {
    icon: [{ url: LOGO_SVG, type: "image/svg+xml" }],
    shortcut: LOGO_SVG,
    apple: [{ url: LOGO_SVG, type: "image/svg+xml" }],
  },
  openGraph: {
    title: `${SITE_NAME} | Premium Real Estate Platform`,
    description:
      "კერა ჯგუფი — უძრავი ქონების სრული სერვისი: Real Estate, Development, Investment, Management & Media.",
    images: [LOGO_SVG],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col overflow-x-hidden bg-kera-page font-sans text-kera-slate antialiased">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
