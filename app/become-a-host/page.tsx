import Link from "next/link";
import Image from "next/image";
import { marketplaceImages } from "@/features/public-marketplace/assets";
import { MarketplaceShell } from "@/features/public-marketplace/components/MarketplaceShell";

const steps = ["Create an owner account", "Prepare identity and property documents", "Submit your listing for DAR review"];

export default function Page() {
  return (
    <MarketplaceShell>
      <main className="mx-auto grid max-w-[1500px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:px-12">
        <section>
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#5A30E8]">Become a host</p>
          <h1 className="mt-3 max-w-3xl text-[38px] font-bold leading-tight text-[#0F172A] sm:text-[52px]">
            List quality stays with a verified marketplace.
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-8 text-[#475569]">
            Owner onboarding is handled through account creation and manual verification. DAR does not publish listings until ownership and listing quality are reviewed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#5A30E8] px-6 text-[14px] font-bold text-white shadow-[0_14px_32px_rgba(90,48,232,0.22)]"
              href="/sign-up?accountType=owner"
            >
              Start owner account
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[#A78BFA] px-6 text-[14px] font-bold text-[#5A30E8]"
              href="/contact"
            >
              Contact DAR
            </Link>
          </div>
        </section>
        <div className="relative min-h-[380px] overflow-hidden rounded-2xl bg-[#E5E7EB] shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <Image
            alt="Host preparing a guest welcome tray"
            className="absolute inset-0 size-full object-cover object-[58%_50%]"
            fill
            priority
            sizes="(min-width: 1024px) 440px, 100vw"
            src={marketplaceImages.host}
          />
        </div>
        <section className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article className="rounded-2xl border border-[#E5E7EB] p-6" key={step}>
                <p className="text-sm font-black text-[#6C3DFF]">Step {index + 1}</p>
                <h2 className="mt-3 text-xl font-black">{step}</h2>
              </article>
            ))}
          </div>
        </section>
      </main>
    </MarketplaceShell>
  );
}
