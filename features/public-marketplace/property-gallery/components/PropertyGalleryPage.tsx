"use client";

import { useEffect, useMemo, useState } from "react";
import { BrowseAllPhotosSection } from "./BrowseAllPhotosSection";
import { GalleryCategoryTabs } from "./GalleryCategoryTabs";
import { GalleryHeader } from "./GalleryHeader";
import { GalleryInfoBanner } from "./GalleryInfoBanner";
import { GallerySidebar } from "./GallerySidebar";
import { GalleryThumbnailStrip } from "./GalleryThumbnailStrip";
import { HeroGalleryViewer } from "./HeroGalleryViewer";
import { propertyGalleryPhotos } from "../data";
import { marketplaceImages } from "../../assets";
import { ShareModal, useShareModal } from "../../share";
import { useFavorites } from "../../favorites/useFavorites";

const PROPERTY_SLUG = "luxury-studio-in-madinaty";

export function PropertyGalleryPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [category, setCategory] = useState("All photos");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [viewMode, setViewMode] = useState<"day" | "night">("day");
  const [slideshow, setSlideshow] = useState(false);
  const [modal, setModal] = useState<"zoom" | "report" | "reserve" | null>(null);
  const { closeShare, open, openShare, state, triggerRef } = useShareModal();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(PROPERTY_SLUG);

  const visiblePhotos = useMemo(
    () => category === "All photos" ? propertyGalleryPhotos : propertyGalleryPhotos.filter((photo) => photo.category === category || (category === "Amenities" && photo.category === "Workspace")),
    [category],
  );
  const safePhotos = visiblePhotos.length ? visiblePhotos : propertyGalleryPhotos;
  const activePhoto = safePhotos[activeIndex % safePhotos.length];

  useEffect(() => {
    if (!slideshow) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % safePhotos.length), 1800);
    return () => window.clearInterval(timer);
  }, [safePhotos.length, slideshow]);

  useEffect(() => {
    if (!modal) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setModal(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modal]);

  function nextPhoto() {
    setActiveIndex((current) => (current + 1) % safePhotos.length);
  }

  function previousPhoto() {
    setActiveIndex((current) => (current + safePhotos.length - 1) % safePhotos.length);
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-white text-[#0B1020]" id="main-content">
      <GalleryHeader
        onShare={openShare}
        shareTriggerRef={triggerRef}
        onSlideshow={() => setSlideshow((current) => !current)}
        saved={saved}
        slideshow={slideshow}
        onSave={() => toggleFavorite(PROPERTY_SLUG)}
      />
      <div className="mx-auto max-w-[1760px] px-4 pb-8 pt-5 sm:px-7 lg:px-8 lg:pt-[92px]">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_385px]">
          <div className="min-w-0">
            <HeroGalleryViewer
              activeIndex={activeIndex}
              photo={activePhoto}
              total={safePhotos.length}
              viewMode={viewMode}
              onFullscreen={() => setModal("zoom")}
              onNext={nextPhoto}
              onPrevious={previousPhoto}
              onZoom={() => setModal("zoom")}
            />
            <GalleryCategoryTabs activeCategory={category} onCategoryChange={(nextCategory) => { setCategory(nextCategory); setActiveIndex(0); }} />
            <GalleryThumbnailStrip activeIndex={activeIndex} photos={safePhotos} onSelect={setActiveIndex} />
          </div>
          <div className="hidden min-w-0 xl:block">
            <GallerySidebar onReport={() => setModal("report")} onReserve={() => setModal("reserve")} />
          </div>
        </div>

        <div className="mt-8 hidden md:block xl:hidden">
          <GallerySidebar onReport={() => setModal("report")} onReserve={() => setModal("reserve")} />
        </div>
        <div className="mt-6 md:hidden">
          <GallerySidebar compact onReport={() => setModal("report")} onReserve={() => setModal("reserve")} />
        </div>

        <div className="mt-8">
          <BrowseAllPhotosSection
            category={category}
            photos={safePhotos}
            slideshow={slideshow}
            verifiedOnly={verifiedOnly}
            viewMode={viewMode}
            onSlideshow={() => setSlideshow((current) => !current)}
            onToggleVerified={() => setVerifiedOnly((current) => !current)}
            onViewModeChange={setViewMode}
          />
        </div>

        <div className="mt-6">
          <GalleryInfoBanner />
        </div>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0F172A]/45 p-4">
          <div
            aria-labelledby="gallery-modal-title"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
            role="dialog"
          >
            <h2 className="text-[18px] font-bold" id="gallery-modal-title">
              {modal === "zoom" ? "Photo preview" : modal === "report" ? "Report received locally" : "Reservation unavailable"}
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
              {modal === "zoom"
                  ? activePhoto.label
                  : modal === "report"
                    ? "Thanks. Reporting is not connected to a backend in this environment."
                    : "Reservations are not connected in this environment, so no booking was created."}
            </p>
            <button className="mt-5 h-11 w-full rounded-lg bg-[#5A30E8] font-bold text-white" onClick={() => setModal(null)} type="button">Done</button>
          </div>
        </div>
      ) : null}
      <ShareModal
        onClose={closeShare}
        open={open}
        property={{
          image: marketplaceImages.studio,
          location: "B6, Madinaty, Cairo, Egypt",
          price: "EGP 1,200 / night",
          rating: "4.9 (32)",
          title: "Luxury Studio in Madinaty",
          url: "/stays/luxury-studio-in-madinaty/gallery",
          verified: true,
        }}
        state={state}
      />
    </main>
  );
}
