"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SearchIcon } from "@/components/ui";
import { HomeIcon } from "./SystemIcons";
import { TrustStrip } from "./TrustStrip";

export function NotFoundState() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function search(event?: FormEvent) {
    event?.preventDefault();
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/search${params}`);
  }

  return (
    <main id="main-content" className="min-h-dvh overflow-x-hidden bg-[#F8FAFC] p-4 text-[#0F172A] sm:p-6">
      <section className="mx-auto max-w-[1500px] overflow-hidden rounded-2xl bg-[#06111F] text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
        <div className="relative min-h-[620px] p-6 sm:p-10 lg:p-12">
          <Image
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
            height={900}
            priority
            src="/assets/images/backgrounds/Nighttime_photo.jpeg"
            width={1600}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(108,61,255,0.25),transparent_28%),linear-gradient(90deg,#06111F_0%,rgba(6,17,31,0.94)_42%,rgba(6,17,31,0.46)_100%)]" />
          <div className="relative grid min-h-[520px] items-center gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(360px,0.48fr)]">
            <div>
              <div className="dar-logo-frame h-[56px] w-[156px]">
                <Image alt="DAR logo" className="dar-logo-image dar-logo-image-dark w-[152px]" height={864} priority src="/assets/images/dar-logo.png" width={1536} />
              </div>
              <h1 className="mt-10 text-[88px] font-black leading-none tracking-normal sm:text-[120px] lg:text-[150px]">
                4<span className="text-[#6C3DFF]">0</span>4
              </h1>
              <h2 className="mt-4 text-[30px] font-black leading-tight sm:text-[38px]">This page checked out early.</h2>
              <p className="mt-4 max-w-[520px] text-[16px] font-medium leading-7 text-white/82">
                The page you are looking for may have moved or no longer exists.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] px-7 text-[14px] font-black text-white shadow-[0_16px_34px_rgba(108,61,255,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  onClick={() => router.push("/")}
                  type="button"
                >
                  <HomeIcon className="size-5" />
                  Back home
                </button>
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/28 bg-white/6 px-7 text-[14px] font-black text-white backdrop-blur-md transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  onClick={() => router.push("/search")}
                  type="button"
                >
                  <SearchIcon className="size-5" />
                  Search stays
                </button>
              </div>
              <form className="mt-8 flex max-w-[560px] items-center rounded-xl border border-white/24 bg-[#071426]/80 p-2" onSubmit={search}>
                <label className="sr-only" htmlFor="not-found-search">
                  Search stays
                </label>
                <SearchIcon className="ml-3 size-5 shrink-0 text-white/78" />
                <input
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[14px] font-medium text-white outline-none placeholder:text-white/68"
                  id="not-found-search"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search Madinaty, New Capital, hotels..."
                  value={query}
                />
                <button
                  aria-label="Submit stay search"
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/22 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  type="submit"
                >
                  <SearchIcon className="size-5" />
                </button>
              </form>
            </div>
            <div className="hidden lg:block">
              <div className="relative mx-auto aspect-[0.72] max-h-[460px] w-full max-w-[360px] rounded-t-full border border-white/10 bg-white/5 shadow-[inset_0_0_90px_rgba(108,61,255,0.18)]">
                <div className="absolute inset-8 overflow-hidden rounded-t-full border border-[#F6B733]/35">
                  <Image alt="" className="h-full w-full object-cover" height={620} src="/assets/images/backgrounds/cairo-nights.png" width={430} />
                </div>
                <div className="absolute bottom-10 right-2 grid size-24 place-items-center rounded-full border-2 border-[#F6B733] text-[#F6B733]">
                  <SearchIcon className="size-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto mt-5 max-w-[1500px]">
        <TrustStrip />
      </div>
    </main>
  );
}
