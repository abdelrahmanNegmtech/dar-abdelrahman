import Link from "next/link";

export default function BookingGuestInformationPage() {
  return <main className="grid min-h-dvh place-items-center bg-[#FBFCFF] p-6 text-[#0F172A]"><section className="max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]"><h1 className="text-2xl font-bold">Booking is not available yet</h1><p className="mt-3 text-[15px] leading-7 text-[#475569]">The public booking entry is being connected to the supported traveler booking flow. No reservation or payment has been created.</p><Link className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#5A30E8] px-5 text-[14px] font-bold text-white" href="/search">Browse published stays</Link></section></main>;
}
