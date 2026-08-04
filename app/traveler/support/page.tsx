import { Suspense } from "react";
import { SupportPage } from "@/features/traveler/components/SupportPage";
import { getSupportData } from "@/features/traveler/data/queries";

export default async function TravelerSupportRoute() {
  const data = await getSupportData();
  return (
    <Suspense fallback={null}>
      <SupportPage {...data} />
    </Suspense>
  );
}
