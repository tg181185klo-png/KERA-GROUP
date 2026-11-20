import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchActiveListingById } from "@/lib/active-listings";
import { PropertyDetailClient } from "@/components/properties/PropertyDetailClient";
import { formatPrice, formatPricePerSqm } from "@/lib/cadastral";
import { getPricePerSqm } from "@/lib/price-display";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

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
  const hasPhoto = property.images.some((src) => src.trim().length > 0);
  const imageUrl = hasPhoto ? `${getSiteUrl()}/api/listings/${id}/cover` : undefined;

  return {
    title: `${property.title} | keragroup.ge`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: property.title,
      description,
      url: pageUrl,
      type: "website",
      siteName: "keragroup.ge",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: property.title, type: "image/jpeg" }]
        : [],
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
