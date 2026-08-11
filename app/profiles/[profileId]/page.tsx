import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicGuestProfilePage } from "@/components/profiles/public-guest-profile-page";

const OMAR_KHALED_SLUG = "omar-khaled";

type PublicProfilePageProps = {
  params: Promise<{ profileId: string }>;
};

export function generateStaticParams() {
  return [{ profileId: OMAR_KHALED_SLUG }];
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { profileId } = await params;

  if (profileId !== OMAR_KHALED_SLUG) {
    return { title: "Profile not found | DAR" };
  }

  return {
    title: "Omar Khaled | Verified Guest on DAR",
    description: "View Omar Khaled's public DAR guest profile and verification details.",
  };
}

export default async function PublicProfileRoute({ params }: PublicProfilePageProps) {
  const { profileId } = await params;

  if (profileId !== OMAR_KHALED_SLUG) {
    notFound();
  }

  return <PublicGuestProfilePage />;
}
