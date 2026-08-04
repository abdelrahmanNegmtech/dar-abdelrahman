import Image from "next/image";
import { propertyGalleryPhotos } from "../data";

type GalleryThumbnailStripProps = {
  activeIndex: number;
  onSelect: (index: number) => void;
  photos: typeof propertyGalleryPhotos;
};

export function GalleryThumbnailStrip({ activeIndex, onSelect, photos }: GalleryThumbnailStripProps) {
  return (
    <section className="-mx-4 mt-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Gallery thumbnails">
      <div className="flex min-w-max gap-3 pb-1">
        {photos.slice(0, 9).map((photo, index) => (
          <button
            aria-label={`Show ${photo.label}`}
            className={`relative h-[72px] w-[104px] overflow-hidden rounded-lg border-2 bg-[#E5E7EB] shadow-[0_8px_16px_rgba(15,23,42,0.08)] sm:h-[82px] sm:w-[122px] ${
              index === activeIndex ? "border-[#5E2FE5] ring-2 ring-[#5E2FE5]/18" : "border-transparent"
            }`}
            key={photo.label}
            onClick={() => onSelect(index)}
            type="button"
          >
            <Image
              alt={photo.label}
              className={`absolute inset-0 size-full object-cover ${photo.position}`}
              fill
              sizes="130px"
              src={photo.src}
            />
          </button>
        ))}
        <button
          aria-label="Show more gallery photos"
          className="grid h-[72px] w-[104px] place-items-center rounded-lg bg-[#0B1020] text-[14px] font-bold text-white shadow-[0_8px_16px_rgba(15,23,42,0.12)] sm:h-[82px] sm:w-[122px]"
          type="button"
        >
          +14 more
        </button>
      </div>
    </section>
  );
}
