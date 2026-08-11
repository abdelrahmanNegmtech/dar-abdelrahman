import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OwnerProfilePage } from "@/components/owners/owner-profile-page";

const AHMED_HASSAN_SLUG = "ahmed-hassan";

type OwnerPageProps = {
  params: Promise<{ ownerId: string }>;
};

export function generateStaticParams() {
  return [{ ownerId: AHMED_HASSAN_SLUG }];
}

export async function generateMetadata({ params }: OwnerPageProps): Promise<Metadata> {
  const { ownerId } = await params;

  if (ownerId !== AHMED_HASSAN_SLUG) {
    return { title: "Owner not found | DAR" };
  }

  return {
    title: "Ahmed Hassan | Verified Owner on DAR",
    description: "View Ahmed Hassan's verified Owner profile, listings, hosting performance, and guest reviews on DAR.",
  };
}

export default async function OwnerPage({ params }: OwnerPageProps) {
  const { ownerId } = await params;

  if (ownerId !== AHMED_HASSAN_SLUG) {
    notFound();
  }

  return <OwnerProfilePage />;
}
