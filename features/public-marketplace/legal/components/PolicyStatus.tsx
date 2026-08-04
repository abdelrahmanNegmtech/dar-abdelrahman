import { CheckCircleIcon } from "@/components/ui";
import { policyStatus } from "../data";

export function PolicyStatus() {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="text-[16px] font-black text-[#0F172A]">Policy status</h2>
      <ul className="mt-4 space-y-4">
        {policyStatus.map((status) => (
          <li className="flex gap-3" key={status}>
            <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-[#16A34A]" />
            <div>
              <p className="text-[13px] font-extrabold text-[#0F172A]">{status}</p>
              <p className="mt-1 text-[12px] font-medium leading-5 text-[#64748B]">
                {status === "Guest protection active"
                  ? "24/7 support and dispute resolution"
                  : status === "Secure payment tracking"
                    ? "All payments are monitored"
                    : "Listings reviewed before publishing"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
