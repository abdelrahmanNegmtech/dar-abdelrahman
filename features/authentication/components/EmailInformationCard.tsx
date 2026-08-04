import { MailIcon } from "@/components/ui";

export function EmailInformationCard() {
  return (
    <section className="flex gap-4 rounded-xl border border-[#E9E5FF] bg-[#F7F5FF] px-5 py-5 text-left">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#4F32CC] shadow-sm">
        <MailIcon className="size-6" />
      </div>
      <div>
        <h2 className="text-[16px] font-bold text-[#0F172A]">
          Can&apos;t find the email?
        </h2>
        <p className="mt-1 text-[16px] leading-6 text-[#334155]">
          Check your spam or promotions folder. Sometimes our emails end up
          there.
        </p>
      </div>
    </section>
  );
}
