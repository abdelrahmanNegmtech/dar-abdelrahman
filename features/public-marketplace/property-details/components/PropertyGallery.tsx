import Image from "next/image";
import Link from "next/link";
import { galleryImages } from "../data";
import { CalendarIcon } from "../icons";

export function PropertyGallery() {
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
                  href="/stays/luxury-studio-in-madinaty/gallery"
                >
                  <CalendarIcon className="size-4" />
                  View all photos (24)
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
          1 / 24
        </span>
      </div>
    </section>
  );
}
