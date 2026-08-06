"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PublicPropertyListResult } from "@/features/properties/data/public-property-queries";
import { MarketplaceShell } from "../../components/MarketplaceShell";
import { SearchMode } from "../data";
import { FiltersModal } from "./SearchFiltersModal";
import { SearchHeader } from "./SearchHeader";
import { SearchResultsLayout } from "./SearchResultsLayout";

type SearchExperienceProps = {
  initialResults: PublicPropertyListResult;
  loadFailed?: boolean;
};

export function SearchExperience({
  initialResults,
  loadFailed = false,
}: SearchExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = useMemo<SearchMode>(() => {
    const state = searchParams.get("state");
    const view = searchParams.get("view");

    if (state === "empty" || state === "error" || state === "loading") return state;
    if (view === "map") return "map";
    return "results";
  }, [searchParams]);
  const resolvedMode = useMemo<SearchMode>(() => {
    if (initialMode !== "results") {
      return initialMode;
    }
    if (loadFailed) {
      return "error";
    }
    if (!initialResults.items.length) {
      return "empty";
    }
    return initialMode;
  }, [initialMode, initialResults.items.length, loadFailed]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  function handleModeChange(mode: SearchMode) {
    const params = new URLSearchParams(searchParams.toString());

    if (mode === "map") {
      params.set("view", "map");
      params.delete("state");
    } else {
      params.delete("view");
      params.delete("state");
    }

    const query = params.toString();
    router.push(query ? `/search?${query}` : "/search");
  }

  return (
    <MarketplaceShell>
      <SearchHeader onOpenFilters={() => setFiltersOpen(true)} />
      <SearchResultsLayout
        mode={resolvedMode}
        onModeChange={handleModeChange}
        onOpenFilters={() => setFiltersOpen(true)}
        results={initialResults}
      />
      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </MarketplaceShell>
  );
}
