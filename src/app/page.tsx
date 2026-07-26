import { HeroSearch } from "@/components/home/HeroSearch";
import { HomeMapSection } from "@/components/home/HomeMapSection";
import { QuickActions } from "@/components/home/QuickActions";
import { ServicesSection } from "@/components/home/ServicesSection";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { ToolsSection } from "@/components/home/ToolsSection";
import { fetchActiveMapListings } from "@/lib/active-listings";
import { isSupabaseConfigured } from "@/utils/supabase";
import type { PropertySearchParams } from "@/lib/types/property";
import type { MapProperty } from "@/lib/types/property-listing";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getSearchParams(
  params: Record<string, string | string[] | undefined>
): PropertySearchParams {
  const getValue = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  };

  return {
    deal_type: getValue("deal_type") as PropertySearchParams["deal_type"],
    property_type: getValue("property_type"),
    location: getValue("location"),
    min_price: getValue("min_price") ? Number(getValue("min_price")) : undefined,
    max_price: getValue("max_price") ? Number(getValue("max_price")) : undefined,
    bedrooms: getValue("bedrooms") ? Number(getValue("bedrooms")) : undefined,
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const filters = getSearchParams(params);

  let properties: MapProperty[] = [];

  if (isSupabaseConfigured()) {
    try {
      properties = await fetchActiveMapListings({ enrich: false });
    } catch {
      properties = [];
    }
  }

  return (
    <>
      <HeroSearch />
      <HomeMapSection />
      <QuickActions />
      <ServicesSection />
      <FeaturedProperties
        initialProperties={properties}
        searchParams={filters}
      />
      <ToolsSection />
    </>
  );
}
