"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon, GlobeIcon, HeartIcon, MenuIcon } from "@/components/ui";
import { AuthNavAction } from "@/features/authentication/components/AuthNavAction";

type MarketplaceNavbarProps = {
  variant?: "overlay" | "standard";
};

const navItems = [
  { href: "/search", label: "Stays" },
  { href: "/search?type=hotels", label: "Hotels" },
  { href: "/favorites", label: "Favorites" },
  { href: "/become-a-host", label: "Become a host" },
  { href: "/about", label: "About us" },
  { href: "/help", label: "Help" },
];

export function MarketplaceNavbar({ variant = "overlay" }: MarketplaceNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isOverlay = variant === "overlay";
  const textClass = isOverlay ? "text-white" : "text-[#0F172A]";
  const mutedTextClass = isOverlay ? "text-white/88" : "text-[#0F172A]";
  const iconButtonClass = isOverlay
    ? "bg-white/12 text-white backdrop-blur-md hover:bg-white/18"
    : "border border-[#E5E7EB] bg-white text-[#0F172A] hover:border-[#C4B5FD]";
  const signInClassName = isOverlay
    ? "inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#0F172A] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-white/92 xl:h-9 xl:px-4 xl:text-xs 2xl:h-10 2xl:px-5"
    : "inline-flex h-10 items-center rounded-lg border border-[#A78BFA] bg-white px-5 text-[14px] font-semibold text-[#0F172A] transition hover:bg-[#F7F5FF]";

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <header className={`${isOverlay ? "relative z-20" : "sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xl"} ${textClass}`}>
      <div className="mx-auto flex h-[76px] max-w-[1760px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-8 2xl:px-11">
        <Link
          aria-label="DAR home"
          className={`dar-logo-frame shrink-0 ${isOverlay ? "h-[54px] w-[150px] xl:h-[48px] xl:w-[132px] 2xl:h-[52px] 2xl:w-[144px]" : "h-[58px] w-[158px] lg:w-[172px]"}`}
          href="/"
        >
          <Image
            alt="DAR logo"
            className={`dar-logo-image w-[150px] object-contain lg:w-[164px] ${isOverlay ? "dar-logo-image-dark" : "dar-logo-image-light"}`}
            height={864}
            priority
            src="/assets/images/dar-logo.png"
            width={1536}
          />
        </Link>

        <nav aria-label="Main navigation" className={`hidden min-w-0 items-center gap-7 text-[14px] font-semibold lg:flex xl:gap-9 ${mutedTextClass}`}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href.startsWith("/search") && pathname.startsWith("/search"));

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap transition ${active ? "text-[#7C5CFF]" : isOverlay ? "hover:text-white" : "hover:text-[#5A30E8]"}`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 items-center gap-3">
          <Link
            aria-label="Saved stays"
            className={`hidden size-10 items-center justify-center rounded-full transition sm:flex xl:size-9 2xl:size-10 ${iconButtonClass}`}
            href="/favorites"
          >
            <HeartIcon className="size-5" />
          </Link>
          <button
            aria-label="Language and currency"
            className={`hidden size-10 items-center justify-center rounded-full transition sm:flex xl:size-9 2xl:size-10 ${iconButtonClass}`}
            type="button"
          >
            <GlobeIcon className="size-5" />
          </button>
          <div className="hidden min-w-0 lg:block">
            <AuthNavAction
              signInClassName={signInClassName}
              userClassName="inline-flex h-10 min-w-0 max-w-[178px] items-center rounded-full bg-white px-3 text-sm font-bold text-[#0F172A]"
            />
          </div>
          <button
            aria-expanded={mobileOpen}
            aria-label="Open marketplace menu"
            className={`inline-flex size-10 items-center justify-center rounded-full lg:hidden ${iconButtonClass}`}
            onClick={() => setMobileOpen((current) => !current)}
            type="button"
          >
            {mobileOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <>
          <button
            aria-label="Close marketplace menu"
            className="fixed inset-0 z-40 cursor-default bg-transparent lg:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          />
          <div className="absolute inset-x-3 top-[calc(100%+8px)] z-50 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-[#0F172A] shadow-[0_20px_60px_rgba(15,23,42,0.18)] lg:hidden">
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  className="rounded-xl px-4 py-3 text-[15px] font-bold hover:bg-[#F7F5FF]"
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 border-t border-[#E5E7EB] pt-3">
              <AuthNavAction signInClassName="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#A78BFA] px-5 text-[14px] font-semibold text-[#0F172A]" />
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
