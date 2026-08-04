import type { InputHTMLAttributes } from "react";
import { CheckIcon } from "./icons";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  id: string;
  label: string;
};

export function Checkbox({ id, label, ...props }: CheckboxProps) {
  const isControlled = props.checked !== undefined;

  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-[#0F172A]" htmlFor={id}>
      <span className="relative flex size-5 items-center justify-center">
        <input
          className="peer size-5 appearance-none rounded-md border border-[#E5E7EB] bg-white transition duration-200 checked:border-[#6C3DFF] checked:bg-[#6C3DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
          defaultChecked={isControlled ? undefined : true}
          id={id}
          type="checkbox"
          {...props}
        />
        <CheckIcon className="pointer-events-none absolute size-3.5 text-white opacity-0 transition peer-checked:opacity-100" />
      </span>
      {label}
    </label>
  );
}
