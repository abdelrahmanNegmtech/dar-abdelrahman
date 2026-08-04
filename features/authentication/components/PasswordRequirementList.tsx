import { CheckIcon } from "@/components/ui";

const requirements = [
  "At least 8 characters",
  "Include a number",
  "Include an uppercase letter",
  "Include a special character",
];

export function PasswordRequirementList() {
  return (
    <ul className="space-y-3">
      {requirements.map((requirement) => (
        <li className="flex items-center gap-3 text-[14px] leading-5 text-[#334155]" key={requirement}>
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#3AAA45] text-white">
            <CheckIcon className="size-3" />
          </span>
          <span>{requirement}</span>
        </li>
      ))}
    </ul>
  );
}
