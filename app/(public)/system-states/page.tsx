import type { Metadata } from "next";
import { Suspense } from "react";
import { SystemStatesPreview } from "@/features/system-states";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "System States Preview | DAR",
};

export default function SystemStatesPage() {
  return (
    <Suspense fallback={null}>
      <SystemStatesPreview />
    </Suspense>
  );
}
