import { notFound } from "next/navigation";
import { getPublicPropertyBySlug } from "@/features/properties/data/public-property-queries";
import { PropertyGalleryPage } from "@/features/public-marketplace/property-gallery/components/PropertyGalleryPage";

type StayGalleryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StayGalleryPage({ params }: StayGalleryPageProps) {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PropertyGalleryPage property={property} />;
}
