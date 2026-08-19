"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, useTransition } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Globe2,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Star,
  User,
  X,
} from "lucide-react";
import { ToastProvider } from "@/features/system-states/components/ToastProvider";
import { useToast } from "@/features/system-states/hooks/useToast";
import { logoutTraveler } from "../actions";
import type { TravelerProfile } from "../types";
import { DarLogo } from "./DarLogo";
import { cx, IconButton } from "./shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

type NavItem = {
  href: string;
  icon: typeof Home;
  label: string;
  match?: string;
};

const navItems: NavItem[] = [
  { href: "/traveler/dashboard", icon: Home, label: "Dashboard" },
  { href: "/traveler/bookings", icon: CalendarDays, label: "Bookings" },
  { href: "/traveler/saved", icon: Heart, label: "Saved properties" },
  { href: "/traveler/messages", icon: MessageCircle, label: "Messages" },
  { href: "/traveler/notifications", icon: Bell, label: "Notifications" },
  { href: "/traveler/payments", icon: CreditCard, label: "Payments" },
  { href: "/traveler/reviews", icon: Star, label: "Reviews" },
  { href: "/traveler/profile", icon: User, label: "Profile" },
  { href: "/traveler/settings", icon: Settings, label: "Settings" },
  { href: "/traveler/support", icon: HelpCircle, label: "Support" },
];

const bottomItems = navItems.filter((item) =>
  ["/traveler/dashboard", "/traveler/bookings", "/traveler/saved", "/traveler/messages", "/traveler/profile"].includes(item.href),
);

function isActive(pathname: string, item: NavItem) {
  const target = item.match ?? item.href;
  return pathname === target || pathname.startsWith(`${target}/`);
}

function Badge({ value }: { value: number }) {
  if (!value) return null;

  return (
    <span className="grid min-w-5 place-items-center rounded-full bg-dar-primary px-1.5 py-0.5 text-[10px] font-black text-white">
      {value}
    </span>
  );
}

function NavLink({
  item,
  mobile = false,
  notificationsUnread,
  unreadMessages,
}: {
  item: NavItem;
  mobile?: boolean;
  notificationsUnread: number;
  unreadMessages: number;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, item);
  const Icon = item.icon;
  const badgeValue = item.href === "/traveler/messages" ? unreadMessages : item.href === "/traveler/notifications" ? notificationsUnread : 0;

  return (
    <Link
      className={cx(
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary",
        active
          ? "bg-dar-primary-soft text-dar-primary"
          : mobile
            ? "text-white/82 hover:bg-white/10 hover:text-white"
            : "text-dar-sidebar-muted hover:bg-dar-primary-soft hover:text-dar-primary",
      )}
      href={item.href}
    >
      <Icon className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <Badge value={badgeValue} />
    </Link>
  );
}

function Sidebar({
  notificationsUnread,
  profile,
  unreadMessages,
}: {
  notificationsUnread: number;
  profile: TravelerProfile;
  unreadMessages: number;
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[292px] shrink-0 border-r border-dar-border bg-white lg:flex lg:flex-col">
      {/* ── Logo ───────────────────────────────────────────── */}
      <div className="shrink-0 px-5 pb-4 pt-7">
        <Link aria-label="Go to DAR homepage" className="mb-8 block" href="/">
          <DarLogo priority surface="light" />
        </Link>
      </div>

      {/* ── Navigation (scrollable) ────────────────────────── */}
      <nav aria-label="Traveler navigation" className="flex-1 overflow-y-auto px-5">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              item={item}
              key={item.href}
              notificationsUnread={notificationsUnread}
              unreadMessages={unreadMessages}
            />
          ))}
        </div>
      </nav>

      {/* ── Separator ──────────────────────────────────────── */}
      <div className="shrink-0 px-5">
        <div className="border-t border-dar-border" />
      </div>

      {/* ── Cards + Logout (always visible at bottom) ──────── */}
      <div className="shrink-0 space-y-3 px-5 pb-6 pt-4">
        {/* Invite friends card */}
        <div className="rounded-dar border border-dar-border bg-[linear-gradient(180deg,#F7F2FF_0%,#FFFFFF_100%)] p-4">
          <p className="text-sm font-black text-dar-navy">Invite friends</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-dar-muted">Invite friends and earn rewards when they book their first stay.</p>
          <button
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-dar-primary px-4 text-sm font-black text-dar-primary transition hover:bg-dar-primary-soft active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary focus-visible:ring-offset-2"
            onClick={() =>
              showToast({
                description: "We're working on bringing invite rewards soon.",
                title: "Invite rewards not available yet",
                type: "info",
              })
            }
            type="button"
          >
            Invite now
          </button>
        </div>

        {/* Need help card */}
        <div className="rounded-dar border border-dar-border p-4">
          <p className="text-sm font-black text-dar-navy">Need help?</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-dar-muted">Our support team is here for you 24/7.</p>
          <Link
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-dar-primary text-sm font-black text-dar-primary transition hover:bg-dar-primary-soft active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary focus-visible:ring-offset-2"
            href="/traveler/support"
          >
            <HelpCircle className="size-4" />
            Contact support
          </Link>
        </div>

        {/* Logout */}
        <button
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          disabled={isPending}
          onClick={() => startTransition(() => void logoutTraveler())}
          type="button"
        >
          <LogOut className="size-5" />
          {isPending ? "Logging out..." : "Logout"}
        </button>
      </div>

      <span className="sr-only">Signed in as {profile.fullName}</span>
    </aside>
  );
}

