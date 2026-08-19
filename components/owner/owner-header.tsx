"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Bell, ChevronDown, Globe2, Search } from "lucide-react";
import { DarLogo } from "@/components/brand/dar-logo";
import { OwnerProfileLink } from "@/components/owners/owner-profile-link";
import { Button } from "@/features/design-system";
import { useOwnerBookings } from "@/lib/owner-bookings";
import { OWNER_PROFILE_FALLBACK } from "@/lib/owner-portal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export function OwnerHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const bookings = useOwnerBookings();
  const pendingBookingCount = bookings.filter((booking) => booking.status === "Pending").length;

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/owner/bookings?search=${encodeURIComponent(value)}` : "/owner/bookings");
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-[72px] items-center gap-5 border-b border-border bg-surface/95 px-7 backdrop-blur max-[900px]:px-4">
      <Link aria-label="Go to DAR homepage" className="hidden w-fit max-[900px]:block" href="/">
        <DarLogo surface="light" width={610} height={260} className="h-auto w-[92px] object-contain" />
      </Link>
      <form onSubmit={search} className="ml-auto w-full max-w-sm max-[700px]:hidden">
        <label className="relative block">
          <span className="sr-only">Search Owner Portal</span>
          <Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search bookings or properties"
            className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface pl-10 pr-4 text-sm text-foreground outline-none transition hover:border-border-strong focus:border-brand focus:shadow-[var(--shadow-focus)]"
          />
        </label>
      </form>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open notifications"
            className="relative inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:bg-accent"
          >
            <Bell aria-hidden="true" className="size-[18px]" />
            {pendingBookingCount > 0 ? <span className="owner-badge pointer-events-none absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-brand text-white">{pendingBookingCount}</span> : null}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="mt-1 text-xs text-foreground-muted">{pendingBookingCount > 0 ? `${pendingBookingCount} booking request${pendingBookingCount === 1 ? "" : "s"} need your attention.` : "No booking requests need your attention."}</p>
          </div>
          <DropdownMenuSeparator />
          {pendingBookingCount > 0 ? <DropdownMenuItem asChild><Link href="/owner/bookings">{pendingBookingCount} booking request{pendingBookingCount === 1 ? " is" : "s are"} pending</Link></DropdownMenuItem> : null}
          <DropdownMenuItem asChild><Link href="/owner/verification">Verification documents updated</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="max-[620px]:hidden" leadingIcon={<Globe2 aria-hidden="true" className="size-4" />} trailingIcon={<ChevronDown aria-hidden="true" className="size-3" />}>
            English / EGP
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>English / EGP</DropdownMenuItem>
          <DropdownMenuItem disabled>العربية / ج.م</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label="Open owner profile menu" className="rounded-full outline-none transition hover:ring-2 hover:ring-brand/20 focus-visible:shadow-[var(--shadow-focus)]">
            <Image src={OWNER_PROFILE_FALLBACK.avatarUrl} alt="Ahmed Hassan" width={36} height={36} className="size-9 rounded-full object-cover" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><OwnerProfileLink owner={OWNER_PROFILE_FALLBACK}>View public profile</OwnerProfileLink></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/owner/settings">Account settings</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/owner/verification">Verification</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/owner/help-center">Help Center</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
