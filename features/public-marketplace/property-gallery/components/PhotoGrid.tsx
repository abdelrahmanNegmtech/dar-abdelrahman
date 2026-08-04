import { propertyGalleryPhotos } from "../data";
import { PhotoCard } from "./PhotoCard";

type PhotoGridProps = {
  category: string;
  photos: typeof propertyGalleryPhotos;
  viewMode: "day" | "night";
};

export function PhotoGrid({ category, photos, viewMode }: PhotoGridProps) {
  const visiblePhotos = category === "All photos" ? propertyGalleryPhotos : photos;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {visiblePhotos.slice(0, 8).map((photo) => (
        <PhotoCard category={photo.category} key={photo.label} label={photo.label} position={photo.position} src={photo.src} viewMode={viewMode} />
      ))}
    </div>
  );
}
