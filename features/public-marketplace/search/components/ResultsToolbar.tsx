"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { PublicPropertyListResult } from "@/features/properties/data/public-property-queries";

export function ResultsToolbar({ results }: { results: PublicPropertyListResult }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function changeSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") params.delete("sort"); else params.set("sort", value);
    params.delete("page");
    router.push(`/search${params.size ? `?${params}` : ""}`);
  }

  return <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-[26px] font-bold">Stays</h1><p className="mt-1 text-[15px] text-[#475569]">{results.totalCount} {results.totalCount === 1 ? "published stay" : "published stays"}</p></div><label className="text-[13px] font-semibold text-[#475569]">Sort by<select className="ml-2 h-10 rounded-lg border border-[#D8DEE8] bg-white px-3 text-[#0F172A]" onChange={(event) => changeSort(event.target.value)} value={results.sort}><option value="newest">Newest</option><option value="price_asc">Price low to high</option><option value="price_desc">Price high to low</option></select></label></div>;
}