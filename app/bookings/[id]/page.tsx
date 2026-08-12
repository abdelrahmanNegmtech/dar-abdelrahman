import { notFound } from "next/navigation";
import { getBookingDetailsData } from "@/features/traveler/data/queries";
import { LegacyBookingDetailsClient } from "./legacy-booking-details-client";

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingDetailsData(id);

  if (!booking) {
    notFound();
  }

  return <LegacyBookingDetailsClient booking={booking} />;
}
