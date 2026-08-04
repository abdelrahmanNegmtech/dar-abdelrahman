"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { DarLogo } from "@/components/brand/dar-logo";
import { Icon } from "@/components/host-landing/icons";

const nav = [
  ["Overview", "home", "/owner/properties"],
  ["My Properties", "property", "/owner/properties"],
  ["Booking Requests", "calendar-check", "/owner/bookings/request-decision"],
  ["Calendar", "calendar", "/owner/properties/1/calendar-management"],
  ["Messages", "message", "/owner/help-center"],
  ["Payments", "wallet", "/owner/payouts"],
  ["Reviews", "star", "/owner/properties"],
  ["Verification", "shield", "/owner/verification"],
  ["Settings", "gear", "/owner/help-center"],
] as const;

export function OwnerShell({ active, children, actions }: { active: string; children: ReactNode; actions?: ReactNode; wide?: boolean; fluid?: boolean }) {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#0d1735]">
      <div className="owner-dashboard-frame">
        <aside className="flex w-[230px] shrink-0 flex-col bg-[#031022] px-4 py-5 text-white max-[900px]:hidden">
          <DarLogo surface="dark" width={610} height={260} className="h-[52px] w-[140px] object-contain object-left" />
          <div className="mt-5 rounded-lg border border-white/15 p-3">
            <div className="flex items-center gap-3">
              <Image src="/publish-avatar-ahmed-reference.png" alt="Ahmed Hassan" width={44} height={44} className="size-11 rounded-full object-cover" />
              <div><b className="owner-card-title">Ahmed Hassan</b><p className="owner-helper text-white/65">Verified Owner</p></div>
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            {nav.map(([label, icon, href]) => (
              <Link key={label} href={href} className={`owner-button-text flex h-11 items-center gap-3 rounded-md px-3 ${active === label ? "bg-[var(--brand)] text-white" : "text-white/82 hover:bg-white/8"}`}>
                <Icon name={icon} className="size-5" />{label}
                {label === "Messages" ? <span className="owner-badge ml-auto rounded-full bg-[#6d35ee] px-2 py-0.5">4</span> : null}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-lg border border-[#e09d00] p-4">
            <div className="flex gap-3"><Icon name="headset" className="size-6 text-[#ffb800]" /><div><b className="owner-card-title">Need help?</b><p className="owner-helper text-white/65">Contact our support team</p></div></div>
            <Link href="/owner/help-center" className="owner-button-text mt-4 grid h-9 place-items-center rounded bg-[var(--brand)]">Support center</Link>
          </div>
        </aside>
        <section className="owner-dashboard-main">
          <header className="flex h-[72px] items-center justify-between border-b border-[#e7eaf1] px-7 max-[700px]:h-[62px] max-[700px]:px-4">
            <DarLogo surface="light" width={610} height={260} className="hidden h-9 w-24 object-contain max-[900px]:block" />
            <div className="ml-auto flex items-center gap-5">
              <span className="relative"><Icon name="bell" className="size-5" /><b className="owner-badge absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[var(--brand)] text-white">2</b></span>
              <span className="owner-label flex items-center gap-2 max-[620px]:hidden"><Icon name="globe" className="size-5" />English / EGP<Icon name="chevron" className="size-3" /></span>
              <Image src="/publish-avatar-ahmed-reference.png" alt="Ahmed" width={34} height={34} className="size-[34px] rounded-full object-cover" />
            </div>
          </header>
          {actions ? <div className="flex justify-end gap-3 px-7 pt-4">{actions}</div> : null}
          {children}
        </section>
      </div>
    </main>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-[#e1e5ed] bg-white shadow-[0_4px_18px_rgba(25,33,60,.025)] ${className}`}>{children}</section>;
}
