import { HeadphonesIcon, ShieldIcon } from "@/components/ui";

export function SupportCard() {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 lg:sticky lg:top-24">
      <h2 className="text-[17px] font-black text-[#0F172A]">Need help understanding a policy?</h2>
      <p className="mt-3 text-[13px] font-medium leading-6 text-[#334155]">
        Our support team is here to help you with any questions.
      </p>
      <div className="mt-5 space-y-3">
        <a
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] text-[14px] font-extrabold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
          href="mailto:support@dar.example"
        >
          <HeadphonesIcon className="size-5" />
          Contact DAR support
        </a>
        <a
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#F59E0B] text-[14px] font-extrabold text-[#0F172A] transition hover:bg-[#FFF7ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
          href="#faq"
        >
          <ShieldIcon className="size-5" />
          Open dispute center
        </a>
      </div>
    </section>
  );
}
