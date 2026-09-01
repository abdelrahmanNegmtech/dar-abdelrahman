import { Suspense } from "react";
import {
  createEmptyPublicPropertyResult,
  getPublicProperties,
  parsePublicPropertyFilters,
} from "@/features/properties/data/public-property-queries";
import { FavoritesBoundary } from "@/features/public-marketplace/favorites/FavoritesBoundary";
import { SearchExperience } from "@/features/public-marketplace/search/components/SearchExperience";
import { getSupabaseConfig } from "@/lib/supabase/config";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parsePublicPropertyFilters(resolvedSearchParams);
  const searchData = getSupabaseConfig()
    ? await getPublicProperties(filters).catch(() => null)
    : null;

  return (
    <Suspense fallback={null}>
      <FavoritesBoundary>
        <SearchExperience
          initialResults={searchData ?? createEmptyPublicPropertyResult()}
          loadFailed={searchData === null}
        />
      </FavoritesBoundary>
    </Suspense>
  );
}
