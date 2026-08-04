import type { ComponentType, SVGProps } from "react";

type MarketplaceFeatureCardProps = {
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
};

export function MarketplaceFeatureCard({
  description,
  icon: Icon,
  title,
}: MarketplaceFeatureCardProps) {
  return (
    <article className="flex min-h-[92px] items-center gap-4 border-[#E5E7EB] bg-white px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition duration-200 hover:bg-[#FAFAFF] md:border-r md:border-b xl:border-b-0">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#D8CCFF] bg-[#FAF8FF] text-[#5E2FE5]">
        <Icon className="size-5" />
      </span>
      <span>
        <h3 className="text-[13px] font-bold leading-5 text-[#0F172A] 2xl:text-[14px]">
          {title}
        </h3>
        <p className="mt-1 text-[12px] leading-5 text-[#64748B]">
          {description}
        </p>
      </span>
    </article>
  );
}
