import { Suspense } from "react";
import { NotificationsPage } from "@/features/traveler/components/NotificationsPage";
import { getNotificationsData } from "@/features/traveler/data/queries";

export default async function TravelerNotificationsRoute({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const data = await getNotificationsData(params.type);
  return (
    <Suspense fallback={null}>
      <NotificationsPage {...data} />
    </Suspense>
  );
}
