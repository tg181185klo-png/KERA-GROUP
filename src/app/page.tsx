import { HeroSearch } from "@/components/home/HeroSearch";
import { QuickActions } from "@/components/home/QuickActions";
import { ServicesSection } from "@/components/home/ServicesSection";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { MortgageCalculator } from "@/components/home/MortgageCalculator";
import { CurrencySection } from "@/components/layout/CurrencyWidget";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/utils/supabase";
import type { Property, PropertySearchParams } from "@/lib/types/property";

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

  let properties: Property[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      properties = (data as Property[]) ?? [];
    } catch {
      properties = [];
    }
  }

  return (
    <>
      <HeroSearch />
      <QuickActions />
      <ServicesSection />
      <FeaturedProperties
        initialProperties={properties}
        searchParams={filters}
      />
      <CurrencySection />
      <MortgageCalculator />
    </>
  );
}
