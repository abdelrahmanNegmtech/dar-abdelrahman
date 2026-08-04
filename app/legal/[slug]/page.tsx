import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalCenterPage, type LegalPolicySlug } from "@/features/public-marketplace/legal";
import { legalPolicies } from "@/features/public-marketplace/legal/data";

type LegalPolicyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return legalPolicies.map((policy) => ({ slug: policy.id }));
}

export async function generateMetadata({ params }: LegalPolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = legalPolicies.find((item) => item.id === slug);

  if (!policy) {
    return {
      title: "Legal Policy | DAR",
    };
  }

  return {
    description: policy.description,
    title: `${policy.title} | DAR Legal & Trust Center`,
  };
}

export default async function LegalPolicyPage({ params }: LegalPolicyPageProps) {
  const { slug } = await params;
  const policy = legalPolicies.find((item) => item.id === slug);

  if (!policy) notFound();

  return <LegalCenterPage initialPolicy={slug as LegalPolicySlug} />;
}
