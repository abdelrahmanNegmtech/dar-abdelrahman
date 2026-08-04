import Image from "next/image";
import Link from "next/link";
import { shortPath } from "@/app/routing";

export default function BuyPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#090B32]">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[980px] rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)]">
        <header className="flex h-[76px] items-center justify-between border-b border-[#E6EBF3] px-6 lg:px-8">
          <Link href={shortPath("/", "en")} aria-label="DAR home"><Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[48px] w-auto object-contain" priority /></Link>
          <nav className="hidden items-center gap-8 text-[14px] font-bold lg:flex"><Link href={shortPath("/rent", "en")}>Rent</Link><Link href={shortPath("/buy", "en")} className="text-[#5F36E9]">Buy</Link><Link href={shortPath("/hotels", "en")}>Hotels</Link><Link href={shortPath("/new-projects", "en")}>New projects</Link></nav>
        </header>
        <section className="px-6 py-12 lg:px-10">
          <p className="text-[14px] font-bold text-[#5F36E9]">DAR ownership</p>
          <h1 className="mt-2 text-[36px] font-black">Buy verified homes</h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-8 text-[#59647D]">Ownership listings are being curated separately from stays so rental booking data stays clean. Register interest and the DAR team will follow up with available units.</p>
          <div className="mt-8 rounded-[16px] border border-[#E1E7F0] bg-[#FBFCFF] p-6">
            <h2 className="text-[20px] font-black">Coming soon</h2>
            <p className="mt-2 text-[15px] text-[#59647D]">New buy inventory will appear here after verification.</p>
            <a href="mailto:sales@dar.example?subject=Buying%20with%20DAR" className="mt-5 inline-flex h-12 items-center justify-center rounded-[8px] bg-[#5F36E9] px-8 text-[15px] font-bold text-white">Contact sales</a>
          </div>
        </section>
      </div>
    </main>
  );
}
