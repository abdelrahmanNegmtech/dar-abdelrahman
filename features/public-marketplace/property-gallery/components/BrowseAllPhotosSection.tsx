import { MoonIcon, PlayIcon, ShieldIcon, SunIcon } from "@/components/ui";
import { propertyGalleryPhotos } from "../data";
import { PhotoGrid } from "./PhotoGrid";

type BrowseAllPhotosSectionProps = {
  category: string;
  onSlideshow: () => void;
  onToggleVerified: () => void;
  onViewModeChange: (mode: "day" | "night") => void;
  photos: typeof propertyGalleryPhotos;
  slideshow: boolean;
  verifiedOnly: boolean;
  viewMode: "day" | "night";
};

export function BrowseAllPhotosSection({ category, onSlideshow, onToggleVerified, onViewModeChange, photos, slideshow, verifiedOnly, viewMode }: BrowseAllPhotosSectionProps) {
  return (
    <section className="border-t border-[#E5E7EB] pt-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-[20px] font-bold text-[#0B1020]">Browse all photos</h2>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <button className="inline-flex h-10 min-w-max items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[12px] font-semibold text-[#1F2937]" onClick={onToggleVerified} type="button">
            <ShieldIcon className="size-5 text-[#5E2FE5]" />
            Verified photos only
            <span className={`relative h-6 w-11 rounded-full ${verifiedOnly ? "bg-[#5E2FE5]" : "bg-[#CBD5E1]"}`}>
              <span className={`absolute top-1 size-4 rounded-full bg-white ${verifiedOnly ? "right-1" : "left-1"}`} />
            </span>
          </button>
          <button className={`inline-flex h-10 min-w-max items-center gap-2 rounded-lg border px-4 text-[12px] font-semibold ${viewMode === "day" ? "border-[#5E2FE5] bg-[#F7F5FF] text-[#5E2FE5]" : "border-[#E5E7EB] bg-white text-[#1F2937]"}`} onClick={() => onViewModeChange("day")} type="button">
            <SunIcon className="size-4 text-[#5E2FE5]" />
            Day view
          </button>
          <button className={`inline-flex h-10 min-w-max items-center gap-2 rounded-lg border px-4 text-[12px] font-semibold ${viewMode === "night" ? "border-[#5E2FE5] bg-[#F7F5FF] text-[#5E2FE5]" : "border-[#E5E7EB] bg-white text-[#1F2937]"}`} onClick={() => onViewModeChange("night")} type="button">
            <MoonIcon className="size-4 text-[#5E2FE5]" />
            Night view
          </button>
          <button className={`inline-flex h-10 min-w-max items-center gap-2 rounded-lg border px-4 text-[12px] font-semibold ${slideshow ? "border-[#5E2FE5] bg-[#F7F5FF] text-[#5E2FE5]" : "border-[#E5E7EB] bg-white text-[#1F2937]"}`} onClick={onSlideshow} type="button">
            <PlayIcon className="size-4" />
            {slideshow ? "Stop slideshow" : "View in slideshow"}
          </button>
        </div>
      </div>
      <PhotoGrid category={category} photos={photos} viewMode={viewMode} />
    </section>
  );
}
