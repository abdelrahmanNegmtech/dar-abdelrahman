import Image from "next/image";
import Link from "next/link";
import { resultProperties } from "@/app/properties/[slug]/property-data";
import { shortPath } from "@/app/routing";

function formatEgp(value: number) {
  return `EGP ${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(value)}`;
}

export default function RentPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#090B32]">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[1180px] rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)]">
        <header className="flex h-[76px] items-center justify-between border-b border-[#E6EBF3] px-6 lg:px-8">
          <Link href={shortPath("/", "en")} aria-label="DAR home"><Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[48px] w-auto object-contain" priority /></Link>
          <nav className="hidden items-center gap-8 text-[14px] font-bold lg:flex"><Link href={shortPath("/rent", "en")} className="text-[#5F36E9]">Rent</Link><Link href={shortPath("/buy", "en")}>Buy</Link><Link href={shortPath("/hotels", "en")}>Hotels</Link><Link href={shortPath("/new-projects", "en")}>New projects</Link><Link href={shortPath("/saved", "en")}>Saved</Link></nav>
        </header>
        <section className="px-6 py-8 lg:px-10">
          <h1 className="text-[34px] font-black">Rent DAR stays</h1>
          <p className="mt-2 text-[15px] leading-7 text-[#59647D]">Verified apartments and short stays in Madinty, Madina Nour, and the New Administrative Capital.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {resultProperties.map((property) => (
              <Link key={property.slug} href={shortPath(`/properties/${property.slug}`, "en")} className="overflow-hidden rounded-[14px] border border-[#E0E5EF] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
                <div className="relative h-56"><Image src={property.image} alt={property.title} fill className="object-cover" /></div>
                <div className="p-5"><h2 className="text-[18px] font-black">{property.title}</h2><p className="mt-2 text-[14px] font-semibold text-[#59647D]">{property.location}</p><p className="mt-4"><span className="font-black">{formatEgp(property.pricePerNight)}</span> / night</p></div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
