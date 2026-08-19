"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MarketplaceShell } from "../../components/MarketplaceShell";
import { properties, SearchMode } from "../data";
import { filterAndSortProperties } from "../searchPipeline";
import { FiltersModal } from "./SearchFiltersModal";
import { SearchHeader } from "./SearchHeader";
import { SearchResultsLayout } from "./SearchResultsLayout";

export function SearchExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = useMemo<SearchMode>(() => {
    const state = searchParams.get("state");
    const view = searchParams.get("view");

    if (state === "empty" || state === "error" || state === "loading") return state;
    if (view === "map") return "map";
    return "results";
  }, [searchParams]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const filteredProperties = useMemo(() => filterAndSortProperties(properties, searchParams), [searchParams]);
  const destination = searchParams.get("destination") ?? "Madinaty";
  const queryKey = searchParams.toString();

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
      <SearchHeader key={`header-${queryKey}`} onOpenFilters={() => setFiltersOpen(true)} />
      <SearchResultsLayout
        destination={destination}
        key={`results-${queryKey}`}
        mode={initialMode}
        onModeChange={handleModeChange}
        onOpenFilters={() => setFiltersOpen(true)}
        properties={filteredProperties}
      />
      <FiltersModal key={`filters-${queryKey}`} open={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </MarketplaceShell>
  );
}
