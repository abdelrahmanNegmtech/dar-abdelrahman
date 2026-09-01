import Image from "next/image";
import Link from "next/link";
import type { PublicPropertyDetail } from "@/features/properties/data/public-property-queries";

export function PropertyGalleryPage({ property }: { property: PublicPropertyDetail }) {
  if (!property.galleryPhotos.length) return <main className="grid min-h-dvh place-items-center bg-white p-6 text-center"><div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8"><h1 className="text-xl font-bold">Photos are not available yet</h1><p className="mt-2 text-sm text-[#64748B]">This listing has no publicly deliverable photos.</p><Link className="mt-5 inline-block font-semibold text-[#5A30E8]" href={`/stays/${property.slug}`}>Back to property</Link></div></main>;
  return <main className="min-h-dvh bg-white px-5 py-6 sm:px-8"><div className="mx-auto max-w-[1440px]"><Link className="text-[14px] font-semibold text-[#5A30E8]" href={`/stays/${property.slug}`}>Back to property</Link><h1 className="mt-4 text-[28px] font-bold">Photos of {property.title}</h1><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{property.galleryPhotos.map((photo, index) => <figure className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F1F5F9]" key={`${photo.src}-${index}`}><Image alt={photo.label} className={`object-cover ${photo.position}`} fill sizes="(min-width: 1024px) 30vw, 50vw" src={photo.src} /></figure>)}</div></div></main>;
}
