import type { PublicPropertyListResult } from "@/features/properties/data/public-property-queries";
import { EmptySearchState, SearchErrorState } from "@/features/system-states";
import { FilterSidebar } from "./FilterSidebar";
import { ResultsToolbar } from "./ResultsToolbar";
import { PropertyResultsGrid } from "./PropertyResultsGrid";

type SearchResultsLayoutProps = {
  loadFailed?: boolean;
  results: PublicPropertyListResult;
};

export function SearchResultsLayout({ loadFailed = false, results }: SearchResultsLayoutProps) {
  return <section className="mx-auto grid max-w-[1880px] grid-cols-1 gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:px-9"><FilterSidebar /><div className="min-w-0"><ResultsToolbar results={results} /><div className="mt-5">{loadFailed ? <SearchErrorState /> : results.items.length ? <PropertyResultsGrid results={results} /> : <EmptySearchState />}</div></div></section>;
}