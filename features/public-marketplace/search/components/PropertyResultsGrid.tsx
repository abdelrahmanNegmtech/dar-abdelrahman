"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchProperty } from "../data";
import { SearchPropertyCard } from "./SearchPropertyCard";

type PropertyResultsGridProps = {
  compact?: boolean;
  properties: SearchProperty[];
};

const PAGE_SIZE = 6;

export function PropertyResultsGrid({ compact = false, properties }: PropertyResultsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const pageCount = Math.max(1, Math.ceil(properties.length / PAGE_SIZE));
  const page = Number.isInteger(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const listView = searchParams.get("layout") === "list";
  const visibleProperties = compact
    ? properties.slice(0, 3)
    : properties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (compact || requestedPage === page) return;
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) params.delete("page");
    else params.set("page", String(page));
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [compact, page, requestedPage, router, searchParams]);

  function changePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage === 1) params.delete("page");
    else params.set("page", String(nextPage));
    router.push(`/search?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className={compact || listView ? "grid min-w-0 items-stretch gap-4" : "grid min-w-0 items-stretch gap-5 md:grid-cols-2"}>
        {visibleProperties.map((property) => (
          <SearchPropertyCard compact={compact} key={property.id} list={listView} property={property} />
        ))}
      </div>

      {!compact && properties.length > 0 ? (
        <nav aria-label="Search result pages" className="mt-5 flex items-center justify-center gap-3">
          <button className="h-9 rounded-lg border border-[#E5E7EB] px-5 text-[13px] disabled:cursor-not-allowed disabled:opacity-45" disabled={page === 1} onClick={() => changePage(page - 1)} type="button">Previous</button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
            <button aria-current={item === page ? "page" : undefined} className={`size-9 rounded-lg border text-[14px] font-bold ${item === page ? "border-[#5A30E8] bg-[#5A30E8] text-white" : "border-[#E5E7EB] bg-white text-[#0F172A]"}`} key={item} onClick={() => changePage(item)} type="button">{item}</button>
          ))}
          <button className="h-9 rounded-lg border border-[#E5E7EB] px-5 text-[13px] disabled:cursor-not-allowed disabled:opacity-45" disabled={page === pageCount} onClick={() => changePage(page + 1)} type="button">Next</button>
        </nav>
      ) : null}
    </>
  );
}
