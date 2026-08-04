import Image from "next/image";
import Link from "next/link";
import { shortPath } from "@/app/routing";

const projects = [
  ["Madinty Park Residences", "Madinty", "Launching soon"],
  ["Madina Nour Garden Homes", "Madina Nour", "Priority registration"],
  ["New Capital Business Suites", "New Administrative Capital", "Preview list open"],
];

export default function NewProjectsPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#090B32]">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[1180px] rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)]">
        <header className="flex h-[76px] items-center justify-between border-b border-[#E6EBF3] px-6 lg:px-8">
          <Link href={shortPath("/", "en")} aria-label="DAR home"><Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[48px] w-auto object-contain" priority /></Link>
          <nav className="hidden items-center gap-8 text-[14px] font-bold lg:flex"><Link href={shortPath("/rent", "en")}>Rent</Link><Link href={shortPath("/buy", "en")}>Buy</Link><Link href={shortPath("/hotels", "en")}>Hotels</Link><Link href={shortPath("/new-projects", "en")} className="text-[#5F36E9]">New projects</Link></nav>
        </header>
        <section className="px-6 py-10 lg:px-10">
          <h1 className="text-[36px] font-black">New projects</h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-8 text-[#59647D]">Track upcoming DAR communities and register interest without mixing project leads into active booking inventory.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {projects.map(([title, location, status]) => (
              <article key={title} className="rounded-[16px] border border-[#E1E7F0] bg-white p-6 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
                <span className="rounded-full bg-[#F5F1FF] px-3 py-1 text-[12px] font-black text-[#5F36E9]">{status}</span>
                <h2 className="mt-5 text-[20px] font-black">{title}</h2>
                <p className="mt-2 text-[14px] font-semibold text-[#59647D]">{location}</p>
                <a href={`mailto:projects@dar.example?subject=${encodeURIComponent(title)}`} className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[8px] border border-[#8D6BFF] text-[14px] font-bold text-[#5F36E9]">Register interest</a>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
