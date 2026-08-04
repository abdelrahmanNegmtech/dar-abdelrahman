import Image from "next/image";
import { CameraIcon, ExpandIcon, SearchIcon } from "@/components/ui";
import { propertyGalleryPhotos } from "../data";
import { GalleryNavigation } from "./GalleryNavigation";

type HeroGalleryViewerProps = {
  activeIndex: number;
  photo: (typeof propertyGalleryPhotos)[number];
  total: number;
  viewMode: "day" | "night";
  onFullscreen: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onZoom: () => void;
};

export function HeroGalleryViewer({ activeIndex, photo, total, viewMode, onFullscreen, onNext, onPrevious, onZoom }: HeroGalleryViewerProps) {
  return (
    <section className="relative overflow-hidden rounded-xl bg-[#111827] shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
      <div className="flex snap-x snap-mandatory overflow-x-auto md:block md:overflow-hidden">
        {[photo].map((item, index) => (
          <div className="relative h-[330px] min-w-full snap-center sm:h-[460px] lg:h-[560px] xl:h-[610px]" key={item.label}>
            <Image
              alt={item.label}
              className={`absolute inset-0 size-full object-cover ${item.position} ${viewMode === "night" ? "brightness-[0.82] saturate-[1.2]" : ""}`}
              fill
              priority={index === 0}
              sizes="(min-width: 1280px) 70vw, 100vw"
              src={item.src}
            />
          </div>
        ))}
      </div>

      <span className="absolute left-4 top-4 inline-flex h-9 items-center gap-2 rounded-lg border border-white/25 bg-black/70 px-3 text-[13px] font-bold text-white backdrop-blur">
        <CameraIcon className="size-4" />
        {activeIndex + 1} / {total}
      </span>

      <GalleryNavigation onNext={onNext} onPrevious={onPrevious} />

      <div className="absolute bottom-4 left-4 max-w-[75%] rounded-md bg-black/78 px-3 py-2 text-[12px] font-bold text-white sm:text-[14px]">
        {photo.label}
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-3">
        <button
          aria-label="Zoom photo"
          className="grid size-11 place-items-center rounded-full bg-black/62 text-white backdrop-blur"
          onClick={onZoom}
          type="button"
        >
          <SearchIcon className="size-5" />
        </button>
        <button
          aria-label="Fullscreen"
          className="grid size-11 place-items-center rounded-full bg-black/62 text-white backdrop-blur"
          onClick={onFullscreen}
          type="button"
        >
          <ExpandIcon className="size-5" />
        </button>
      </div>
    </section>
  );
}
