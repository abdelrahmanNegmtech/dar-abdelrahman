"use client";

import { useMemo, useState } from "react";
import { properties } from "../data";
import { SearchPropertyCard } from "./SearchPropertyCard";

type PropertyResultsGridProps = {
  compact?: boolean;
};

export function PropertyResultsGrid({ compact = false }: PropertyResultsGridProps) {
  const [page, setPage] = useState(1);
  const visibleProperties = useMemo(() => {
    const rotated = [...properties.slice(page - 1), ...properties.slice(0, page - 1)];
    return compact ? rotated.slice(0, 3) : rotated;
  }, [compact, page]);

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
          <SearchPropertyCard compact={compact} key={property.id} property={property} />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button className="h-9 rounded-lg border border-[#E5E7EB] px-5 text-[13px]" onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">
          Previous
        </button>
        {[1, 2, 3].map((item) => (
          <button
            className={`size-9 rounded-lg border text-[14px] font-bold ${
              item === page
                ? "border-[#5A30E8] bg-[#5A30E8] text-white"
                : "border-[#E5E7EB] bg-white text-[#0F172A]"
            }`}
            key={item}
            onClick={() => setPage(item)}
            type="button"
          >
            {item}
          </button>
        ))}
        <button className="h-9 rounded-lg border border-[#E5E7EB] px-5 text-[13px]" onClick={() => setPage((current) => Math.min(3, current + 1))} type="button">
          Next
        </button>
      </div>
    </>
  );
}
