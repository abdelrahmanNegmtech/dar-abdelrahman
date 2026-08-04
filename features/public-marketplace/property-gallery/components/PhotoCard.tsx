import Image from "next/image";

type PhotoCardProps = {
  category: string;
  label: string;
  position: string;
  src: string;
  viewMode: "day" | "night";
};

export function PhotoCard({ category, label, position, src, viewMode }: PhotoCardProps) {
  return (
    <article className="group relative min-h-[138px] overflow-hidden rounded-xl bg-[#E5E7EB] shadow-[0_10px_22px_rgba(15,23,42,0.08)] sm:min-h-[170px] lg:min-h-[190px]">
      <Image
        alt={label}
        className={`absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-[1.03] ${position} ${viewMode === "night" ? "brightness-[0.82] saturate-[1.2]" : ""}`}
        fill
        sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 50vw"
        src={src}
      />
      <span className="absolute left-3 top-3 rounded-md bg-white px-3 py-1.5 text-[11px] font-bold text-[#0B1020] shadow-[0_8px_16px_rgba(15,23,42,0.12)]">
        {category}
      </span>
    </article>
  );
}
