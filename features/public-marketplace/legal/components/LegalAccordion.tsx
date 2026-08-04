"use client";

import { ChevronDownIcon } from "@/components/ui";
import { HighlightText } from "./HighlightText";

type LegalAccordionProps = {
  body: string;
  id: string;
  onToggle: (id: string) => void;
  open: boolean;
  query: string;
  title: string;
};

export function LegalAccordion({ body, id, onToggle, open, query, title }: LegalAccordionProps) {
  const panelId = `${id}-panel`;

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6C3DFF]"
        onClick={() => onToggle(id)}
        type="button"
      >
        <span>
          <span className="block text-[14px] font-extrabold text-[#0F172A]">
            <HighlightText query={query} text={title} />
          </span>
          <span className="mt-1 block text-[12px] font-semibold leading-5 text-[#334155]">
            <HighlightText query={query} text={body} />
          </span>
        </span>
        <ChevronDownIcon
          className={`mt-1 size-4 shrink-0 text-[#0F172A] transition duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        id={panelId}
      >
        <div className="overflow-hidden">
          <p className="border-t border-[#E5E7EB] px-4 py-3 text-[13px] font-medium leading-6 text-[#475569]">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
