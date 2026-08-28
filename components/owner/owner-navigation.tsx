"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  CircleHelp,
  Home,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  Star,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { DarLogo } from "@/components/brand/dar-logo";
import { OwnerProfileLink } from "@/components/owners/owner-profile-link";
import { Button } from "@/features/design-system";
import { ownerRoutes } from "@/lib/owner-routes";

const OWNER_PROFILE = {
  slug: "ahmed-hassan",
  name: "Ahmed Hassan",
  avatarUrl: "/owner-selfie-ahmed-reference.png",
  accountLabel: "Verified Owner",
  location: "Egypt",
};

export type OwnerNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  match: (pathname: string) => boolean;
};

export function getOwnerNavigation(
  propertyId: string | number = 1,
): OwnerNavigationItem[] {
  return [
    { label: "Overview", href: "/owner", icon: Home, match: (path) => path === "/owner" },
    { label: "My Properties", href: "/owner/properties", icon: Building2, match: (path) => path.startsWith("/owner/properties") && !path.includes("/calendar") },
    { label: "Booking Requests", href: "/owner/bookings", icon: CalendarDays, match: (path) => path.startsWith("/owner/bookings") },
    {label: "Calendar", href: ownerRoutes.calendar(propertyId),icon: CalendarDays, match: (path) => path.includes("/calendar") },
    { label: "Messages", href: "/owner/messages", icon: MessageSquare, match: (path) => path.startsWith("/owner/messages") },
    { label: "Payouts", href: "/owner/payouts", icon: WalletCards, match: (path) => path.startsWith("/owner/payouts") },
    { label: "Reviews", href: "/owner/reviews", icon: Star, match: (path) => path.startsWith("/owner/reviews") },
    { label: "Verification", href: "/owner/verification", icon: ShieldCheck, match: (path) => path.startsWith("/owner/verification") },
    { label: "Settings", href: "/owner/settings", icon: Settings, match: (path) => path.startsWith("/owner/settings") },
    { label: "Help Center", href: "/owner/help-center", icon: CircleHelp, match: (path) => path.startsWith("/owner/help-center") },
  ];
}

type OwnerNavigationProps = {
  propertyId?: string;
  variant?: "dark" | "light";
};

function NavigationLinks({ propertyId, variant = "dark", onNavigate }: OwnerNavigationProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  void variant;

  return (
    <nav aria-label="Owner navigation" className="space-y-1">
      {getOwnerNavigation(propertyId).map(({ label, href, icon: NavigationIcon, badge, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={`group relative flex min-h-11 cursor-pointer items-center gap-3 overflow-hidden rounded-[var(--radius-sm)] px-4 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-inset ${
              active
                ? "text-[var(--brand)]"
                : "text-[var(--sidebar-dark-muted)] hover:text-[var(--sidebar-dark-foreground)]"
            }`}
          >
            <NavigationIcon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.8} />
            <span className="truncate">{label}</span>
            {badge ? <span aria-label={`${badge} unread`} className="owner-badge ml-auto grid size-5 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-white">{badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function OwnerDesktopNavigation({ propertyId, variant = "dark" }: OwnerNavigationProps) {
  void variant;
  return (
    <aside className="sticky top-0 flex h-screen w-[var(--sidebar-width)] shrink-0 flex-col overflow-y-auto border-r border-[var(--sidebar-dark-border)] bg-[var(--sidebar-dark-background)] px-5 pb-6 pt-7 text-[var(--sidebar-dark-foreground)] max-[900px]:hidden">
      <Link aria-label="Go to DAR homepage" className="block w-fit" href="/">
        <DarLogo surface="dark" width={610} height={260} className="h-auto w-[132px] object-contain object-left" priority />
      </Link>
      <OwnerProfileLink owner={OWNER_PROFILE} className="mt-6 rounded-[var(--radius-md)] border border-[var(--sidebar-dark-border)] p-4 transition-colors hover:border-[var(--brand)] hover:bg-[var(--sidebar-dark-elevated)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:bg-[var(--sidebar-dark-elevated)]">
        <div className="flex items-center gap-3">
          <Image src={OWNER_PROFILE.avatarUrl} alt={OWNER_PROFILE.name} width={46} height={46} className="size-[46px] rounded-full object-cover" />
          <div className="min-w-0">
            <b className="block truncate text-sm font-semibold text-[var(--sidebar-dark-foreground)]">{OWNER_PROFILE.name}</b>
            <p className="mt-1 text-xs text-[var(--sidebar-dark-muted)]">{OWNER_PROFILE.accountLabel}</p>
            <p className="mt-1 truncate text-xs text-[var(--sidebar-dark-muted)]">{OWNER_PROFILE.location}</p>
          </div>
        </div>
      </OwnerProfileLink>
      <div className="mt-5"><NavigationLinks propertyId={propertyId} variant="dark" /></div>
    </aside>
  );
}

export function OwnerMobileNavigation({ propertyId }: Pick<OwnerNavigationProps, "propertyId">) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    drawerRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Open owner navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 hidden size-10 rounded-full px-0 max-[900px]:inline-flex"
      >
        <Menu aria-hidden="true" className="size-5" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 hidden max-[900px]:block">
          <button type="button" aria-label="Close owner navigation" className="absolute inset-0 bg-surface-dark/55" onClick={() => setOpen(false)} />
          <aside ref={drawerRef} tabIndex={-1} aria-label="Owner navigation drawer" className="absolute inset-y-0 left-0 w-[min(310px,86vw)] overflow-y-auto bg-[var(--sidebar-dark-background)] p-5 text-white shadow-[var(--shadow-card-strong)] outline-none">
            <div className="flex items-center justify-between">
              <Link aria-label="Go to DAR homepage" className="block w-fit" href="/">
                <DarLogo surface="dark" width={610} height={260} className="h-[46px] w-[125px] object-contain object-left" />
              </Link>
              <Button type="button" variant="ghost" size="sm" aria-label="Close owner navigation" onClick={() => setOpen(false)} className="size-10 px-0 text-white hover:bg-white/10 hover:text-white">
                <X aria-hidden="true" className="size-5" />
              </Button>
            </div>
            <div className="mt-5"><NavigationLinks propertyId={propertyId} variant="dark" onNavigate={() => setOpen(false)} /></div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
