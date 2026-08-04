import type { ComponentType, SVGProps } from "react";

type ProcessStepCardProps = {
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  step: string;
  title: string;
};

export function ProcessStepCard({
  description,
  icon: Icon,
  step,
  title,
}: ProcessStepCardProps) {
  return (
    <article className="relative flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-5 py-6 text-center shadow-[0_12px_32px_rgba(15,23,42,0.05)] xl:min-h-[138px] xl:px-3 xl:py-5 2xl:min-h-[150px]">
      <div className="flex size-12 items-center justify-center rounded-full bg-[#F4F1FF] text-[#5E2FE5] xl:size-11">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-4 text-[15px] font-bold text-[#0F172A] xl:text-[13px] 2xl:text-[14px]">
        {step}. {title}
      </h3>
      <p className="mt-2 max-w-[190px] text-[13px] leading-5 text-[#64748B] xl:text-[11px] xl:leading-4 2xl:text-[12px] 2xl:leading-5">
        {description}
      </p>
    </article>
  );
}
