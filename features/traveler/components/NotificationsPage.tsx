"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  MessageCircle,
  MoreVertical,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useToast } from "@/features/system-states/hooks/useToast";
import { deleteNotification, markAllNotificationsRead, markNotificationRead, markNotificationUnread } from "../actions";
import type { TravelerNotification, TravelerNotificationType } from "../types";
import { Card, EmptyState, IconButton, PageHeader, PrimaryButton, SearchInput, SecondaryButton, StatCard, cx } from "./shared";
import { useUnreadNotifications } from "./TravelerLayout";

type NotificationFilter = TravelerNotificationType | "all" | "unread";

type NotificationsPageProps = {
  notifications: TravelerNotification[];
  stats: {
    approvals: number;
    booking: number;
    message: number;
    payment: number;
    support: number;
    system: number;
    unread: number;
  };
};

const filters: Array<{ id: NotificationFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "booking", label: "Bookings" },
  { id: "payment", label: "Payments" },
  { id: "message", label: "Messages" },
  { id: "support", label: "Support" },
  { id: "system", label: "System" },
];

const iconByType: Record<TravelerNotificationType, typeof Bell> = {
  approval: ShieldCheck,
  booking: CalendarDays,
  message: MessageCircle,
  payment: CreditCard,
  support: Bell,
  system: ShieldCheck,
};

function formatNotificationTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { day: "numeric", hour: "2-digit", minute: "2-digit", month: "short" });
}

function buildCopyText(notification: TravelerNotification) {
  return [
    `Title: ${notification.title}`,
    `Message: ${notification.body}`,
    `Date: ${formatNotificationTime(notification.createdAt)}`,
    `Reference: ${notification.entityLabel}`,
  ].join("\n");
}

