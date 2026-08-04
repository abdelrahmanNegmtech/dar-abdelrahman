import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHotelBySlug } from "@/app/booking/rooms/hotel-room-data";
import { readParam } from "@/app/routing";
import { HotelDetailsClient } from "./hotel-details-client";

type HotelDetailsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: HotelDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hotel = getHotelBySlug(slug);

  if (!hotel) {
    return { title: "Hotel not found | DAR" };
  }

  return {
    title: `${hotel.title} | DAR Hotels`,
    description: hotel.description,
  };
}

export default async function HotelDetailsPage({ params, searchParams }: HotelDetailsPageProps) {
  const { slug } = await params;
  const queryParams = (await searchParams) ?? {};
  const hotel = getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  return (
    <HotelDetailsClient
      hotel={hotel}
      initialQuery={{
        checkIn: readParam(queryParams, "in", "checkIn") ?? "2026-05-20",
        checkOut: readParam(queryParams, "out", "checkOut") ?? "2026-05-25",
        guests: readParam(queryParams, "g", "guests") ?? "2",
        nights: readParam(queryParams, "n", "nights") ?? "5",
        locale: readParam(queryParams, "locale", "locale") ?? "en",
      }}
    />
  );
}
