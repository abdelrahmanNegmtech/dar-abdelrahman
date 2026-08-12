import { notFound } from "next/navigation";
import { getBookingDetailsData } from "@/features/traveler/data/queries";
import { RequestReceivedClient } from "./request-received-client";

export default async function RequestReceivedPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;

  if (!bookingId) {
    notFound();
  }

  const booking = await getBookingDetailsData(bookingId);

  if (!booking) {
    notFound();
  }

  return <RequestReceivedClient booking={booking} />;
}
