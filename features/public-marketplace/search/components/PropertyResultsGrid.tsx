"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { PublicPropertyListResult } from "@/features/properties/data/public-property-queries";
import { SearchPropertyCard } from "./SearchPropertyCard";

type PropertyResultsGridProps = {
  compact?: boolean;
  results: PublicPropertyListResult;
};

export function PropertyResultsGrid({ compact = false, results }: PropertyResultsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const visibleProperties = compact ? results.items.slice(0, 3) : results.items;

  function updatePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <>
      <div
        className={
          compact
            ? "grid min-w-0 items-stretch gap-4"
            : "grid min-w-0 items-stretch gap-5 md:grid-cols-2"
        }
      >
        {visibleProperties.map((property) => (
          <SearchPropertyCard compact={compact} key={property.slug} property={property} />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button className="h-9 rounded-lg border border-[#E5E7EB] px-5 text-[13px]" disabled={results.page <= 1} onClick={() => updatePage(Math.max(1, results.page - 1))} type="button">
          Previous
        </button>
        {Array.from({ length: results.pageCount }, (_, index) => index + 1).map((item) => (
          <button
            className={`size-9 rounded-lg border text-[14px] font-bold ${
              item === results.page
                ? "border-[#5A30E8] bg-[#5A30E8] text-white"
                : "border-[#E5E7EB] bg-white text-[#0F172A]"
            }`}
            key={item}
            onClick={() => updatePage(item)}
            type="button"
          >
            {item}
          </button>
        ))}
        <button className="h-9 rounded-lg border border-[#E5E7EB] px-5 text-[13px]" disabled={results.page >= results.pageCount} onClick={() => updatePage(Math.min(results.pageCount, results.page + 1))} type="button">
          Next
        </button>
      </div>
    </>
  );
}
