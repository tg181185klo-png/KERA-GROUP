import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchActiveListingById } from "@/lib/active-listings";
import { PropertyDetailClient } from "@/components/properties/PropertyDetailClient";
import { formatPrice, formatPricePerSqm } from "@/lib/cadastral";
import { getPricePerSqm } from "@/lib/price-display";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

function absoluteImageUrl(src: string): string {
  if (src.startsWith("https://") || src.startsWith("http://")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${getSiteUrl()}${path}`;
}

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchActiveListingById(id);

  if (!property) {
    return { title: "განცხადება ვერ მოიძებნა" };
  }

  const pricePerSqm = getPricePerSqm(property);
  const priceSummary =
    pricePerSqm != null
      ? `${formatPrice(property.total_price)} · ${formatPricePerSqm(pricePerSqm)}`
      : formatPrice(property.total_price);
  const description = `${priceSummary} · ${property.address} · ${property.cadastral_code}`;
  const pageUrl = `${getSiteUrl()}/properties/${id}`;
  const mainImage = property.images.find((src) => src.trim().length > 0);
  const imageUrl = mainImage ? absoluteImageUrl(mainImage) : undefined;

  return {
    title: `${property.title} | კერა ჯგუფი`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: property.title,
      description,
      url: pageUrl,
      type: "website",
      siteName: "კერა ჯგუფი",
      images: imageUrl ? [{ url: imageUrl, alt: property.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: property.title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await fetchActiveListingById(id);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}
