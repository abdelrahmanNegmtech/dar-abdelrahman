import { ArrowRightIcon, InfoIcon } from "@/components/ui";
import type { QuickLink } from "../types";
import { HighlightText } from "./HighlightText";

type QuickLinksProps = {
  links: QuickLink[];
  query: string;
};

export function QuickLinks({ links, query }: QuickLinksProps) {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="text-[16px] font-black text-[#0F172A]">Quick links</h2>
      <div className="mt-3 space-y-1">
        {links.map((link) => (
          <a
            className="flex items-center justify-between rounded-lg px-1 py-2 text-[13px] font-bold text-[#334155] transition hover:bg-[#F8FAFC] hover:text-[#5E2FE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
            href={link.target}
            key={link.label}
          >
            <span className="inline-flex items-center gap-2">
              <InfoIcon className="size-4 text-[#5E2FE5]" />
              <HighlightText query={query} text={link.label} />
            </span>
            <ArrowRightIcon className="size-4" />
          </a>
        ))}
      </div>
    </section>
  );
}
