import { MailIcon, PhoneIcon } from "@/components/ui";

export type RegistrationMethod = "email" | "phone";

type AuthSegmentedControlProps = {
  onChange: (method: RegistrationMethod) => void;
  value: RegistrationMethod;
};

export function AuthSegmentedControl({ onChange, value }: AuthSegmentedControlProps) {
  const activeClassName =
    "bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] text-white shadow-sm";
  const inactiveClassName = "text-[#64748B] hover:shadow-sm";

  return (
    <div className="grid h-[44px] grid-cols-2 rounded-md border border-[#D8DEE8] bg-white p-0.5">
      <button
        aria-pressed={value === "email"}
        className={`inline-flex items-center justify-center gap-2 rounded-[5px] text-sm font-bold transition-shadow ${value === "email" ? activeClassName : inactiveClassName}`}
        onClick={() => onChange("email")}
        type="button"
      >
        <MailIcon className="size-4" />
        Email
      </button>
      <button
        aria-pressed={value === "phone"}
        className={`inline-flex items-center justify-center gap-2 rounded-[5px] text-sm font-bold transition-shadow ${value === "phone" ? activeClassName : inactiveClassName}`}
        onClick={() => onChange("phone")}
        type="button"
      >
        <PhoneIcon className="size-4" />
        Phone
      </button>
    </div>
  );
}
