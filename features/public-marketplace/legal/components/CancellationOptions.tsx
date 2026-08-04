import { CheckCircleIcon, InfoIcon } from "@/components/ui";

const options = [
  { border: "border-[#86EFAC]", label: "Flexible", text: "Full refund before the deadline.", tone: "text-[#16A34A]" },
  { border: "border-[#FDBA74]", label: "Moderate", text: "Partial refund after the deadline.", tone: "text-[#F97316]" },
  { border: "border-[#FCA5A5]", label: "Strict", text: "Limited refund for special listings.", tone: "text-[#EF4444]" },
];

const timeline = ["Booked", "Free cancellation deadline", "Partial refund window", "Check-in"];

export function CancellationOptions() {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="text-[16px] font-black text-[#0F172A]">Cancellation options</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <article className={`rounded-lg border p-3 ${option.border}`} key={option.label}>
            <CheckCircleIcon className={`size-4 ${option.tone}`} />
            <h3 className="mt-2 text-[13px] font-extrabold text-[#0F172A]">{option.label}</h3>
            <p className="mt-1 text-[12px] font-semibold leading-5 text-[#334155]">{option.text}</p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-[12px] font-medium leading-5 text-[#475569]">
        Egypt payment note: Manual refunds for InstaPay, Vodafone Cash, Fawry or bank transfer may take 1-3 business days after approval.
      </p>
      <div className="mt-5 grid grid-cols-4 gap-2 border-t border-dashed border-[#A78BFA] pt-4">
        {timeline.map((item) => (
          <div className="text-center" key={item}>
            <InfoIcon className="mx-auto size-5 text-[#5E2FE5]" />
            <p className="mt-2 text-[11px] font-extrabold leading-4 text-[#0F172A]">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
