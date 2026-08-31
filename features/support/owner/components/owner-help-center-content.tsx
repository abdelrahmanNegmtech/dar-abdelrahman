"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  MessageSquare,
  Plus,
  Search,
  ShieldAlert,
  Ticket,
} from "lucide-react";
import type {
  OwnerSupportBookingReference,
  OwnerSupportTicketListItem,
} from "@/features/support/owner/owner-support-types";
import {
  getCategoryLabel,
  getPriorityColorClass,
  getStatusColorClass,
  getStatusLabel,
  formatDate,
} from "@/features/support/owner/owner-support-utils";
import { OwnerCreateTicketForm } from "./owner-create-ticket-form";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TicketCounts = {
  all: number;
  awaitingDar: number;
  awaitingYou: number;
  open: number;
  resolved: number;
};

type TabId = "all" | "open" | "awaiting_dar" | "awaiting_you" | "resolved";

type TabItem = {
  id: TabId;
  label: string;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TICKETS_PER_PAGE = 10;

const TICKET_TABS: TabItem[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "awaiting_dar", label: "Awaiting DAR" },
  { id: "awaiting_you", label: "Awaiting you" },
  { id: "resolved", label: "Resolved" },
];

const FAQ_ITEMS = [
  {
    answer:
      "You can submit a support request through the Help Center. Choose a category, describe the issue, and our team will review it.",
    id: "submit",
    question: "How do I create a support request?",
  },
  {
    answer:
      "You can track the status of all your support requests in the My Support Requests section. Each ticket shows its current status and conversation history.",
    id: "track",
    question: "How do I track my support request?",
  },
  {
    answer:
      "You can reply to any open support ticket directly from the ticket detail page. Simply type your message and click Send Reply.",
    id: "reply",
    question: "How do I reply to a support request?",
  },
  {
    answer:
      "You can link a support request to a specific booking. When creating your ticket, select the relevant booking from the dropdown.",
    id: "booking",
    question: "Can I link a request to a specific booking?",
  },
  {
    answer:
      "You can close a support ticket from the ticket detail page if it is not yet resolved by the support team.",
    id: "close",
    question: "How do I close a support request?",
  },
];

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  bg,
  count,
  icon: Icon,
  label,
}: {
  bg: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#e1e5ed] bg-white p-4">
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-full ${bg}`}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="owner-helper text-[#59637d]">{label}</p>
        <p className="owner-number-md mt-1 text-[#070b2d]">{count}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ticket Status Badge                                                */
/* ------------------------------------------------------------------ */

function TicketStatusBadge({ status }: { status: string }) {
  const colors = getStatusColorClass(status as never);
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${colors.bg} ${colors.text}`}
    >
      {getStatusLabel(status as never)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Priority Badge                                                     */
/* ------------------------------------------------------------------ */

function PriorityBadge({ priority }: { priority: string }) {
  const colors = getPriorityColorClass(priority as never);
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize ${colors.bg} ${colors.text}`}
    >
      {priority}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Accordion                                                      */
/* ------------------------------------------------------------------ */

function FAQAccordion({ items }: { items: typeof FAQ_ITEMS }) {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            className="overflow-hidden rounded-lg border border-[#e1e5ed]"
            key={item.id}
          >
            <button
              aria-expanded={isOpen}
              className="owner-button-text flex w-full items-center justify-between px-4 py-3.5 text-left text-[13px] font-semibold text-[#070b2d] transition hover:bg-[#f7f8fb]"
              onClick={() => toggle(item.id)}
              type="button"
            >
              {item.question}
              <span
                className={`ml-2 shrink-0 text-[#59637d] transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {isOpen ? (
              <div className="px-4 pb-4">
                <p className="owner-body text-[#59637d]">{item.answer}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ticket Table Row (Desktop)                                         */
/* ------------------------------------------------------------------ */

function DesktopTicketRow({ ticket }: { ticket: OwnerSupportTicketListItem }) {
  return (
    <tr
      className="cursor-pointer transition hover:bg-[#f7f8fb]"
      onClick={() =>
        (window.location.href = `/owner/help-center/tickets/${ticket.id}`)
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.location.href = `/owner/help-center/tickets/${ticket.id}`;
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`View ticket ${ticket.ticketReference}`}
    >
      <td className="px-4 py-3 font-mono text-xs font-bold text-[#070b2d]">
        {ticket.ticketReference}
      </td>
      <td className="max-w-[200px] px-4 py-3">
        <p
          className="truncate text-sm font-semibold text-[#070b2d]"
          title={ticket.subject}
        >
          {ticket.subject}
        </p>
      </td>
      <td className="px-4 py-3 text-xs font-semibold text-[#59637d]">
        {getCategoryLabel(ticket.category)}
      </td>
      <td className="px-4 py-3">
        <PriorityBadge priority={ticket.priority} />
      </td>
      <td className="px-4 py-3">
        <TicketStatusBadge status={ticket.status} />
      </td>
      <td className="px-4 py-3 text-xs font-semibold text-[#59637d]">
        {formatDate(ticket.updatedAt)}
      </td>
      <td className="px-4 py-3">
        <Link
          className="inline-flex items-center gap-1 rounded-lg border border-[#5631d8] px-3 py-1.5 text-xs font-bold text-[#5631d8] transition hover:bg-[#ede9ff]"
          href={`/owner/help-center/tickets/${ticket.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          View
          <ArrowRight className="size-3" />
        </Link>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Ticket Card (Mobile)                                               */
/* ------------------------------------------------------------------ */

function MobileTicketCard({ ticket }: { ticket: OwnerSupportTicketListItem }) {
  return (
    <Link
      className="block rounded-lg border border-[#e1e5ed] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5631d8]"
      href={`/owner/help-center/tickets/${ticket.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="owner-card-title truncate text-[13px] font-semibold text-[#070b2d]">
          {ticket.subject}
        </p>
        <TicketStatusBadge status={ticket.status} />
      </div>
      <div className="owner-helper mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#59637d]">
        <span className="font-mono font-bold text-[#070b2d]">
          {ticket.ticketReference}
        </span>
        <span>·</span>
        <span>{getCategoryLabel(ticket.category)}</span>
      </div>
      <div className="owner-helper mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#59637d]">
        <span>{formatDate(ticket.updatedAt)}</span>
        <PriorityBadge priority={ticket.priority} />
      </div>
      <div className="mt-3 flex justify-end">
        <span className="owner-button-text inline-flex items-center gap-1 text-[11px] font-bold text-[#5631d8]">
          View ticket <ArrowRight className="size-3" />
        </span>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="grid min-h-56 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#ede9ff] text-[#5631d8]">
          <Ticket className="size-7" />
        </span>
        <h3 className="owner-card-title mt-4 text-[15px] font-semibold text-[#070b2d]">
          No support tickets found
        </h3>
        <p className="owner-body mx-auto mt-2 max-w-md text-[#59637d]">
          {message}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function OwnerHelpCenterContent({
  bookings,
  counts,
  tickets,
}: {
  bookings: OwnerSupportBookingReference[];
  counts: TicketCounts;
  tickets: OwnerSupportTicketListItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const tabCounts = useMemo(
    () => ({
      all: counts.all,
      open: counts.open,
      awaiting_dar: counts.awaitingDar,
      awaiting_you: counts.awaitingYou,
      resolved: counts.resolved,
    }),
    [counts],
  );

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const tabMatch =
        activeTab === "all" ||
        (activeTab === "open" &&
          (ticket.status === "open" || ticket.status === "in_progress")) ||
        (activeTab === "awaiting_dar" &&
          ticket.status === "awaiting_support") ||
        (activeTab === "awaiting_you" &&
          ticket.status === "awaiting_customer") ||
        (activeTab === "resolved" &&
          (ticket.status === "resolved" || ticket.status === "closed"));

      if (!tabMatch) return false;

      if (!q) return true;

      return (
        ticket.ticketReference.toLowerCase().includes(q) ||
        ticket.subject.toLowerCase().includes(q) ||
        getCategoryLabel(ticket.category).toLowerCase().includes(q)
      );
    });
  }, [tickets, activeTab, query]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / TICKETS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedTickets = filteredTickets.slice(
    (safePage - 1) * TICKETS_PER_PAGE,
    safePage * TICKETS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="owner-page-title text-[#070b2d]">Help Center</h1>
          <p className="owner-page-description mt-2 text-[#59637d]">
            Get support for your properties, bookings, and account.
          </p>
        </div>
        <button
          className="owner-button-text inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5824e6] px-5 text-white transition hover:brightness-110"
          onClick={() => setShowCreateForm(true)}
          type="button"
        >
          <Plus className="size-4" />
          Create request
        </button>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          bg="bg-[#ede9ff] text-[#5631d8]"
          count={counts.open}
          icon={Ticket}
          label="Open tickets"
        />
        <StatCard
          bg="bg-amber-50 text-amber-500"
          count={counts.awaitingDar}
          icon={Clock}
          label="Awaiting DAR"
        />
        <StatCard
          bg="bg-sky-50 text-sky-600"
          count={counts.awaitingYou}
          icon={MessageSquare}
          label="Awaiting you"
        />
        <StatCard
          bg="bg-emerald-50 text-emerald-600"
          count={counts.resolved}
          icon={CheckCircle2}
          label="Resolved / Closed"
        />
      </section>

      {/* ── My Support Requests ──────────────────────────────────── */}
      <section className="overflow-hidden rounded-xl border border-[#e1e5ed] bg-white">
        {/* Tabs + Search */}
        <div className="border-b border-[#e1e5ed] p-4">
          <h2 className="owner-card-title font-semibold text-[#070b2d]">
            My Support Requests
          </h2>
          <div className="mt-4 flex gap-2 overflow-x-auto" role="tablist" aria-label="Ticket status filters">
            {TICKET_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = tabCounts[tab.id];
              return (
                <button
                  key={tab.id}
                  aria-selected={isActive}
                  className={`owner-button-text shrink-0 rounded-lg border px-3 py-2 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5631d8] ${
                    isActive
                      ? "border-[#5631d8] bg-[#5631d8] text-white"
                      : "border-[#e1e5ed] bg-white text-[#59637d] hover:border-[#5631d8] hover:text-[#5631d8]"
                  }`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  role="tab"
                  type="button"
                >
                  {tab.label}{" "}
                  <span className={isActive ? "text-white/70" : "text-[#59637d]"}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8794b0]" />
            <input
              aria-label="Search tickets by reference, subject, or category"
              className="h-11 w-full rounded-lg border border-[#e1e5ed] bg-white pl-10 pr-4 text-[13px] font-semibold text-[#070b2d] outline-none transition focus:border-[#5631d8] focus:ring-2 focus:ring-[rgba(86,49,216,0.12)]"
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ticket reference, subject, or category..."
              type="text"
              value={query}
            />
            {query ? (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#59637d] hover:text-[#070b2d]"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
                type="button"
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>

        {/* Content */}
        {paginatedTickets.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[740px] text-left text-[13px]">
                <thead className="bg-[#f7f8fb] text-[11px] font-bold text-[#59637d]">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e5ed]">
                  {paginatedTickets.map((ticket) => (
                    <DesktopTicketRow key={ticket.id} ticket={ticket} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 md:hidden">
              {paginatedTickets.map((ticket) => (
                <MobileTicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            {/* Pagination */}
            {filteredTickets.length > TICKETS_PER_PAGE ? (
              <div className="border-t border-[#e1e5ed] p-4">
                <nav
                  aria-label="Ticket pagination"
                  className="flex items-center justify-center gap-3"
                >
                  <button
                    aria-label="Previous page"
                    className="owner-button-text inline-flex items-center gap-2 rounded-lg border border-[#e1e5ed] px-4 py-2.5 text-[13px] font-semibold text-[#070b2d] transition hover:bg-[#f7f8fb] disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    type="button"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </button>
                  <span className="owner-label text-[13px] text-[#59637d]">
                    Page {safePage} of {totalPages}
                  </span>
                  <button
                    aria-label="Next page"
                    className="owner-button-text inline-flex items-center gap-2 rounded-lg border border-[#e1e5ed] px-4 py-2.5 text-[13px] font-semibold text-[#070b2d] transition hover:bg-[#f7f8fb] disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    type="button"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </nav>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            message={
              query
                ? "No tickets match your search or filters."
                : "No support requests yet. Click 'Create request' to get help from DAR."
            }
          />
        )}
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-[#e1e5ed] bg-white p-5">
          <h2 className="owner-card-title font-semibold text-[#070b2d]">
            Frequently Asked Questions
          </h2>
          <div className="mt-4">
            <FAQAccordion items={FAQ_ITEMS} />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#e1e5ed] bg-white p-5">
          <h2 className="owner-card-title font-semibold text-[#070b2d]">
            Help Resources
          </h2>
          <div className="owner-body mt-4 space-y-3 text-[#59637d]">
            <p>
              Visit the Help Center to find answers to common questions about
              managing your properties, handling bookings, and understanding
              your account settings.
            </p>
            <p>
              If you need more help, create a support request and our team will
              get back to you as soon as possible.
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              { icon: HelpCircle, label: "Account & Settings", desc: "Manage your owner profile and preferences" },
              { icon: Ticket, label: "Bookings & Reservations", desc: "Help with booking requests and management" },
              { icon: ShieldAlert, label: "Payments & Payouts", desc: "Assistance with payment and payout issues" },
            ].map((item) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-[#e1e5ed] p-3 transition hover:border-[#5631d8] hover:bg-[#f7f8fb]"
                key={item.label}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#ede9ff] text-[#5631d8]">
                  <item.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="owner-card-title text-[13px] font-semibold text-[#070b2d]">
                    {item.label}
                  </p>
                  <p className="owner-helper text-[#59637d]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Create Ticket Modal ──────────────────────────────────── */}
      {showCreateForm ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateForm(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-ticket-title"
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-[#e1e5ed] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e1e5ed] px-6 py-4">
              <h2
                className="owner-card-title font-semibold text-[#070b2d]"
                id="create-ticket-title"
              >
                Create Support Request
              </h2>
              <button
                aria-label="Close"
                className="grid size-8 place-items-center rounded-lg border border-[#e1e5ed] text-[#59637d] transition hover:border-[#5631d8] hover:text-[#5631d8]"
                onClick={() => setShowCreateForm(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <OwnerCreateTicketForm
                bookings={bookings}
                onSuccess={(ticketId) => {
                  setShowCreateForm(false);
                  router.push(`/owner/help-center/tickets/${ticketId}`);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
