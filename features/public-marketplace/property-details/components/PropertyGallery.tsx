import Image from "next/image";
import Link from "next/link";
import type { PublicPropertyDetail } from "@/features/properties/data/public-property-queries";
import { CalendarIcon } from "../icons";

type PropertyGalleryProps = {
  property: PublicPropertyDetail;
};

export function PropertyGallery({ property }: PropertyGalleryProps) {
  const galleryImages = property.galleryPhotos;

  if (!galleryImages.length) {
    return (
      <section className="grid h-[290px] place-items-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center md:h-[315px]">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">Photos are not available yet</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#64748B]">
            This published listing does not currently have public photo metadata available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl">
      <div className="hidden h-[315px] grid-cols-[1.1fr_0.9fr] gap-3 md:grid xl:h-[335px]">
        <div className="relative overflow-hidden rounded-xl bg-[#E5E7EB]">
          <Image
            alt="Luxury studio living room"
            className={`absolute inset-0 size-full object-cover ${galleryImages[0].position}`}
            fill
            priority
            sizes="60vw"
            src={galleryImages[0].src}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {galleryImages.slice(1).map((image, index) => (
            <div className="relative overflow-hidden rounded-xl bg-[#E5E7EB]" key={image.src}>
              <Image
                alt={`Property photo ${index + 2}`}
                className={`absolute inset-0 size-full object-cover ${image.position}`}
                fill
                sizes="24vw"
                src={image.src}
              />
              {index === 3 ? (
                <Link
                  className="absolute bottom-4 right-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F172A]/90 px-4 text-[14px] font-bold text-white backdrop-blur"
                  href={`/stays/${property.slug}/gallery`}
                >
                  <CalendarIcon className="size-4" />
                  View all photos ({galleryImages.length})
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-[290px] overflow-hidden rounded-xl md:hidden">
        <Image
          alt="Luxury studio"
          className="absolute inset-0 size-full object-cover object-center"
          fill
          priority
          sizes="100vw"
          src={galleryImages[0].src}
        />
        <span className="absolute bottom-4 right-4 rounded-full bg-[#0F172A]/90 px-3 py-1.5 text-[12px] font-bold text-white">
          1 / {galleryImages.length}
        </span>
      </div>
    </section>
  );
}
