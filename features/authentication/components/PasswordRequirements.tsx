import { CheckIcon } from "@/components/ui";

const requirements = [
  "At least 8 characters",
  "Include a number",
  "Include an uppercase letter",
];

export function PasswordRequirements({ activeChecks = [] }: { activeChecks?: boolean[] }) {
  return (
    <div className="grid gap-2 rounded-md bg-[#F3F4F6] px-2.5 py-2 text-[11px] font-medium text-[#334155] sm:grid-cols-3">
      {requirements.map((requirement, index) => {
        const active = activeChecks[index] ?? false;

        return (
          <div className={`flex items-center gap-1.5 ${active ? "text-[#16A34A]" : ""}`} key={requirement}>
            <span
              className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
                active ? "bg-[#22C55E] text-white" : "bg-white text-[#94A3B8] ring-1 ring-[#CBD5E1]"
              }`}
            >
              {active ? <CheckIcon className="size-3" /> : null}
            </span>
            <span className="whitespace-nowrap">{requirement}</span>
          </div>
        );
      })}
    </div>
  );
}