function MobileDrawer({
  isOpen,
  notificationsUnread,
  onClose,
  profile,
  unreadMessages,
}: {
  isOpen: boolean;
  notificationsUnread: number;
  onClose: () => void;
  profile: TravelerProfile;
  unreadMessages: number;
}) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button aria-label="Close navigation overlay" className="absolute inset-0 bg-black/40" onClick={onClose} type="button" />
      <aside className="relative flex h-full w-[min(320px,88vw)] flex-col bg-dar-dark p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <Link aria-label="Go to DAR homepage" className="block w-fit" href="/">
            <DarLogo priority size="drawer" surface="dark" />
          </Link>
          <IconButton className="border-white/20 bg-white/10 text-white hover:bg-white/20" label="Close navigation" onClick={onClose}>
            <X className="size-5" />
          </IconButton>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/12 bg-white/8 p-3">
          <div className="relative size-11 overflow-hidden rounded-full bg-white/12">
            <Image alt={profile.fullName} className="object-cover" fill src={profile.avatarUrl} />
          </div>
          <div>
            <p className="text-sm font-black">{profile.fullName}</p>
            <p className="text-xs font-semibold text-white/70">Guest account</p>
          </div>
        </div>

        <nav aria-label="Mobile traveler navigation" className="mt-6 space-y-1">
          {navItems.map((item) => (
            <div key={item.href} onClick={onClose}>
              <NavLink
                item={item}
                mobile
                notificationsUnread={notificationsUnread}
                unreadMessages={unreadMessages}
              />
            </div>
          ))}
        </nav>

        <button
          className="mt-auto flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/55"
          disabled={isPending}
          onClick={() => startTransition(() => void logoutTraveler())}
          type="button"
        >
          <LogOut className="size-5" />
          {isPending ? "Logging out..." : "Logout"}
        </button>
      </aside>
    </div>
  );
}

