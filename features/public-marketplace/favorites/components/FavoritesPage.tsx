"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MarketplaceShell } from "../../components/MarketplaceShell";
import { properties } from "../../search/data";
import { HeartIcon, ShieldIcon, StarIcon } from "../../search/icons";
import { useFavorites } from "../useFavorites";

type AuthState = "loading" | "logged-out" | "logged-in";

export function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;

    try {
      supabase = createClient();
    } catch {
      window.queueMicrotask(() => setAuthState("logged-out"));
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setAuthState(data.user ? "logged-in" : "logged-out");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session?.user ? "logged-in" : "logged-out");
    });

    return () => subscription.unsubscribe();
  }, []);

  const savedProperties = useMemo(
    () => properties.filter((property) => favorites.includes(property.slug)),
    [favorites],
  );

  return (
    <MarketplaceShell>
      <main className="mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#5A30E8]">
                Saved stays
              </p>
              <h1 className="mt-2 text-[30px] font-bold leading-tight text-[#0F172A] sm:text-[38px]">
                Your favorite DAR places
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#475569]">
                Keep a local shortlist while browsing. Permanent saved lists will connect to the
                marketplace backend in the next product phase.
              </p>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#A78BFA] px-5 text-[14px] font-bold text-[#5A30E8] transition hover:bg-[#F7F5FF]"
              href="/search"
            >
              Explore stays
            </Link>
          </div>

          {authState === "loading" ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div className="h-48 animate-pulse rounded-xl bg-[#F1F5F9]" key={item} />
              ))}
            </div>
          ) : authState === "logged-out" ? (
            <EmptyFavorites
              actionHref="/login?redirectTo=/favorites"
              actionLabel="Sign in to save places"
              title="Sign in to see your saved stays"
            />
          ) : savedProperties.length === 0 ? (
            <EmptyFavorites
              actionHref="/search"
              actionLabel="Browse stays"
              title="No saved stays yet"
            />
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {savedProperties.map((property) => (
                <article
                  className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.07)]"
                  key={property.slug}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      alt={property.title}
                      className={`absolute inset-0 size-full object-cover ${property.imagePosition}`}
                      fill
                      sizes="(min-width: 1280px) 28vw, 100vw"
                      src="/assets/images/backgrounds/Nighttime_photo.jpeg"
                    />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/72 px-2 py-1 text-[11px] font-bold text-white">
                      <ShieldIcon className="size-3 fill-[#5A30E8]" />
                      Verified
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="line-clamp-2 text-[17px] font-bold text-[#0F172A]">
                          {property.title}
                        </h2>
                        <p className="mt-1 text-[13px] text-[#64748B]">
                          {property.area}, {property.location}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[13px] text-[#334155]">
                        <StarIcon className="size-4 fill-[#F4B744] text-[#F4B744]" />
                        {property.rating}
                      </span>
                    </div>
                    <p className="mt-4 text-[17px] font-bold text-[#0F172A]">
                      {property.price} <span className="font-normal text-[#475569]">/ night</span>
                    </p>
                    <div className="mt-5 flex gap-3">
                      <Link
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#5A30E8] text-[13px] font-bold text-white"
                        href={`/stays/${property.slug}`}
                      >
                        Open property
                      </Link>
                      <button
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E5E7EB] px-4 text-[13px] font-bold text-[#0F172A]"
                        onClick={() => toggleFavorite(property.slug)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </MarketplaceShell>
  );
}

function EmptyFavorites({
  actionHref,
  actionLabel,
  title,
}: {
  actionHref: string;
  actionLabel: string;
  title: string;
}) {
  return (
    <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-[#C4B5FD] bg-[#F8F5FF] px-5 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-white text-[#5A30E8] shadow-[0_12px_30px_rgba(90,48,232,0.12)]">
        <HeartIcon className="size-8" />
      </div>
      <h2 className="mt-5 text-[22px] font-bold text-[#0F172A]">{title}</h2>
      <p className="mt-2 max-w-md text-[14px] leading-6 text-[#475569]">
        Save properties from search, map mode, and property pages to build a shortlist on this device.
      </p>
      <Link
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#5A30E8] px-6 text-[14px] font-bold text-white"
        href={actionHref}
      >
        {actionLabel}
      </Link>
    </div>
  );
}