function ConfirmDialog({
  message,
  onCancel,
  onConfirm,
  title,
}: {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onCancel} role="dialog">
      <div className="w-full max-w-md rounded-dar border border-dar-border bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-black text-dar-navy">{title}</h3>
        <p className="mt-3 text-sm font-semibold leading-6 text-dar-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-xl border border-dar-border px-5 py-2.5 text-sm font-bold text-dar-navy transition hover:bg-slate-50"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-dar-error px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
            onClick={onConfirm}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPage({ notifications, stats }: NotificationsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const filter = (searchParams.get("filter") as NotificationFilter | null) ?? "all";
  const { setUnreadNotifications } = useUnreadNotifications();

  function setFilter(nextFilter: NotificationFilter) {
    const next = new URLSearchParams(searchParams.toString());
    if (nextFilter === "all") next.delete("filter");
    else next.set("filter", nextFilter);
    router.replace(`${pathname}?${next.toString()}`);
  }

  // Track read state locally — initialized from server isRead
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(notifications.filter((n) => n.isRead).map((n) => n.id)),
  );
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState(notifications[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  // Keep sidebar badge in sync with local read state
  useEffect(() => {
    const unread = notifications.filter((n) => !deletedIds.has(n.id) && !readIds.has(n.id)).length;
    setUnreadNotifications(unread);
  }, [notifications, readIds, deletedIds, setUnreadNotifications]);

  const visibleNotifications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notifications.filter((notification) => {
      if (deletedIds.has(notification.id)) return false;
      const isRead = readIds.has(notification.id);
      const filterMatch =
        filter === "all" ||
        (filter === "unread" && !isRead) ||
        notification.type === filter;
      const queryMatch =
        !normalizedQuery ||
        notification.title.toLowerCase().includes(normalizedQuery) ||
        notification.body.toLowerCase().includes(normalizedQuery) ||
        notification.entityLabel.toLowerCase().includes(normalizedQuery);
      return filterMatch && queryMatch;
    });
  }, [deletedIds, filter, notifications, query, readIds]);

  const selected = visibleNotifications.find((notification) => notification.id === selectedId) ?? visibleNotifications[0] ?? null;

  // ---------- Actions ----------

  function markRead(notificationId: string) {
    if (readIds.has(notificationId)) return; // already read — no duplicate
    setReadIds((current) => new Set(current).add(notificationId));
    startTransition(async () => {
      await markNotificationRead({ notificationId });
    });
  }

  function markUnread(notificationId: string) {
    setReadIds((current) => {
      const next = new Set(current);
      next.delete(notificationId);
      return next;
    });
    startTransition(async () => {
      await markNotificationUnread({ notificationId, isRead: false });
      showToast({ description: "Notification marked as unread.", title: "Unread", type: "success" });
    });
    setMenuOpen(false);
  }

  function handleSelect(notification: TravelerNotification) {
    setSelectedId(notification.id);
    if (!readIds.has(notification.id)) {
      markRead(notification.id);
    }
  }

  function handleOpen(notification: TravelerNotification) {
    if (!readIds.has(notification.id)) {
      markRead(notification.id);
    }
    // Next.js Link handles the actual navigation
  }

  function handleMarkAllRead() {
    const unreadIds = notifications
      .filter((n) => !readIds.has(n.id) && !deletedIds.has(n.id))
      .map((n) => n.id);
    setReadIds((current) => new Set([...current, ...unreadIds]));
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      showToast({
        description: result.message,
        title: result.ok ? "All clear" : "Could not update",
        type: result.ok ? "success" : "error",
      });
    });
  }

  function removeNotification(notificationId: string) {
    setDeletedIds((current) => new Set(current).add(notificationId));
    setShowConfirmDelete(null);
    setMenuOpen(false);
    if (selectedId === notificationId) {
      const remaining = visibleNotifications.filter((n) => n.id !== notificationId);
      setSelectedId(remaining[0]?.id ?? "");
    }
    startTransition(async () => {
      const result = await deleteNotification({ notificationId });
      showToast({
        description: result.message,
        title: result.ok ? "Notification deleted" : "Could not delete",
        type: result.ok ? "success" : "error",
      });
    });
  }

  function handleCopyDetails(notification: TravelerNotification) {
    const text = buildCopyText(notification);
    navigator.clipboard.writeText(text).then(
      () => {
        showToast({ description: "Notification details copied to clipboard.", title: "Copied", type: "success" });
      },
      () => {
        showToast({ description: "Could not copy details.", title: "Copy failed", type: "error" });
      },
    );
    setMenuOpen(false);
  }

  function openMenu(event: React.MouseEvent) {
    const button = event.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    const menuWidth = 224;
    const gap = 4;
    setMenuPosition({
      left: Math.max(gap, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - gap)),
      top: rect.bottom + gap,
    });
    setMenuOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-3">
            <SecondaryButton disabled={isPending} onClick={handleMarkAllRead}>
              <CheckCircle2 className="size-4" />
              Mark all as read
            </SecondaryButton>
            <PrimaryButton onClick={() => showToast({ description: "Use the preference panel on this page to adjust preview notification settings.", title: "Notification settings", type: "info" })}>
              Notification settings
            </PrimaryButton>
          </div>
        }
        description="Track booking updates, payments, approvals, messages, and system alerts in one place."
        title="Notifications Center"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard href="/traveler/notifications?filter=unread" icon={Bell} label="Unread notifications" value={String(stats.unread)} />
        <StatCard href="/traveler/notifications?filter=booking" icon={CalendarDays} label="Booking updates" value={String(stats.booking)} />
        <StatCard href="/traveler/notifications?filter=payment" icon={CreditCard} label="Payment alerts" tone="green" value={String(stats.payment)} />
        <StatCard href="/traveler/notifications?filter=approval" icon={ShieldCheck} label="Approval updates" tone="amber" value={String(stats.approvals)} />
        <StatCard href="/traveler/notifications?filter=message" icon={MessageCircle} label="New messages" value={String(stats.message)} />
        <StatCard href="/traveler/notifications?filter=system" icon={Bell} label="System alerts" tone="red" value={String(stats.system)} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card className="p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto]">
              <SearchInput onChange={setQuery} placeholder="Search notifications..." value={query} />
              <div className="flex gap-2 overflow-x-auto">
                {filters.map((item) => (
                  <button
                    className={cx(
                      "shrink-0 rounded-lg border px-3 py-2 text-xs font-black transition",
                      filter === item.id
                        ? "border-dar-primary bg-dar-primary text-white"
                        : "border-dar-border bg-white text-dar-muted hover:border-dar-primary hover:text-dar-primary",
                    )}
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    type="button"
                  >
                    {item.label}
                    {item.id === "unread" ? ` (${notifications.filter((n) => !readIds.has(n.id) && !deletedIds.has(n.id)).length})` : null}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-dar-border px-4 py-3">
              <h2 className="font-black text-dar-navy">Recent notifications</h2>
            </div>
            {visibleNotifications.length ? (
              <div className="divide-y divide-dar-border">
                {visibleNotifications.map((notification) => {
                  const Icon = iconByType[notification.type];
                  const isRead = readIds.has(notification.id);
                  return (
                    <div
                      className={cx(
                        "grid cursor-pointer gap-3 p-4 transition hover:bg-slate-50 md:grid-cols-[44px_1fr_160px_96px_88px]",
                        !isRead && "bg-dar-primary-soft/45",
                      )}
                      key={notification.id}
                      onClick={() => handleSelect(notification)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect(notification); }}
                      role="button"
                      tabIndex={0}
                    >
                      <span
                        className={cx(
                          "grid size-10 place-items-center rounded-full transition",
                          isRead ? "bg-slate-100 text-slate-500" : "bg-dar-primary text-white",
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <div className="text-left">
                        <p className={cx("text-sm", isRead ? "font-semibold text-dar-muted" : "font-black text-dar-navy")}>
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-dar-muted">{notification.body}</p>
                      </div>
                      <p className="self-center text-xs font-bold text-dar-navy">{notification.entityLabel}</p>
                      <p className="self-center text-xs font-semibold text-dar-muted">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                      <div className="flex items-center gap-2 self-center">
                        <Link
                          className="rounded-lg border border-dar-border px-3 py-2 text-xs font-black text-dar-primary transition hover:bg-dar-primary-soft"
                          href={notification.href}
                          onClick={() => handleOpen(notification)}
                        >
                          Open
                        </Link>
                        <IconButton
                          className="size-9"
                          label={`Delete ${notification.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowConfirmDelete(notification.id);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </IconButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5">
                <EmptyState description="No notifications match your filters." title="No notifications yet" />
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-black text-dar-navy">Notification details</h2>
              {selected ? (
                <button
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Notification actions menu"
                  className="grid size-8 place-items-center rounded-lg text-dar-muted transition hover:bg-dar-primary-soft hover:text-dar-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    openMenu(e);
                  }}
                  type="button"
                >
                  <MoreVertical className="size-5" />
                </button>
              ) : null}
            </div>
            {selected ? (
              <div className="mt-5">
                <span
                  className={cx(
                    "grid size-14 place-items-center rounded-full",
                    readIds.has(selected.id) ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-600",
                  )}
                >
                  <CheckCircle2 className="size-8" />
                </span>
                <h3 className="mt-4 text-lg font-black text-dar-navy">{selected.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-dar-muted">{selected.body}</p>
                <p className="mt-3 text-xs font-semibold text-dar-muted">
                  {formatNotificationTime(selected.createdAt)} &middot; {selected.entityLabel}
                </p>
                <Link
                  className="mt-5 block"
                  href={selected.href}
                  onClick={() => handleOpen(selected)}
                >
                  <PrimaryButton className="w-full">Open related item</PrimaryButton>
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm font-semibold text-dar-muted">Select a notification to inspect it.</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Notification preferences</h2>
            <div className="mt-4 space-y-3">
              {["In-app notifications", "Email notifications", "SMS notifications", "Push notifications", "Booking updates", "Payment updates"].map((preference) => (
                <label className="flex items-center justify-between gap-3 text-sm font-bold text-dar-muted" key={preference}>
                  <span>{preference}</span>
                  <input className="h-5 w-10 accent-dar-primary" defaultChecked type="checkbox" />
                </label>
              ))}
            </div>
            <PrimaryButton
              className="mt-5 w-full"
              onClick={() => showToast({ description: "Notification preferences saved for this local preview.", title: "Preferences saved", type: "success" })}
            >
              Save preferences
            </PrimaryButton>
          </Card>
        </aside>
      </div>

      {/* Rendered at page level to avoid overflow clipping */}
      {menuOpen && selected ? (
        <div
          className="fixed z-50 w-56 overflow-hidden rounded-xl border border-dar-border bg-white p-1 shadow-xl"
          role="menu"
          style={{ left: menuPosition.left, top: menuPosition.top }}
        >
          {(() => {
            const actions: { icon: typeof Eye; label: string; onClick: () => void; danger?: boolean }[] = [];
            const isRead = readIds.has(selected.id);
            if (isRead) {
              actions.push({ icon: EyeOff, label: "Mark as unread", onClick: () => markUnread(selected.id) });
            } else {
              actions.push({ icon: Eye, label: "Mark as read", onClick: () => markRead(selected.id) });
            }
            actions.push({ icon: Copy, label: "Copy notification details", onClick: () => handleCopyDetails(selected) });
            actions.push({ icon: Trash2, label: "Delete notification", onClick: () => { setShowConfirmDelete(selected.id); setMenuOpen(false); }, danger: true });
            return actions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  className={cx(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition",
                    action.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-dar-navy hover:bg-dar-primary-soft hover:text-dar-primary",
                  )}
                  key={action.label}
                  onClick={action.onClick}
                  role="menuitem"
                  type="button"
                >
                  <ActionIcon className="size-4" />
                  {action.label}
                </button>
              );
            });
          })()}
        </div>
      ) : null}

      {/* Backdrop for fixed menu */}
      {menuOpen ? (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(false);
          }}
          onKeyDown={(e) => { if (e.key === "Escape") setMenuOpen(false); }}
          role="presentation"
        />
      ) : null}

      {showConfirmDelete ? (
        <ConfirmDialog
          message="This notification will be permanently deleted."
          onCancel={() => setShowConfirmDelete(null)}
          onConfirm={() => removeNotification(showConfirmDelete)}
          title="Delete notification?"
        />
      ) : null}
    </div>
  );
}
