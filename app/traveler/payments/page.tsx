import { Suspense } from "react";
import { PaymentsPage } from "@/features/traveler/components/PaymentsPage";
import { getPaymentsData } from "@/features/traveler/data/queries";

export default async function TravelerPaymentsRoute() {
  const data = await getPaymentsData();
  return (
    <Suspense fallback={null}>
      <PaymentsPage {...data} />
    </Suspense>
  );
}
