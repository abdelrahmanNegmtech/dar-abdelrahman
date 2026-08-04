import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDetails } from "./property-details";
import { getPropertyBySlug } from "./property-data";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Property not found | DAR",
    };
  }

  return {
    title: `${property.title} | DAR`,
    description: property.about,
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <PropertyDetails property={property} />
    </Suspense>
  );
}
