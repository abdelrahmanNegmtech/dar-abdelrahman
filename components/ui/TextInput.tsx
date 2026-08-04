import type { InputHTMLAttributes, ReactNode } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  compact?: boolean;
  endIcon?: ReactNode;
  icon?: ReactNode;
  label: string;
};

export function TextInput({
  className = "",
  compact = false,
  endIcon,
  icon,
  id,
  label,
  ...props
}: TextInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-semibold text-[#0F172A]" htmlFor={id}>
        {label}
      </label>
      <div
        className={`group flex items-center rounded-xl border border-[#D8DEE8] bg-white text-[#64748B] transition duration-200 hover:border-slate-300 focus-within:border-[#6C3DFF] focus-within:ring-4 focus-within:ring-[#6C3DFF]/10 ${
          compact ? "h-[44px] gap-3 px-[14px]" : "h-[54px] gap-[14px] px-[18px]"
        }`}
      >
        {icon ? <span className="shrink-0 text-slate-500">{icon}</span> : null}
        <input
          className={`min-w-0 flex-1 bg-transparent text-[#0F172A] outline-none placeholder:text-[#64748B] ${
            compact ? "text-[14px]" : "text-[16px]"
          } ${className}`}
          id={id}
          {...props}
        />
        {endIcon ? <span className="shrink-0 text-slate-500">{endIcon}</span> : null}
      </div>
    </div>
  );
}
