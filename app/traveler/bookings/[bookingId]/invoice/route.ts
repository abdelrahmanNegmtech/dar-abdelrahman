import { type NextRequest, NextResponse } from "next/server";
import { getBookingDetailsData } from "@/features/traveler/data/queries";
import { formatCurrency } from "@/features/traveler/utils";

type InvoiceRouteContext = {
  params: Promise<unknown>;
};

function getBookingId(params: unknown) {
  if (
    typeof params === "object" &&
    params !== null &&
    "bookingId" in params &&
    typeof params.bookingId === "string"
  ) {
    return params.bookingId;
  }

  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: InvoiceRouteContext,
) {
  const bookingId = getBookingId(await params);

  if (!bookingId) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  const booking = await getBookingDetailsData(bookingId);

  if (!booking) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  const lines = [
    "DAR Booking Invoice",
    `Invoice for booking ${booking.reference}`,
    "",
    `Property: ${booking.property.title}`,
    `Location: ${booking.property.area}, ${booking.property.city}, ${booking.property.country}`,
    `Check-in: ${booking.checkIn} ${booking.checkInTime}`,
    `Check-out: ${booking.checkOut} ${booking.checkOutTime}`,
    `Guests: ${booking.guestsCount}`,
    "",
    `Subtotal: ${formatCurrency(booking.subtotal, booking.currency)}`,
    `Cleaning fee: ${formatCurrency(booking.cleaningFee, booking.currency)}`,
    `Service fee: ${formatCurrency(booking.serviceFee, booking.currency)}`,
    `Total: ${formatCurrency(booking.totalAmount, booking.currency)}`,
    "",
    "This invoice was generated from DAR booking data.",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Disposition": `attachment; filename="${booking.reference}-invoice.txt"`,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
