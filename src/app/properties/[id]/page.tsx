import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchActiveListingById } from "@/lib/active-listings";
import { PropertyDetailClient } from "@/components/properties/PropertyDetailClient";
import { formatPrice } from "@/lib/cadastral";

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

  return {
    title: `${property.title} | კერა ჯგუფი`,
    description: `${formatPrice(property.total_price)} · ${property.address} · ${property.cadastral_code}`,
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
