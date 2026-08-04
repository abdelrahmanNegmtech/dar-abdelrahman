"use client";

import { HelpCircleIcon } from "./HelpCircleIcon";
import type { LegalFaq } from "../types";
import { useAccordion } from "../hooks/useAccordion";
import { HighlightText } from "./HighlightText";
import { ChevronDownIcon } from "@/components/ui";

type FAQSectionProps = {
  faqs: LegalFaq[];
  query: string;
};

export function FAQSection({ faqs, query }: FAQSectionProps) {
  const { openId, toggle } = useAccordion(faqs[0]?.id);

  return (
    <section className="mx-auto max-w-[1760px] px-5 pb-5 sm:px-8 lg:px-11" id="faq">
      <h2 className="text-[22px] font-black text-[#0F172A]">Frequently asked questions</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {faqs.map((faq) => {
          const open = openId === faq.id;
          const panelId = `${faq.id}-answer`;

          return (
            <article className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white" key={faq.id}>
              <button
                aria-controls={panelId}
                aria-expanded={open}
                className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left text-[13px] font-extrabold text-[#0F172A] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6C3DFF]"
                onClick={() => toggle(faq.id)}
                type="button"
              >
                <span className="inline-flex items-center gap-3">
                  <HelpCircleIcon />
                  <HighlightText query={query} text={faq.question} />
                </span>
                <ChevronDownIcon className={`size-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`} id={panelId}>
                <div className="overflow-hidden">
                  <p className="border-t border-[#E5E7EB] px-4 py-3 text-[12px] font-medium leading-5 text-[#475569]">
                    <HighlightText query={query} text={faq.answer} />
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
