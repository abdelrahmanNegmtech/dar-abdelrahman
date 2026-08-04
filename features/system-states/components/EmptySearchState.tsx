"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCwIcon } from "@/components/ui";
import { SearchEmptyIllustration } from "./StateIllustrations";

export function EmptySearchState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("state");
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-12 text-center shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
      <SearchEmptyIllustration />
      <h2 className="mt-5 text-[28px] font-black leading-tight text-[#080B1F]">No stays found.</h2>
      <p className="mx-auto mt-2 max-w-[430px] text-[15px] font-medium leading-6 text-[#475569]">
        Try changing your dates, filters or destination.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          className="h-10 rounded-full border border-[#CBD5E1] bg-white px-5 text-[13px] font-bold text-[#334155] transition hover:border-[#A78BFA] hover:bg-[#F7F3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
          onClick={() => updateParam("price")}
          type="button"
        >
          Remove price filter
        </button>
        <button
          className="h-10 rounded-full border border-[#CBD5E1] bg-white px-5 text-[13px] font-bold text-[#334155] transition hover:border-[#A78BFA] hover:bg-[#F7F3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
          onClick={() => updateParam("type", "hotels")}
          type="button"
        >
          Show hotels
        </button>
        <button
          className="h-10 rounded-full border border-[#CBD5E1] bg-white px-5 text-[13px] font-bold text-[#334155] transition hover:border-[#A78BFA] hover:bg-[#F7F3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
          onClick={() => updateParam("destination", "New Cairo")}
          type="button"
        >
          Expand to New Cairo
        </button>
      </div>
      <button
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#6C3DFF_0%,#5527D8_100%)] px-12 text-[15px] font-extrabold text-white shadow-[0_14px_28px_rgba(108,61,255,0.22)] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2 max-sm:w-full"
        onClick={() => router.push("/search")}
        type="button"
      >
        <RefreshCwIcon className="size-4" />
        Reset filters
      </button>
    </section>
  );
}
