import { ShieldIcon } from "@/components/ui";

export function SecurityCard() {
  return (
    <section
      aria-label="Security information"
      className="flex items-center gap-5 rounded-xl border border-[#E9E5FF] bg-[#F7F5FF] px-5 py-[22px]"
    >
      <div className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] text-white shadow-[0_14px_30px_rgba(108,61,255,0.28)]">
        <ShieldIcon className="size-6" />
      </div>
      <div>
        <h2 className="text-[14px] font-bold text-[#0F172A]">
          Your security is our priority
        </h2>
        <p className="mt-1 text-[14px] leading-6 text-[#64748B]">
          We use industry-standard encryption to keep your data safe.
        </p>
      </div>
    </section>
  );
}
