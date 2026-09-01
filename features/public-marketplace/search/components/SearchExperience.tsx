"use client";

import type { PublicPropertyListResult } from "@/features/properties/data/public-property-queries";
import { MarketplaceShell } from "../../components/MarketplaceShell";
import { SearchHeader } from "./SearchHeader";
import { SearchResultsLayout } from "./SearchResultsLayout";

type SearchExperienceProps = { initialResults: PublicPropertyListResult; loadFailed?: boolean };

export function SearchExperience({ initialResults, loadFailed = false }: SearchExperienceProps) {
  return <MarketplaceShell><SearchHeader /><SearchResultsLayout loadFailed={loadFailed} results={initialResults} /></MarketplaceShell>;
}