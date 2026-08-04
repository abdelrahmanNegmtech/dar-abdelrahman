import type { ComponentType, SVGProps } from "react";

type ShareActionButtonProps = {
  color: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
  selected?: boolean;
};

export function ShareActionButton({ color, icon: Icon, label, onClick, selected = false }: ShareActionButtonProps) {
  return (
    <button
      aria-label={`Share on ${label}`}
      aria-pressed={selected}
      className={`group flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border bg-white px-2 text-center transition duration-200 hover:-translate-y-0.5 hover:border-[#C4B5FD] hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none ${
        selected ? "border-[#6C3DFF] shadow-[0_0_0_3px_rgba(108,61,255,0.10)]" : "border-[#E5E7EB]"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className={`grid size-11 place-items-center rounded-full ${color}`}>
        <Icon className="size-5" />
      </span>
      <span className="text-[12px] font-bold text-[#0F172A]">{label}</span>
    </button>
  );
}
