import Image from "next/image";
import Link from "next/link";

type RecommendationCardProps = {
  imagePosition: string;
  imageSrc: string;
  location: string;
  price: string;
  rating: string;
  slug?: string;
  title: string;
};

export function RecommendationCard({
  imagePosition,
  imageSrc,
  location,
  price,
  rating,
  slug,
  title,
}: RecommendationCardProps) {
  const card = (
    <article className="group relative min-h-[250px] overflow-hidden rounded-xl bg-[#0F172A] shadow-[0_18px_42px_rgba(15,23,42,0.14)] xl:min-h-[186px] 2xl:min-h-[205px]">
      <Image
        alt={`${title} in ${location}`}
        className={`absolute inset-0 size-full object-cover ${imagePosition} transition duration-300 group-hover:scale-[1.03]`}
        fill
        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
        src={imageSrc}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02)_0%,rgba(2,6,23,0.32)_45%,rgba(2,6,23,0.86)_100%)]" />

      <div className="absolute right-3 top-3 rounded-md bg-white px-2.5 py-1 text-[12px] font-bold text-[#0F172A] shadow-[0_8px_20px_rgba(2,6,23,0.18)]">
        <span className="text-[#F4B744]">★</span> {rating}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white xl:p-3.5 2xl:p-4">
        <h3 className="text-[16px] font-bold leading-6 xl:text-[13px] xl:leading-5 2xl:text-[14px]">
          {title}
        </h3>
        <p className="mt-1 text-[13px] text-white/78 xl:text-[11px] 2xl:text-[12px]">
          {location}
        </p>
        <p className="mt-3 text-[14px] font-bold xl:mt-2 xl:text-[12px] 2xl:text-[13px]">
          {price}
        </p>
      </div>
    </article>
  );

  return slug ? (
    <Link aria-label={`View ${title}`} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2" href={`/stays/${slug}`}>
      {card}
    </Link>
  ) : card;
}
