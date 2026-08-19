"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDownIcon,
  GridIcon,
  ListIcon,
  MapIcon,
  SearchIcon,
  ShieldIcon,
  SlidersIcon,
} from "../icons";
import { SearchMode } from "../data";

type ResultsToolbarProps = {
  count: number;
  destination: string;
  mapMode?: boolean;
  onModeChange: (mode: SearchMode) => void;
  onOpenFilters: () => void;
};

export function ResultsToolbar({
  count,
  destination,
  mapMode = false,
  onModeChange,
  onOpenFilters,
}: ResultsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortRef = useRef<HTMLDivElement>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const viewMode = searchParams.get("layout") === "list" ? "list" : "grid";
  const sortValue = searchParams.get("sort") ?? "recommended";
  const sortLabels: Record<string, string> = { recommended: "Recommended", "price-asc": "Price: Low to High", "price-desc": "Price: High to Low", rating: "Top Rated" };

  useEffect(() => {
    function dismiss(event: PointerEvent) { if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false); }
    function dismissKey(event: KeyboardEvent) { if (event.key === "Escape") setSortOpen(false); }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismissKey);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", dismissKey); };
  }, []);

  function updateParam(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "recommended" || value === "grid") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/search?${params.toString()}`, { scroll: false });
  }

  function changeMode(mode: SearchMode) {
    onModeChange(mode);
  }

  return (
    <div>
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 shrink">
          <h1 className="text-[26px] font-bold leading-tight xl:text-[28px]">
            {mapMode ? `Map search in ${destination}` : destination && destination !== "Any location" ? `Stays in ${destination}` : "Explore stays"}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-[15px] text-[#475569]">
            {count} verified {count === 1 ? "place" : "places"} available
            <ShieldIcon className="size-4 text-[#5A30E8]" />
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
          <button
            aria-disabled="true"
            className="inline-flex h-11 cursor-default items-center gap-2 rounded-lg border border-[#A78BFA] bg-white px-4 text-[13px] font-bold text-[#5A30E8]"
            title="AI Smart Match is not available yet"
            type="button"
          >
            <SearchIcon className="size-4" />
            AI Smart match
          </button>
          <div className="inline-flex h-11 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-1">
            <button
            className={`flex size-9 items-center justify-center rounded-md ${
                !mapMode && viewMode === "grid" ? "bg-[#5A30E8] text-white" : "text-[#0F172A]"
              }`}
              aria-label="Show grid view"
              onClick={() => { updateParam("layout", "grid"); changeMode("results"); }}
              type="button"
            >
              <GridIcon className="size-5" />
            </button>
            <button
              aria-label="Show list view"
              className={`flex size-9 items-center justify-center rounded-md ${viewMode === "list" ? "bg-[#5A30E8] text-white" : "text-[#0F172A]"}`}
              onClick={() => updateParam("layout", "list")}
              type="button"
            >
              <ListIcon className="size-5" />
            </button>
          </div>
          <button
            aria-label="Show map view"
            className={`inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-[13px] font-bold ${
              mapMode
                ? "border-[#5A30E8] bg-[#F4F1FF] text-[#5A30E8]"
                : "border-[#E5E7EB] bg-white text-[#0F172A]"
            }`}
            onClick={() => changeMode("map")}
            type="button"
          >
            <MapIcon className="size-5" />
            Map
          </button>
          <button
            className={`inline-flex h-11 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-5 text-[14px] font-bold text-[#0F172A] ${
              mapMode ? "min-[1700px]:hidden" : "lg:hidden"
            }`}
            onClick={onOpenFilters}
            type="button"
          >
            <SlidersIcon className="size-5" />
            Show filters
          </button>
          <div className="relative" ref={sortRef}>
            <button
              aria-expanded={sortOpen}
              aria-label="Sort search results"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold"
              onClick={() => setSortOpen((current) => !current)}
              type="button"
            >
              Sort by: <strong>{sortLabels[sortValue] ?? "Recommended"}</strong>
              <ChevronDownIcon className="size-4" />
            </button>
            {sortOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-[0_16px_35px_rgba(15,23,42,0.14)]">
                {Object.entries(sortLabels).map(([value, label]) => (
                  <button className="block w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-[#F7F5FF]" key={value} onClick={() => { updateParam("sort", value); setSortOpen(false); }} type="button">
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {mapMode ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {["Price under EGP 1,500", "Verified only", "Instant booking", "Wi-Fi", "Parking", "Balcony"].map(
            (filter) => (
              <span
                className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-medium"
                key={filter}
              >
                {filter}
              </span>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
