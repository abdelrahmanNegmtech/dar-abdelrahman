"use client";

import { InfoIcon } from "@/components/ui";
import type { LegalPolicy } from "../types";
import { useAccordion } from "../hooks/useAccordion";
import { HighlightText } from "./HighlightText";
import { LegalAccordion } from "./LegalAccordion";

type LegalContentProps = {
  policies: LegalPolicy[];
  query: string;
};

export function LegalContent({ policies, query }: LegalContentProps) {
  const firstAccordion = policies.flatMap((policy) => policy.blocks).find((block) => block.type === "accordion");
  const { openId, toggle } = useAccordion(firstAccordion?.id);

  if (policies.length === 0) {
    return (
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
        <h2 className="text-[20px] font-black text-[#0F172A]">No matching policies found</h2>
        <p className="mt-2 text-[14px] font-medium text-[#64748B]">Try searching for refunds, payments, privacy or bookings.</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      {policies.map((policy) => (
        <section
          className="scroll-mt-28 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.04)]"
          id={policy.id}
          key={policy.id}
        >
          <div>
            <h2 className="text-[22px] font-black leading-tight text-[#0F172A]">
              <HighlightText query={query} text={policy.title} />
            </h2>
            <p className="mt-2 text-[13px] font-semibold leading-6 text-[#334155]">
              <HighlightText query={query} text={policy.summary} />
            </p>
          </div>

          <div className="mt-5 space-y-2">
            {policy.blocks.map((block) => {
              if (block.type === "accordion") {
                return (
                  <LegalAccordion
                    body={block.body}
                    id={block.id}
                    key={block.id}
                    onToggle={toggle}
                    open={openId === block.id}
                    query={query}
                    title={block.title}
                  />
                );
              }

              if (block.type === "list") {
                return (
                  <div className="rounded-lg border border-[#E5E7EB] bg-[#FBFCFF] p-4" key={block.id}>
                    <h3 className="text-[14px] font-extrabold text-[#0F172A]">
                      <HighlightText query={query} text={block.title} />
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {block.items.map((item) => (
                        <li className="flex gap-2 text-[13px] font-semibold leading-6 text-[#334155]" key={item}>
                          <span className="mt-2 size-1.5 rounded-full bg-[#5E2FE5]" />
                          <HighlightText query={query} text={item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

              const toneClass =
                block.tone === "warning"
                  ? "border-[#FED7AA] bg-[#FFF7ED] text-[#92400E]"
                  : block.tone === "info"
                    ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]"
                    : "border-[#DDD6FE] bg-[#F7F3FF] text-[#4C1D95]";

              return (
                <div className={`flex gap-3 rounded-lg border p-4 ${toneClass}`} key={block.id}>
                  <InfoIcon className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <h3 className="text-[14px] font-extrabold">
                      <HighlightText query={query} text={block.title} />
                    </h3>
                    <p className="mt-1 text-[13px] font-semibold leading-6">
                      <HighlightText query={query} text={block.body} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
