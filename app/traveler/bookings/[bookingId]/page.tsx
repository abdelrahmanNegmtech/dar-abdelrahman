import { BookingDetailsPage } from "@/features/traveler/components/BookingDetailsPage";
import { getBookingDetailsData } from "@/features/traveler/data/queries";

export default async function TravelerBookingDetailsRoute({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = await getBookingDetailsData(bookingId);

  return <BookingDetailsPage booking={booking} />;
}
