import { HouseIcon, UserIcon } from "@/components/ui";
import type { AccountType } from "../../authTypes";

const accountTypes: Array<{
  description: string;
  icon: typeof UserIcon;
  title: string;
  value: AccountType;
}> = [
  {
    description: "Book stays and manage trips.",
    icon: UserIcon,
    title: "Guest",
    value: "guest",
  },
  {
    description: "List properties and receive bookings.",
    icon: HouseIcon,
    title: "Owner",
    value: "owner",
  },
];

type AccountTypeSelectorProps = {
  onChange: (value: AccountType) => void;
  value: AccountType;
};

export function AccountTypeSelector({ onChange, value }: AccountTypeSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {accountTypes.map((type) => {
        const Icon = type.icon;
        const isActive = type.value === value;

        return (
          <button
            aria-pressed={isActive}
            className={`relative flex min-h-[116px] items-center gap-4 rounded-lg border p-4 text-left transition ${
              isActive
                ? "border-[#6C3DFF] bg-white shadow-[0_10px_24px_rgba(108,61,255,0.08)]"
                : "border-[#E5E7EB] bg-white hover:border-[#D8DEE8]"
            }`}
            key={type.title}
            onClick={() => onChange(type.value)}
            type="button"
          >
            <span
              className={`absolute left-3 top-3 size-3.5 rounded-full border ${
                isActive
                  ? "border-[#6C3DFF] bg-[#6C3DFF] shadow-[inset_0_0_0_3px_white]"
                  : "border-[#CBD5E1]"
              }`}
            />
            <span
              className={`flex size-[44px] shrink-0 items-center justify-center rounded-full border ${
                isActive
                  ? "border-[#8B5CF6] bg-[#F6F1FF] text-[#6C3DFF]"
                  : "border-[#FDBA74] bg-[#FFF7ED] text-[#F59E0B]"
              }`}
            >
              <Icon className="size-6" />
            </span>
            <span>
              <span className="block text-[15px] font-bold text-[#0F172A]">
                {type.title}
              </span>
              <span className="mt-1 block text-[13px] leading-5 text-[#64748B]">
                {type.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
