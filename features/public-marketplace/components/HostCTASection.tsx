import Image from "next/image";
import Link from "next/link";
import { marketplaceImages } from "../assets";

export function HostCTASection() {
  return (
    <section className="bg-white px-5 pb-9 sm:px-8 lg:px-12 xl:px-8 2xl:px-9">
      <div className="mx-auto max-w-[1500px]">
        <div className="relative overflow-hidden rounded-2xl bg-[#061022] px-7 py-8 text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)] sm:px-10 lg:px-14 xl:px-8 xl:py-7">
          <Image
            alt="Host preparing a premium apartment welcome tray"
            className="absolute inset-y-0 right-0 hidden h-full w-[45%] object-cover object-[70%_50%] lg:block"
            height={320}
            src={marketplaceImages.host}
            width={720}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#061022_0%,rgba(6,16,34,0.96)_45%,rgba(6,16,34,0.55)_100%)]" />

          <div className="relative z-10 max-w-[500px]">
            <h2 className="text-[28px] font-bold leading-tight">List your property with DAR</h2>
            <p className="mt-3 text-[15px] leading-6 text-white/78">
              Earn more by sharing your space with travelers.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] px-8 text-sm font-bold text-white shadow-[0_16px_30px_rgba(108,61,255,0.28)] transition hover:brightness-95"
              href="/become-a-host"
            >
              Become a host
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
