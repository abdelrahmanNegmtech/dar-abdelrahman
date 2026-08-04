import type { Metadata } from "next";
import { LegalCenterPage } from "@/features/public-marketplace/legal";

export const metadata: Metadata = {
  description: "DAR legal policies, trust information, payment rules, cancellation terms, and marketplace protection.",
  title: "Legal & Trust Center | DAR",
};

export default function LegalPage() {
  return <LegalCenterPage />;
}
