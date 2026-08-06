import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import { CloseIcon, HeartIcon, PlayIcon, ShareIcon } from "@/components/ui";
import type { PublicPropertyDetail } from "@/features/properties/data/public-property-queries";

type GalleryHeaderProps = {
  onSave: () => void;
  onShare: () => void;
  onSlideshow: () => void;
  property: PublicPropertyDetail;
  saved: boolean;
  shareTriggerRef?: RefObject<HTMLButtonElement | null>;
  slideshow: boolean;
};

export function GalleryHeader({ onSave, onShare, onSlideshow, property, saved, shareTriggerRef, slideshow }: GalleryHeaderProps) {
  const actions = [
    { active: false, icon: ShareIcon, label: "Share", onClick: onShare },
    { active: saved, icon: HeartIcon, label: saved ? "Saved" : "Save", onClick: onSave },
    { active: slideshow, icon: PlayIcon, label: slideshow ? "Stop" : "Slideshow", onClick: onSlideshow },
    { active: false, icon: CloseIcon, label: "Close", onClick: () => { window.location.href = `/stays/${property.slug}`; } },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xl lg:fixed lg:inset-x-0">
      <div className="mx-auto flex h-[58px] max-w-[1760px] items-center justify-between px-4 sm:h-[70px] sm:px-7 lg:px-8">
        <div className="flex min-w-0 items-center gap-5 sm:gap-12">
          <Link aria-label="DAR home" className="dar-logo-frame h-[48px] w-[132px] sm:h-[54px] sm:w-[150px]" href="/">
            <Image
              alt="DAR logo"
              className="dar-logo-image dar-logo-image-light w-[140px] object-contain sm:w-[154px]"
              height={864}
              priority
              src="/assets/images/dar-logo.png"
              width={1536}
            />
          </Link>
          <p className="hidden truncate text-[13px] font-semibold text-[#0F172A] sm:block">
            {property.title} <span className="mx-3 text-[#9CA3AF]">/</span> Photos
          </p>
        </div>

        <h1 className="absolute left-1/2 hidden -translate-x-1/2 text-[20px] font-bold text-[#0B1020] md:block">
          Photo gallery
        </h1>

        <div className="flex items-center gap-2 sm:gap-5">
          {actions.map(({ active, icon: Icon, label, onClick }) => (
            <button
              aria-label={label}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-1 text-[12px] font-bold underline-offset-2 hover:underline sm:px-2 ${active ? "text-[#5E2FE5]" : "text-[#050816]"}`}
              key={label}
              onClick={onClick}
              ref={label === "Share" ? shareTriggerRef : undefined}
              type="button"
            >
              <Icon className={`size-5 sm:size-6 ${active && label === "Saved" ? "fill-[#5E2FE5]" : ""}`} />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <p className="text-[11px] font-semibold text-[#64748B]">{property.title} / Photos</p>
        <h1 className="mt-1 text-[20px] font-bold text-[#0B1020]">Photo gallery</h1>
      </div>
    </header>
  );
}
