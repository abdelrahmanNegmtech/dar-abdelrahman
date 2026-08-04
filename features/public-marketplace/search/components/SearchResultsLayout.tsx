import { SearchMode } from "../data";
import { EmptySearchState, SearchErrorState, SearchResultsSkeleton } from "@/features/system-states";
import { FilterSidebar } from "./FilterSidebar";
import { MapPanel } from "./MapPanel";
import { ResultsToolbar } from "./ResultsToolbar";
import { PropertyResultsGrid } from "./PropertyResultsGrid";

type SearchResultsLayoutProps = {
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  onOpenFilters: () => void;
};

export function SearchResultsLayout({
  mode,
  onModeChange,
  onOpenFilters,
}: SearchResultsLayoutProps) {
  const statePanel =
    mode === "empty" ? (
      <EmptySearchState />
    ) : mode === "error" ? (
      <SearchErrorState />
    ) : mode === "loading" ? (
      <SearchResultsSkeleton />
    ) : null;

  if (mode === "map") {
    return (
      <section className="mx-auto grid max-w-[1880px] grid-cols-1 xl:grid-cols-[minmax(520px,700px)_minmax(560px,1fr)] 2xl:grid-cols-[minmax(620px,780px)_minmax(720px,1fr)]">
        <div className="min-h-[calc(100dvh-158px)] min-w-0 border-r border-[#E5E7EB] px-5 py-6 sm:px-7 xl:px-8">
          <ResultsToolbar
            mapMode
            onModeChange={onModeChange}
            onOpenFilters={onOpenFilters}
          />
          <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 min-[1700px]:grid-cols-[260px_minmax(0,1fr)] xl:gap-5">
            <div className="hidden min-[1700px]:block">
              <FilterSidebar compact />
            </div>
            <PropertyResultsGrid compact />
          </div>
        </div>
        <MapPanel focused />
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-[1880px] grid-cols-1 gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)] 2xl:px-9">
      <FilterSidebar />

      <div className="min-w-0">
        <ResultsToolbar onModeChange={onModeChange} onOpenFilters={onOpenFilters} />
        <div className="mt-5 grid min-w-0 gap-5 min-[1360px]:grid-cols-[minmax(620px,1fr)_minmax(380px,420px)] 2xl:grid-cols-[minmax(720px,1fr)_minmax(410px,460px)]">
          <div className="min-w-0">{statePanel ?? <PropertyResultsGrid />}</div>
          <aside className="hidden min-w-0 min-[1360px]:block">
            <MapPanel />
          </aside>
        </div>
      </div>
    </section>
  );
}
