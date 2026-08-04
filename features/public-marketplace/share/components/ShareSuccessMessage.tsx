import { CheckCircleIcon } from "@/components/ui";

type ShareSuccessMessageProps = {
  description: string;
  title: string;
  tone?: "success" | "error" | "info";
};

export function ShareSuccessMessage({ description, title, tone = "success" }: ShareSuccessMessageProps) {
  const toneClasses = {
    error: "border-red-100 bg-red-50 text-red-700",
    info: "border-[#E9E5FF] bg-[#F7F5FF] text-[#5E2FE5]",
    success: "border-[#D8F6E7] bg-[#F0FDF7] text-[#047857]",
  };

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${toneClasses[tone]}`}>
      <CheckCircleIcon className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="text-[14px] font-bold">{title}</p>
        <p className="mt-0.5 text-[13px] leading-5 opacity-80">{description}</p>
      </div>
    </div>
  );
}
