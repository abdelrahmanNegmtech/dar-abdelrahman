"use client";

import { SearchIcon } from "@/components/ui";

type LegalSearchProps = {
  onChange: (value: string) => void;
  value: string;
};

export function LegalSearch({ onChange, value }: LegalSearchProps) {
  return (
    <form
      aria-label="Search legal policies"
      className="flex w-full flex-col gap-3 sm:flex-row"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search policies and legal information</span>
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#64748B]" />
        <input
          className="h-12 w-full rounded-lg border border-[#D8DEE8] bg-white pl-12 pr-4 text-[14px] font-medium text-[#0F172A] shadow-[0_8px_22px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-[#64748B] focus:border-[#6C3DFF] focus:ring-4 focus:ring-[#6C3DFF]/10"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search policies, refunds, payments, cancellations..."
          type="search"
          value={value}
        />
      </label>
      <button
        className="h-12 rounded-lg bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] px-7 text-[14px] font-bold text-white shadow-[0_14px_28px_rgba(108,61,255,0.24)] transition hover:brightness-95 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2 sm:w-[108px]"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}
