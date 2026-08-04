import Link from "next/link";
import { MarketplaceShell } from "../../components/MarketplaceShell";
import { ShieldIcon, StarIcon } from "../../search/icons";

const values = [
  {
    body: "Listings focus on clear information, useful photos, and local context before guests decide.",
    title: "Transparent discovery",
  },
  {
    body: "DAR highlights verified stays and trust signals so short-term decisions feel easier.",
    title: "Trust-first marketplace",
  },
  {
    body: "The journey stays simple: search, compare, choose, then move into the next booking step.",
    title: "Simple stay planning",
  },
];

const steps = ["Search stays", "Compare details", "Choose confidently", "Contact or reserve"];

export function AboutPage() {
  return (
    <MarketplaceShell>
      <main>
        <section className="mx-auto grid max-w-[1500px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-16">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#5A30E8]">
              About DAR
            </p>
            <h1 className="mt-3 max-w-3xl text-[38px] font-bold leading-tight text-[#0F172A] sm:text-[52px]">
              A clearer way to find furnished stays in Egypt.
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-8 text-[#475569]">
              DAR brings short-term homes, studios, apartments, and hotels into one polished
              marketplace experience built around trust, clarity, and local discovery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[#5A30E8] px-6 text-[14px] font-bold text-white shadow-[0_14px_32px_rgba(90,48,232,0.22)]"
                href="/search"
              >
                Explore stays
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#A78BFA] px-6 text-[14px] font-bold text-[#5A30E8]"
                href="/become-a-host"
              >
                Become a host
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
            <div className="aspect-[4/3] rounded-xl bg-[url('/assets/images/backgrounds/Nighttime_photo.jpeg')] bg-cover bg-center" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#F8F5FF] p-4">
                <ShieldIcon className="size-6 text-[#5A30E8]" />
                <p className="mt-3 text-[14px] font-bold text-[#0F172A]">Verified stays</p>
              </div>
              <div className="rounded-xl bg-[#FFF7ED] p-4">
                <StarIcon className="size-6 fill-[#F4B744] text-[#F4B744]" />
                <p className="mt-3 text-[14px] font-bold text-[#0F172A]">Guest-ready details</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#E5E7EB] bg-white">
          <div className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8 lg:px-12">
            <h2 className="text-[30px] font-bold text-[#0F172A]">Why DAR</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {values.map((value) => (
                <article className="rounded-xl border border-[#E5E7EB] p-6" key={value.title}>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">{value.title}</h3>
                  <p className="mt-3 text-[14px] leading-7 text-[#475569]">{value.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8 lg:px-12">
          <h2 className="text-[30px] font-bold text-[#0F172A]">How it works</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div className="rounded-xl bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]" key={step}>
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#5A30E8] text-[13px] font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-4 text-[16px] font-bold text-[#0F172A]">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl bg-[#06111F] p-7 text-white sm:p-9">
            <h2 className="text-[26px] font-bold">Marketplace trust stays at the center.</h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-white/72">
              DAR keeps verification, reviews, clear pricing, and support visible across the journey so
              guests can compare options without guessing.
            </p>
          </div>
        </section>
      </main>
    </MarketplaceShell>
  );
}