function TravelerHeader({
  notificationsUnread,
  onMenuClick,
  profile,
}: {
  notificationsUnread: number;
  onMenuClick: () => void;
  profile: TravelerProfile;
}) {
  const [isPending, startTransition] = useTransition();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-dar-border bg-white/92 px-4 backdrop-blur lg:px-8">
      <button
        aria-label="Open navigation"
        className="grid size-10 place-items-center rounded-xl text-dar-navy transition hover:bg-dar-primary-soft lg:hidden"
        onClick={onMenuClick}
        type="button"
      >
        <Menu className="size-6" />
      </button>

      <Link aria-label="Go to DAR homepage" className="lg:hidden" href="/">
        <DarLogo priority size="mobile" surface="light" />
      </Link>

      <div className="hidden items-center gap-3 lg:flex">
        <Globe2 className="size-5 text-dar-muted" />
        <span className="text-sm font-bold text-dar-navy">English / EGP</span>
        <ChevronDown className="size-4 text-dar-muted" />
      </div>

      <div className="flex items-center gap-4">
        <Link
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-full text-dar-navy transition hover:bg-dar-primary-soft"
          href="/traveler/notifications"
        >
          <Bell className="size-5" />
          <span className="absolute -right-1 -top-1">
            <Badge value={notificationsUnread} />
          </span>
        </Link>

        <DropdownMenu modal={false} onOpenChange={setAccountMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="hidden items-center gap-3 rounded-full px-2 py-1 transition hover:bg-dar-primary-soft sm:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary"
              type="button"
            >
              <span className="relative size-10 overflow-hidden rounded-full bg-slate-100">
                <Image alt={profile.fullName} className="object-cover" fill src={profile.avatarUrl} />
              </span>
              <span className="hidden text-sm font-black text-dar-navy md:inline">{profile.fullName}</span>
              <ChevronDown
                className={cx(
                  "size-4 text-dar-muted transition",
                  accountMenuOpen ? "rotate-180" : "",
                )}
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={10} className="w-64">
            {/* Account header */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                  <Image alt={profile.fullName} className="object-cover" fill src={profile.avatarUrl} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-dar-navy">{profile.fullName}</p>
                  <p className="truncate text-xs font-semibold text-dar-muted">{profile.email}</p>
                  <span className="mt-0.5 inline-flex items-center rounded-md bg-dar-primary-soft px-2 py-0.5 text-[10px] font-bold text-dar-primary">
                    Traveler
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => { window.open("/traveler/profile", "_self"); }}>
              <User className="size-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => { window.open("/traveler/settings", "_self"); }}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => { window.open("/traveler/payments", "_self"); }}>
              <CreditCard className="size-4" />
              Payments
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => { window.open("/traveler/support", "_self"); }}>
              <HelpCircle className="size-4" />
              Support
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="!text-red-600 hover:!bg-red-50"
              disabled={isPending}
              onClick={() => startTransition(() => void logoutTraveler())}
            >
              <LogOut className="size-4" />
              {isPending ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function BottomNavigation({
  notificationsUnread,
  unreadMessages,
}: {
  notificationsUnread: number;
  unreadMessages: number;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom traveler navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid h-[74px] grid-cols-5 border-t border-dar-border bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] lg:hidden"
    >
      {bottomItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item);
        const badgeValue = item.href === "/traveler/messages" ? unreadMessages : item.href === "/traveler/notifications" ? notificationsUnread : 0;
        return (
          <Link
            className={cx("relative flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold", active ? "text-dar-primary" : "text-dar-muted")}
            href={item.href}
            key={item.href}
          >
            <Icon className={cx("size-5", item.href === "/traveler/saved" && active ? "fill-dar-primary" : "")} />
            <span>{item.label.split(" ")[0]}</span>
            <span className="absolute right-3 top-1">
              <Badge value={badgeValue} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

// ---------- Unread Messages Context ----------
// Allows MessagesPage to update the sidebar badge reactively when
// conversations are read or new messages arrive.

const UnreadMessagesContext = createContext<{
  setUnreadMessages: Dispatch<SetStateAction<number>>;
  unreadMessages: number;
}>({ setUnreadMessages: () => {}, unreadMessages: 0 });

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}

// ---------- Unread Notifications Context ----------
// Allows NotificationsPage to update the sidebar badge reactively when
// notifications are read, unread, or deleted.

const UnreadNotificationsContext = createContext<{
  setUnreadNotifications: Dispatch<SetStateAction<number>>;
  unreadNotifications: number;
}>({ setUnreadNotifications: () => {}, unreadNotifications: 0 });

export function useUnreadNotifications() {
  return useContext(UnreadNotificationsContext);
}

export function TravelerLayout({
  children,
  notificationsUnread: initialNotificationsUnread,
  profile,
  unreadMessages: initialUnreadMessages,
}: {
  children: React.ReactNode;
  notificationsUnread: number;
  profile: TravelerProfile;
  unreadMessages: number;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(initialUnreadMessages);
  const [unreadNotifications, setUnreadNotifications] = useState(initialNotificationsUnread);

  return (
    <ToastProvider>
      <UnreadMessagesContext.Provider value={{ setUnreadMessages, unreadMessages }}>
        <UnreadNotificationsContext.Provider value={{ setUnreadNotifications, unreadNotifications }}>
          <div className="min-h-dvh bg-dar-bg text-dar-navy">
            <div className="mx-auto flex min-h-dvh max-w-[1800px]">
              <Sidebar notificationsUnread={unreadNotifications} profile={profile} unreadMessages={unreadMessages} />
              <div className="min-w-0 flex-1">
                <TravelerHeader notificationsUnread={unreadNotifications} onMenuClick={() => setDrawerOpen(true)} profile={profile} />
                <main className="mx-auto w-full max-w-[1420px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
                  {children}
                </main>
              </div>
            </div>
            <MobileDrawer
              isOpen={drawerOpen}
              notificationsUnread={unreadNotifications}
              onClose={() => setDrawerOpen(false)}
              profile={profile}
              unreadMessages={unreadMessages}
            />
            <BottomNavigation notificationsUnread={unreadNotifications} unreadMessages={unreadMessages} />
          </div>
        </UnreadNotificationsContext.Provider>
      </UnreadMessagesContext.Provider>
    </ToastProvider>
  );
}
