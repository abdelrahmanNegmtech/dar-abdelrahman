"use client";

import { useState } from "react";
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
  mapMode?: boolean;
  onModeChange: (mode: SearchMode) => void;
  onOpenFilters: () => void;
};

export function ResultsToolbar({
  mapMode = false,
  onModeChange,
  onOpenFilters,
}: ResultsToolbarProps) {
  const [smartMatch, setSmartMatch] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState("Recommended");

  function changeMode(mode: SearchMode) {
    onModeChange(mode);
  }

  return (
    <div>
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 shrink">
          <h1 className="text-[26px] font-bold leading-tight xl:text-[28px]">
            {mapMode ? "Map search in Madinaty" : "Stays in Madinaty"}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-[15px] text-[#475569]">
            128 verified places available
            <ShieldIcon className="size-4 text-[#5A30E8]" />
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
          <button
            aria-pressed={smartMatch}
            className={`inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-[13px] font-bold ${smartMatch ? "border-[#5A30E8] bg-[#F4F1FF] text-[#5A30E8]" : "border-[#A78BFA] bg-white text-[#5A30E8]"}`}
            onClick={() => setSmartMatch((current) => !current)}
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
              onClick={() => { setViewMode("grid"); changeMode("results"); }}
              type="button"
            >
              <GridIcon className="size-5" />
            </button>
            <button
              aria-label="Show list view"
              className={`flex size-9 items-center justify-center rounded-md ${viewMode === "list" ? "bg-[#5A30E8] text-white" : "text-[#0F172A]"}`}
              onClick={() => setViewMode("list")}
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
          <div className="relative">
            <button
              aria-expanded={sortOpen}
              aria-label="Sort search results"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold"
              onClick={() => setSortOpen((current) => !current)}
              type="button"
            >
              Sort by: <strong>{sort}</strong>
              <ChevronDownIcon className="size-4" />
            </button>
            {sortOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-[0_16px_35px_rgba(15,23,42,0.14)]">
                {["Recommended", "Price low to high", "Top rated"].map((option) => (
                  <button className="block w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-[#F7F5FF]" key={option} onClick={() => { setSort(option); setSortOpen(false); }} type="button">
                    {option}
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
