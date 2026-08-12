"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DarLogo } from "@/components/brand/dar-logo";
import { Icon } from "@/components/host-landing/icons";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ownerRoutes } from "@/lib/owner-routes";

const nav = [
  ["Overview", "home", ownerRoutes.dashboard],
  ["My Properties", "property", ownerRoutes.properties],
  ["Booking Requests", "calendar-check", ownerRoutes.bookingRequests],
  ["Calendar", "calendar", ownerRoutes.calendar()],
  ["Messages", "message", ownerRoutes.messages],
  ["Payments", "wallet", ownerRoutes.payouts],
  ["Reviews", "star", ownerRoutes.reviews],
  ["Verification", "shield", ownerRoutes.verification],
  ["Settings", "gear", ownerRoutes.settings],
] as const;

export function OwnerShell({ active, children, actions }: { active: string; children: ReactNode; actions?: ReactNode; wide?: boolean; fluid?: boolean }) {
  const [notificationsUnread, setNotificationsUnread] = useState(2);

  useEffect(() => {
    let isActive = true;

    async function loadUnreadCount() {
      try {
        const response = await fetch("/api/notifications/unread-count", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json() as { unreadCount?: unknown };
        if (isActive && typeof payload.unreadCount === "number") {
          setNotificationsUnread(payload.unreadCount);
        }
      } catch {
        // Keep the existing fallback badge value when local notification data is unavailable.
      }
    }

    void loadUnreadCount();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#0d1735]">
      <div className="owner-dashboard-frame">
        <aside className="flex w-[230px] shrink-0 flex-col bg-[#031022] px-4 py-5 text-white max-[900px]:hidden">
          <DarLogo surface="dark" width={610} height={260} className="h-[52px] w-[140px] object-contain object-left" />
          <div className="mt-5 rounded-lg border border-white/15 p-3">
            <div className="flex items-center gap-3">
              <ProfileAvatar src="/owner-selfie-ahmed-reference.png" name="Ahmed Hassan" size={44}/>
              <div><b className="owner-card-title">Ahmed Hassan</b><p className="owner-helper text-white/65">Verified Owner</p></div>
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            {nav.map(([label, icon, href]) => (
              <Link key={label} href={href} className={`owner-button-text flex h-11 items-center gap-3 rounded-md px-3 ${active === label ? "bg-[#5522d9] text-white" : "text-white/82 hover:bg-white/8"}`}>
                <Icon name={icon} className="size-5" />{label}
                {label === "Messages" ? <span className="owner-badge ml-auto rounded-full bg-[#6d35ee] px-2 py-0.5">4</span> : null}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-lg border border-[#e09d00] p-4">
            <div className="flex gap-3"><Icon name="headset" className="size-6 text-[#ffb800]" /><div><b className="owner-card-title">Need help?</b><p className="owner-helper text-white/65">Contact our support team</p></div></div>
            <Link href="/owner/help-center" className="owner-button-text mt-4 grid h-9 place-items-center rounded bg-[#5522d9]">Support center</Link>
          </div>
        </aside>
        <section className="owner-dashboard-main">
          <header className="flex h-[72px] items-center justify-between border-b border-[#e7eaf1] px-7 max-[700px]:h-[62px] max-[700px]:px-4">
            <DarLogo surface="light" width={610} height={260} className="hidden h-9 w-24 object-contain max-[900px]:block" />
            <div className="ml-auto flex items-center gap-5">
              <span className="relative">
                <Icon name="bell" className="size-5" />
                {notificationsUnread ? (
                  <b className="owner-badge absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[#5522d9] text-white">
                    {notificationsUnread}
                  </b>
                ) : null}
              </span>
              <span className="owner-label flex items-center gap-2 max-[620px]:hidden"><Icon name="globe" className="size-5" />English / EGP<Icon name="chevron" className="size-3" /></span>
              <ProfileAvatar src="/owner-selfie-ahmed-reference.png" name="Ahmed Hassan" size={34}/>
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
