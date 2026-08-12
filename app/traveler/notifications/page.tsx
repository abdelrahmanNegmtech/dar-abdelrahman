import { Suspense } from "react";
import { NotificationsPage } from "@/features/traveler/components/NotificationsPage";
import { getNotificationsData } from "@/features/traveler/data/queries";

export default async function TravelerNotificationsRoute({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const data = await getNotificationsData(params.filter);
  const pageKey = data.notifications
    .map((notification) => `${notification.id}:${notification.isRead ? "read" : "unread"}`)
    .join("|");

  return (
    <Suspense fallback={null}>
      <NotificationsPage key={pageKey} {...data} />
    </Suspense>
  );
}
