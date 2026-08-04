import { HeroSearch } from "@/components/home/HeroSearch";
import { HomeMapSection } from "@/components/home/HomeMapSection";
import { QuickActions } from "@/components/home/QuickActions";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { ToolsSection } from "@/components/home/ToolsSection";
import { fetchActiveMapListings } from "@/lib/active-listings";
import { isSupabaseConfigured } from "@/utils/supabase";
import type { MapProperty } from "@/lib/types/property-listing";

export default async function Home() {
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
      <FeaturedProperties initialProperties={properties} searchParams={{}} />
      <ToolsSection />
    </>
  );
}
