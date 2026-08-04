import { BuildingIcon, CreditCardIcon, ShieldIcon, SmartphoneIcon } from "@/components/ui";

const providers = ["Card", "Meeza", "InstaPay", "Vodafone Cash", "Fawry", "Bank transfer", "Pay on arrival"];

export function PaymentPolicy() {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="text-[16px] font-black text-[#0F172A]">Payment & commission policy</h2>
      <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
        {providers.map((provider, index) => {
          const Icon = index % 3 === 0 ? CreditCardIcon : index % 3 === 1 ? SmartphoneIcon : BuildingIcon;
          return (
            <div className="text-center" key={provider}>
              <Icon className="mx-auto size-6 text-[#0F172A]" />
              <p className="mt-2 text-[11px] font-extrabold leading-4 text-[#334155]">{provider}</p>
            </div>
          );
        })}
      </div>
      <ul className="mt-4 space-y-2 text-[12px] font-semibold leading-5 text-[#334155]">
        <li className="flex gap-2">
          <ShieldIcon className="size-4 shrink-0 text-[#5E2FE5]" />
          DAR service fee and owner commission are shown before confirmation.
        </li>
        <li className="flex gap-2">
          <ShieldIcon className="size-4 shrink-0 text-[#5E2FE5]" />
          Owner payouts may be held until check-in confirmation.
        </li>
      </ul>
    </section>
  );
}
