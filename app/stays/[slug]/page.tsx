import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPropertyBySlug } from "@/features/properties/data/public-property-queries";
import { PropertyDetailsPage } from "@/features/public-marketplace/property-details/components/PropertyDetailsPage";

type StayDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: StayDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);

  if (!property) {
    return { title: "Property not found | DAR" };
  }

  return {
    title: `${property.title} | DAR`,
    description: property.about,
  };
}

export default async function StayDetailsPage({ params }: StayDetailsPageProps) {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailsPage property={property} />;
}
