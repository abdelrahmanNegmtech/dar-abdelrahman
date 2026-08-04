import Image from "next/image";
import { MapPinIcon } from "@/components/ui";

type DestinationCardProps = {
  imagePosition: string;
  imageSrc: string;
  price: string;
  title: string;
};

export function DestinationCard({
  imagePosition,
  imageSrc,
  price,
  title,
}: DestinationCardProps) {
  return (
    <article className="group relative min-h-[180px] overflow-hidden rounded-xl bg-[#0F172A] shadow-[0_14px_36px_rgba(15,23,42,0.12)]">
      <Image
        alt={`${title} destination`}
        className={`absolute inset-0 size-full object-cover ${imagePosition} transition duration-300 group-hover:scale-[1.03]`}
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        src={imageSrc}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.2)_45%,rgba(2,6,23,0.78)_100%)]" />

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <div className="flex items-center gap-2">
          <MapPinIcon className="size-5" />
          <h3 className="text-[18px] font-bold leading-6">{title}</h3>
        </div>
        <p className="mt-1 pl-7 text-[13px] font-semibold text-white/86">{price}</p>
      </div>
    </article>
  );
}
