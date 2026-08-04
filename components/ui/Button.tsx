import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] text-white shadow-[0_16px_30px_rgba(108,61,255,0.28)] hover:brightness-95 active:scale-[0.99]",
  secondary: "bg-[#EEF2FF] text-[#4F35D9] hover:bg-[#E3E7FF]",
  ghost: "bg-transparent text-[#0F172A] hover:bg-slate-100",
  outline:
    "border border-[#E5E7EB] bg-white text-[#0F172A] shadow-[0_3px_8px_rgba(15,23,42,0.06)] hover:border-[#cfd5df] hover:bg-slate-50 active:scale-[0.99]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-[52px] px-5 text-sm",
  lg: "h-[54px] px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export function Button({
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-3 rounded-xl font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
