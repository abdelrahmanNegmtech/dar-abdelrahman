import Link from "next/link";

type SectionHeaderProps = {
  actionLabel?: string;
  actionHref?: string;
  subtitle: string;
  title: string;
};

export function SectionHeader({
  actionLabel = "View all",
  actionHref = "/search",
  subtitle,
  title,
}: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-6">
      <div>
        <h2 className="text-[28px] font-bold leading-tight text-[#0F172A]">
          {title}
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-[#64748B]">{subtitle}</p>
      </div>
      <Link
        className="mt-2 shrink-0 text-[13px] font-semibold text-[#0F172A] underline decoration-[#0F172A]/40 underline-offset-4 transition hover:text-[#6C3DFF]"
        href={actionHref}
      >
        {actionLabel}
      </Link>
    </div>
  );
}
