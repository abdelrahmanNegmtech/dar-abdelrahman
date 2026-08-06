import { Suspense } from "react";
import {
  buildSearchFallbackResult,
  getPublicProperties,
  parsePublicPropertyFilters,
} from "@/features/properties/data/public-property-queries";
import { SearchExperience } from "@/features/public-marketplace/search/components/SearchExperience";
import { getSupabaseConfig } from "@/lib/supabase/config";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parsePublicPropertyFilters(resolvedSearchParams);
  const searchData = !getSupabaseConfig()
    ? buildSearchFallbackResult()
    : await getPublicProperties(filters).catch(() => null);

  return (
    <Suspense fallback={null}>
      <SearchExperience
        initialResults={searchData ?? buildSearchFallbackResult()}
        loadFailed={searchData === null}
      />
    </Suspense>
  );
}
