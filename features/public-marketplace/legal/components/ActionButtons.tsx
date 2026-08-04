"use client";

import { CreditCardIcon, HeadphonesIcon } from "@/components/ui";

export function ActionButtons() {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="text-[15px] font-extrabold text-[#0F172A]">Actions</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#8B5CF6] text-[14px] font-extrabold text-[#5E2FE5] transition hover:bg-[#F7F3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
          onClick={() => window.print()}
          type="button"
        >
          <CreditCardIcon className="size-4" />
          Print or save PDF
        </button>
        <a
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#F59E0B] text-[14px] font-extrabold text-[#92400E] transition hover:bg-[#FFF7ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
          href="mailto:support@dar.example"
        >
          <HeadphonesIcon className="size-4" />
          Contact support
        </a>
      </div>
    </section>
  );
}
