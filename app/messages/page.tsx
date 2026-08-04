import Image from "next/image";
import Link from "next/link";
import { shortPath } from "@/app/routing";

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#090B32]">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[920px] rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)]">
        <header className="flex h-[76px] items-center justify-between border-b border-[#E6EBF3] px-6 lg:px-8">
          <Link href={shortPath("/", "en")} aria-label="DAR home"><Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[48px] w-auto object-contain" priority /></Link>
          <Link href={shortPath("/bookings", "en")} className="text-[14px] font-bold text-[#5F36E9]">My bookings</Link>
        </header>
        <section className="px-6 py-12 text-center lg:px-10">
          <h1 className="text-[34px] font-black">Messages</h1>
          <p className="mx-auto mt-3 max-w-[520px] text-[16px] leading-8 text-[#59647D]">Your conversations with hosts and DAR support will appear here once a booking or enquiry is created.</p>
          <div className="mx-auto mt-8 max-w-[520px] rounded-[16px] border border-[#E1E7F0] bg-[#FBFCFF] p-6 text-left">
            <p className="text-[18px] font-black">Need help now?</p>
            <p className="mt-2 text-[14px] text-[#59647D]">Contact the DAR team for booking, payment, or property support.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a href="mailto:support@dar.example?subject=DAR%20support" className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#8D6BFF] text-[14px] font-bold text-[#5F36E9]">Email support</a>
              <a href="https://wa.me/201001234567" className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[#5F36E9] text-[14px] font-bold text-white">WhatsApp</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
