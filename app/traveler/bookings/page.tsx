import { Suspense } from "react";
import { BookingsPage } from "@/features/traveler/components/BookingsPage";
import { getBookingsData } from "@/features/traveler/data/queries";

export default async function TravelerBookingsRoute({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "past" || params.tab === "cancelled" ? params.tab : "upcoming";
  const bookingData = await getBookingsData(tab);

  return (
    <Suspense fallback={null}>
      <BookingsPage bookings={bookingData.bookings} initialTab={tab} stats={bookingData.stats} />
    </Suspense>
  );
}
