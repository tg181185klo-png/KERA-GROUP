import { PropertiesPageContent } from "@/components/properties/PropertiesPageContent";
import { fetchActiveMapListings } from "@/lib/active-listings";
import { parsePropertySearchParams } from "@/lib/property-search";
import { isSupabaseConfigured } from "@/utils/supabase";
import type { MapProperty } from "@/lib/types/property-listing";

interface PropertiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;
  const filters = parsePropertySearchParams(params);

  let properties: MapProperty[] = [];

  if (isSupabaseConfigured()) {
    try {
      properties = await fetchActiveMapListings({ enrich: false });
    } catch {
      properties = [];
    }
  }

  return (
    <PropertiesPageContent
      initialProperties={properties}
      searchParams={filters}
    />
  );
}
