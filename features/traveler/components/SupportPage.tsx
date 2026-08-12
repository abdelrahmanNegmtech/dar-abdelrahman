"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  FileUp,
  Headphones,
  LifeBuoy,
  Plus,
  Search,
  ShieldAlert,
  Ticket,
  X,
} from "lucide-react";
import { useToast } from "@/features/system-states/hooks/useToast";
import { createSupportTicket } from "../actions";
import type { SupportTicket, TravelerBooking } from "../types";
import { supportTicketSchema, type SupportTicketFormValues } from "../validation";
import {
  Card,
  EmptyState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  cx,
} from "./shared";

// ─── Constants ───────────────────────────────────────────────────────

type TicketTab = "all" | "open" | "awaiting_dar" | "awaiting_you" | "resolved" | "escalated";

const ticketTabs: Array<{ id: TicketTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "awaiting_dar", label: "Awaiting DAR" },
  { id: "awaiting_you", label: "Awaiting you" },
  { id: "resolved", label: "Resolved" },
  { id: "escalated", label: "Escalated" },
];

const TICKETS_PER_PAGE = 10;

const helpArticles = [
  { content: "DAR reviews payment receipts within 30 minutes during business hours. Once verified, the booking status updates automatically and you receive a confirmation notification. If verification takes longer, you can contact support or upload a clearer receipt.", id: "payment-verification", title: "How payment verification works" },
  { content: "To cancel a booking, go to your bookings page and click 'View details' on the booking you want to cancel. If your booking is within the free cancellation period, the full amount is refunded. Cancellation policies vary by property and are shown before you book.", id: "cancel-booking", title: "How to cancel a booking" },
  { content: "Refunds are processed after a booking is cancelled according to the property's cancellation policy. Processing takes 5–10 business days. The refund is sent to the original payment method. You can track refund status in your payments page.", id: "refunds", title: "When refunds are issued" },
  { content: "Owners receive payouts 24 hours after guest check-in for verified bookings. Payouts are sent to the bank account or wallet registered in their DAR owner profile. A payout summary is available in the owner dashboard.", id: "owner-payment", title: "How owners get paid" },
  { content: "Verification documents can be uploaded from your booking details page or through the support ticket attachment option. Accepted formats are PDF, PNG, and JPG up to 10 MB per file. Make sure the document is clearly visible and matches the booking details.", id: "upload-docs", title: "How to upload verification documents" },
];

const faqItems = [
  { answer: "Most receipts are reviewed in less than 30 minutes during business hours.", id: "payment", question: "How long does payment verification take?" },
  { answer: "Use DAR Messages after the booking request is submitted. The messaging feature lets you chat with the property owner directly.", id: "owner", question: "How can I contact the owner?" },
  { answer: "Refund routing depends on the original payment method. Card payments are refunded to the same card. Wallet payments are returned to your DAR wallet.", id: "refund", question: "Can I get a refund to InstaPay?" },
  { answer: "Log in, go to your profile page, and update your information. Changes to payment details may require re-verification for security.", id: "update-profile", question: "How do I update my profile or payment details?" },
  { answer: "All communication before booking goes through DAR Messages. Once a booking is confirmed, you can contact the owner directly through the platform.", id: "contact-owner", question: "Can I contact the owner before booking?" },
];

const categoryOptions = [
  "Booking help",
  "Payments",
  "Refunds",
  "Property issue",
  "Check-in / access",
  "Safety or security",
  "Account",
  "Technical issue",
  "Other",
];

// ─── Help Article Modal ──────────────────────────────────────────

function HelpArticleModal({
  article,
  onClose,
}: {
  article: typeof helpArticles[number];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-article-title"
    >
      <div
        className="w-full max-w-lg rounded-dar border border-dar-border bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-black text-dar-navy" id="help-article-title">{article.title}</h2>
          <button
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-dar-border text-dar-muted transition hover:border-dar-primary hover:text-dar-primary"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-4 text-sm font-semibold leading-6 text-dar-muted">{article.content}</p>
        <div className="mt-6 flex justify-end">
          <PrimaryButton
            onClick={() => {
              onClose();
              document.getElementById("create-support-ticket")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Still need help? Create a ticket
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Accordion ───────────────────────────────────────────────

function FAQAccordion({ items }: { items: typeof faqItems }) {
  const [openId, setOpenId] = useState<string | null>("payment");

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `faq-panel-${item.id}`;
        const buttonId = `faq-button-${item.id}`;
        return (
          <div className="rounded-xl border border-dar-border" key={item.id}>
            <h3>
              <button
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-black text-dar-navy transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dar-primary"
                id={buttonId}
                onClick={() => toggle(item.id)}
                type="button"
              >
                {item.question}
                <ChevronDown
                  className={cx("size-4 text-dar-muted transition", isOpen ? "rotate-180" : "")}
                />
              </button>
            </h3>
            <div
              aria-labelledby={buttonId}
              className={cx(
                "overflow-hidden transition-all",
                isOpen ? "max-h-96 pb-4" : "max-h-0",
              )}
              id={panelId}
              role="region"
            >
              <p className="px-4 text-sm font-semibold leading-6 text-dar-muted">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Create Ticket Form ──────────────────────────────────────────

function CreateTicketForm({ bookings }: { bookings: TravelerBooking[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<SupportTicketFormValues>({
    defaultValues: {
      bookingId: "",
      category: "Booking help",
      message: "",
      priority: "medium",
      subject: "",
    },
  });

  const watchedMessage = useWatch({ control, name: "message" });
  const priorityValue = useWatch({ control, name: "priority" });
  const messageLength = (watchedMessage ?? "").length;
  const showUrgentWarning = priorityValue === "urgent";

  function onSubmit(values: SupportTicketFormValues) {
    if (files.length) {
      showToast({
        description: "Support attachment uploads are not connected in Phase 16 yet.",
        title: "Attachments are deferred",
        type: "info",
      });
      return;
    }

    const parsed = supportTicketSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof SupportTicketFormValues;
        if (field) setError(field, { message: issue.message });
      }
      showToast({
        description: "Please fix the highlighted fields.",
        title: "Ticket needs attention",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      const result = await createSupportTicket(parsed.data);
      showToast({
        description: result.message,
        title: result.ok ? "Ticket submitted" : "Could not submit ticket",
        type: result.ok ? "success" : "error",
      });
      if (result.ok) {
        reset();
        setFiles([]);
      }
    });
  }

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-dar-navy" id="create-support-ticket">Create a new support ticket</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Subject */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-dar-muted" htmlFor="ticket-subject">Subject</label>
          <input
            aria-describedby={errors.subject ? "ticket-subject-error" : undefined}
            aria-invalid={errors.subject ? true : undefined}
            className="h-11 w-full rounded-xl border border-dar-border bg-white px-3 text-sm font-semibold text-dar-navy outline-none transition focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)]"
            id="ticket-subject"
            placeholder="Briefly describe your issue"
            type="text"
            {...register("subject")}
          />
          {errors.subject ? <p className="text-xs font-semibold text-dar-error" id="ticket-subject-error">{errors.subject.message}</p> : null}
        </div>

        {/* Related booking */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-dar-muted" htmlFor="ticket-booking">Related booking / property</label>
          <select
            className="h-11 w-full rounded-xl border border-dar-border bg-white px-3 text-sm font-bold text-dar-navy outline-none transition focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)]"
            id="ticket-booking"
            {...register("bookingId")}
          >
            <option value="">General issue / No booking</option>
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.reference} - {booking.property.title} ({new Date(booking.checkIn).toLocaleDateString("en-US", { day: "numeric", month: "short" })} – {new Date(booking.checkOut).toLocaleDateString("en-US", { day: "numeric", month: "short" })})
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-dar-muted" htmlFor="ticket-category">Category</label>
          <select
            className="h-11 w-full rounded-xl border border-dar-border bg-white px-3 text-sm font-bold text-dar-navy outline-none transition focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)]"
            id="ticket-category"
            {...register("category")}
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-dar-muted" htmlFor="ticket-priority">Priority</label>
          <select
            className="h-11 w-full rounded-xl border border-dar-border bg-white px-3 text-sm font-bold text-dar-navy outline-none transition focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)]"
            id="ticket-priority"
            {...register("priority")}
          >
            <option value="low">Low — General inquiry</option>
            <option value="medium">Medium — Needs attention</option>
            <option value="high">High — Important issue</option>
            <option value="urgent">Urgent — Critical issue</option>
          </select>
          {showUrgentWarning ? (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-dar-error">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                For urgent safety issues, call our emergency line at 16666. Our team monitors urgent tickets within 15 minutes.
              </span>
            </div>
          ) : null}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-dar-muted" htmlFor="ticket-message">Message</label>
          <textarea
            aria-describedby={errors.message ? "ticket-message-error" : undefined}
            aria-invalid={errors.message ? true : undefined}
            className="min-h-28 w-full resize-none rounded-xl border border-dar-border bg-white px-3 py-3 text-sm font-semibold text-dar-navy outline-none transition focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)]"
            id="ticket-message"
            placeholder="Describe your issue in detail. Include any relevant information to help us assist you faster."
            {...register("message")}
          />
          <div className="flex justify-between">
            {errors.message ? <p className="text-xs font-semibold text-dar-error" id="ticket-message-error">{errors.message.message}</p> : <span />}
            <p className={cx("text-xs font-semibold", messageLength > 1800 ? "text-dar-error" : "text-dar-muted")}>
              {messageLength} / 2000
            </p>
          </div>
        </div>

        {/* Attachment */}
        <div>
          <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-dar-primary bg-dar-primary-soft/40 p-4 text-center text-sm font-bold text-dar-primary transition hover:bg-dar-primary-soft">
            <FileUp className="mb-1.5 size-5" />
            Drag and drop files here or click to browse
            <span className="mt-1 text-xs font-semibold text-dar-muted">PDF, PNG, JPG up to 10 MB each</span>
            <input
              accept="application/pdf,image/png,image/jpeg"
              className="sr-only"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              type="file"
            />
          </label>
          {files.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from(files).map((file, idx) => (
                <span
                  className="inline-flex items-center gap-2 rounded-lg border border-dar-border px-3 py-1.5 text-xs font-semibold text-dar-muted"
                  key={`${file.name}-${idx}`}
                >
                  {file.name}
                  <button
                    aria-label={`Remove ${file.name}`}
                    className="text-dar-error hover:text-red-700"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                    type="button"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <PrimaryButton disabled={isPending} loading={isPending} loadingLabel="Submitting ticket..." type="submit">
          <Plus className="size-4" />
          Submit ticket
        </PrimaryButton>
      </form>
    </Card>
  );
}

// ─── Mobile Ticket Card ──────────────────────────────────────────

function TicketCard({
  ticket,
  onView,
}: {
  ticket: SupportTicket;
  onView: () => void;
}) {
  return (
    <div
      className="rounded-dar border border-dar-border bg-white p-4 shadow-dar-card transition hover:-translate-y-0.5 hover:shadow-dar-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary"
      onClick={onView}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onView(); } }}
      role="button"
      tabIndex={0}
      aria-label={`View ticket ${ticket.reference}: ${ticket.subject}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate font-black text-dar-navy text-sm">{ticket.subject}</h3>
        <StatusBadge label={ticket.status} tone="ticket" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-dar-muted">
        <span className="font-mono font-black text-dar-navy">{ticket.reference}</span>
        <span>&middot;</span>
        <span>{ticket.category}</span>
        {ticket.booking ? (
          <>
            <span>&middot;</span>
            <span>{ticket.booking.reference}</span>
          </>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-dar-muted">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3" />
          {new Date(ticket.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
        </span>
        <StatusBadge label={ticket.priority} tone="priority" />
      </div>
      <div className="mt-3 flex justify-end">
        <span className="inline-flex items-center gap-1 text-xs font-black text-dar-primary">
          View ticket <ArrowRight className="size-3" />
        </span>
      </div>
    </div>
  );
}

// ─── Main Support Page ───────────────────────────────────────────

export function SupportPage({
  bookings,
  tickets,
}: {
  bookings: TravelerBooking[];
  tickets: SupportTicket[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<typeof helpArticles[number] | null>(null);
  const tab = (searchParams.get("tab") as TicketTab | null) ?? "all";

  function setTab(nextTab: TicketTab) {
    const next = new URLSearchParams(searchParams.toString());
    if (nextTab === "all") next.delete("tab");
    else next.set("tab", nextTab);
    router.replace(`${pathname}?${next.toString()}`);
    setPage(1);
  }

  // ── Tab counts ──

  const tabCounts = useMemo(() => {
    const all = tickets.length;
    const open = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
    const awaitingDar = tickets.filter((t) => t.status === "awaiting_dar").length;
    const awaitingYou = tickets.filter((t) => t.status === "awaiting_you").length;
    const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
    const escalated = tickets.filter((t) => t.status === "escalated").length;
    return { all, awaitingDar, awaitingYou, escalated, open, resolved };
  }, [tickets]);

  // ── Filtered & paginated tickets ──

  const visibleTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const tabMatch =
        tab === "all" ||
        (tab === "open" && (ticket.status === "open" || ticket.status === "in_progress")) ||
        (tab === "awaiting_dar" && ticket.status === "awaiting_dar") ||
        (tab === "awaiting_you" && ticket.status === "awaiting_you") ||
        (tab === "resolved" && (ticket.status === "resolved" || ticket.status === "closed")) ||
        (tab === "escalated" && ticket.status === "escalated");
      if (!tabMatch) return false;

      const searchMatch =
        !normalizedQuery ||
        ticket.reference.toLowerCase().includes(normalizedQuery) ||
        ticket.subject.toLowerCase().includes(normalizedQuery) ||
        ticket.category.toLowerCase().includes(normalizedQuery) ||
        (ticket.booking?.reference ?? "").toLowerCase().includes(normalizedQuery);
      return searchMatch;
    });
  }, [query, tab, tickets]);

  const totalPages = Math.max(1, Math.ceil(visibleTickets.length / TICKETS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedTickets = visibleTickets.slice((safePage - 1) * TICKETS_PER_PAGE, safePage * TICKETS_PER_PAGE);

  // ── Stats ──

  const stats = useMemo(() => ({
    awaiting: tickets.filter((t) => t.status === "awaiting_dar").length,
    escalated: tickets.filter((t) => t.status === "escalated").length,
    open: tickets.filter((t) => t.status === "open" || t.status === "awaiting_dar" || t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
  }), [tickets]);

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={() => document.getElementById("create-support-ticket")?.scrollIntoView({ behavior: "smooth" })}>
              <Plus className="size-4" />
              Create ticket
            </PrimaryButton>
          </div>
        }
        description="Get support, track tickets, browse FAQs, and manage complaints in one place."
        title="Help Center"
      />

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div
          className="rounded-dar border border-dar-border bg-dar-card p-4 shadow-dar-card transition hover:-translate-y-0.5 hover:shadow-dar-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary"
          onClick={() => setTab("open")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTab("open"); } }}
          role="button"
          tabIndex={0}
          aria-label="View open tickets"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-dar-primary-soft text-dar-primary"><Ticket className="size-5" /></span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-dar-muted">Open tickets</p>
              <p className="mt-1 text-2xl font-black text-dar-navy">{stats.open}</p>
            </div>
          </div>
        </div>
        <div
          className="rounded-dar border border-dar-border bg-dar-card p-4 shadow-dar-card transition hover:-translate-y-0.5 hover:shadow-dar-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary"
          onClick={() => setTab("awaiting_dar")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTab("awaiting_dar"); } }}
          role="button"
          tabIndex={0}
          aria-label="View awaiting reply tickets"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-500"><Clock className="size-5" /></span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-dar-muted">Awaiting reply</p>
              <p className="mt-1 text-2xl font-black text-dar-navy">{stats.awaiting}</p>
            </div>
          </div>
        </div>
        <div
          className="rounded-dar border border-dar-border bg-dar-card p-4 shadow-dar-card transition hover:-translate-y-0.5 hover:shadow-dar-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary"
          onClick={() => setTab("resolved")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTab("resolved"); } }}
          role="button"
          tabIndex={0}
          aria-label="View resolved tickets"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-5" /></span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-dar-muted">Resolved this month</p>
              <p className="mt-1 text-2xl font-black text-dar-navy">{stats.resolved}</p>
            </div>
          </div>
        </div>
        <section className="rounded-dar border border-dar-border bg-dar-card p-4 shadow-dar-card">
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-600"><Clock className="size-5" /></span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-dar-muted">Average response time</p>
              <p className="mt-1 text-2xl font-black text-dar-navy">24 min</p>
            </div>
          </div>
        </section>
        <div
          className="rounded-dar border border-dar-border bg-dar-card p-4 shadow-dar-card transition hover:-translate-y-0.5 hover:shadow-dar-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary"
          onClick={() => setTab("escalated")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTab("escalated"); } }}
          role="button"
          tabIndex={0}
          aria-label="View escalated tickets"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-red-50 text-red-600"><ShieldAlert className="size-5" /></span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-dar-muted">Escalated cases</p>
              <p className="mt-1 text-2xl font-black text-dar-navy">{stats.escalated}</p>
            </div>
          </div>
        </div>
        <section className="rounded-dar border border-dar-border bg-dar-card p-4 shadow-dar-card">
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-dar-primary-soft text-dar-primary"><LifeBuoy className="size-5" /></span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-dar-muted">Satisfaction score</p>
              <p className="mt-1 text-2xl font-black text-dar-navy">4.8/5</p>
            </div>
          </div>
        </section>
      </section>

      {/* Search + Quick Tags */}
      <Card className="p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dar-muted" />
            <input
              aria-label="Search tickets by ID, category, or booking reference"
              className="h-11 w-full rounded-xl border border-dar-border bg-white pl-10 pr-4 text-sm font-semibold text-dar-navy outline-none transition focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)]"
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search tickets by ID, subject, or booking reference..."
              type="text"
              value={query}
            />
          </div>
          {query ? (
            <SecondaryButton onClick={() => { setQuery(""); setPage(1); }}>
              Clear
            </SecondaryButton>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {categoryOptions.map((item) => (
            <button
              className={cx(
                "rounded-xl border px-3 py-2 text-xs font-black transition",
                query.toLowerCase() === item.toLowerCase()
                  ? "border-dar-primary bg-dar-primary text-white"
                  : "border-dar-border bg-white text-dar-muted hover:border-dar-primary hover:text-dar-primary",
              )}
              key={item}
              onClick={() => setQuery(query.toLowerCase() === item.toLowerCase() ? "" : item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Content: Tickets + Create Form */}
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {/* Tickets Section */}
          <Card className="overflow-visible">
            {/* Header + Tabs */}
            <div className="border-b border-dar-border p-4">
              <h2 className="text-lg font-black text-dar-navy">My support tickets</h2>
              <div className="mt-4 flex gap-2 overflow-x-auto" role="tablist" aria-label="Ticket status filters">
                {ticketTabs.map((item) => {
                  const count =
                    item.id === "all" ? tabCounts.all
                    : item.id === "open" ? tabCounts.open
                    : item.id === "awaiting_dar" ? tabCounts.awaitingDar
                    : item.id === "awaiting_you" ? tabCounts.awaitingYou
                    : item.id === "resolved" ? tabCounts.resolved
                    : tabCounts.escalated;
                  const isActive = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      role="tab"
                      aria-selected={isActive}
                      className={cx(
                        "shrink-0 rounded-lg border px-3 py-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary",
                        isActive
                          ? "border-dar-primary bg-dar-primary text-white"
                          : "border-dar-border bg-white text-dar-muted hover:border-dar-primary hover:text-dar-primary",
                      )}
                      onClick={() => setTab(item.id)}
                      type="button"
                    >
                      {item.label} <span className={cx(isActive ? "text-white/70" : "text-dar-muted")}>({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop table (hidden on small screens) */}
            {paginatedTickets.length > 0 ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black text-dar-muted">
                      <tr>
                        <th className="w-[100px] px-4 py-3">Ticket ID</th>
                        <th className="min-w-[120px] px-4 py-3">Subject</th>
                        <th className="w-[90px] px-4 py-3">Category</th>
                        <th className="w-[120px] px-4 py-3">Booking</th>
                        <th className="w-[70px] px-4 py-3">Priority</th>
                        <th className="w-[70px] px-4 py-3">Status</th>
                        <th className="w-[70px] px-4 py-3">Created</th>
                        <th className="w-[60px] px-4 py-3">Updated</th>
                        <th className="w-[70px] px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dar-border">
                      {paginatedTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="transition hover:bg-slate-50 cursor-pointer"
                          onClick={() => router.push(`/traveler/support/tickets/${ticket.id}`)}
                          onKeyDown={(e) => { if (e.key === "Enter") { router.push(`/traveler/support/tickets/${ticket.id}`); } }}
                          tabIndex={0}
                          role="link"
                          aria-label={`View ticket ${ticket.reference}`}
                        >
                          <td className="px-4 py-3 font-mono text-xs font-black text-dar-navy">{ticket.reference}</td>
                          <td className="max-w-[200px] px-4 py-3">
                            <p className="truncate font-semibold text-dar-navy" title={ticket.subject}>{ticket.subject}</p>
                          </td>
                          <td className="px-4 py-3"><StatusBadge label={ticket.category} /></td>
                          <td className="px-4 py-3">
                            <span className="truncate block max-w-[110px] text-xs font-semibold text-dar-muted" title={ticket.booking?.reference ?? "General"}>
                              {ticket.booking?.reference ?? "General"}
                            </span>
                          </td>
                          <td className="px-4 py-3"><StatusBadge label={ticket.priority} tone="priority" /></td>
                          <td className="px-4 py-3"><StatusBadge label={ticket.status} tone="ticket" /></td>
                          <td className="px-4 py-3 text-xs font-semibold text-dar-muted">
                            {new Date(ticket.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-dar-muted">
                            {new Date(ticket.updatedAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              className="inline-flex items-center gap-1 rounded-lg border border-dar-primary px-3 py-1.5 text-xs font-black text-dar-primary transition hover:bg-dar-primary-soft"
                              href={`/traveler/support/tickets/${ticket.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                              <ArrowRight className="size-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards (shown on small screens) */}
                <div className="space-y-3 p-4 md:hidden">
                  {paginatedTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onView={() => router.push(`/traveler/support/tickets/${ticket.id}`)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {visibleTickets.length > TICKETS_PER_PAGE ? (
                  <div className="border-t border-dar-border p-4">
                    <nav aria-label="Ticket pagination" className="flex items-center justify-center gap-3">
                      <button
                        aria-label="Previous page"
                        className="inline-flex items-center gap-2 rounded-xl border border-dar-border px-4 py-2.5 text-sm font-bold text-dar-navy transition hover:bg-dar-primary-soft disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        type="button"
                      >
                        <ChevronLeft className="size-4" />
                        Previous
                      </button>
                      <span className="text-sm font-bold text-dar-muted">
                        Page {safePage} of {totalPages}
                      </span>
                      <button
                        aria-label="Next page"
                        className="inline-flex items-center gap-2 rounded-xl border border-dar-border px-4 py-2.5 text-sm font-bold text-dar-navy transition hover:bg-dar-primary-soft disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
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
              <div className="p-5">
                <EmptyState
                  description={query ? "No tickets match your search or filters." : "No tickets yet. Create a support ticket to get help."}
                  icon={Ticket}
                  title="No support tickets found"
                />
              </div>
            )}
          </Card>

          {/* Help Articles + FAQ + Create Ticket (3-column on desktop) */}
          <div className="grid min-w-0 gap-6 lg:grid-cols-3">
            {/* Popular Help Articles */}
            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Popular help articles</h2>
              <div className="mt-4 grid gap-3">
                {helpArticles.map((article) => (
                  <button
                    className="rounded-xl border border-dar-border p-3 text-left text-sm font-bold text-dar-navy transition hover:border-dar-primary hover:bg-dar-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary"
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    type="button"
                  >
                    <span className="flex items-center justify-between gap-2">
                      {article.title}
                      <ArrowRight className="size-4 shrink-0 text-dar-primary" />
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* FAQ */}
            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Frequently asked questions</h2>
              <div className="mt-4">
                <FAQAccordion items={faqItems} />
              </div>
            </Card>

            {/* Create Ticket Form */}
            <div id="create-support-ticket">
              <CreateTicketForm bookings={bookings} />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-5">
          {/* Urgent Help */}
          <Card className="bg-dar-dark p-5 text-white">
            <span className="grid size-14 place-items-center rounded-full bg-dar-warning text-dar-dark">
              <Headphones className="size-8" />
            </span>
            <h2 className="mt-4 text-xl font-black">Need urgent help?</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              24/7 support is available for urgent booking or payment issues.
            </p>
            <p className="mt-3 text-sm font-bold text-dar-warning">
              Call 16666 for immediate assistance, or create an urgent ticket above.
            </p>
            <PrimaryButton
              className="mt-5 w-full bg-dar-warning text-dar-dark shadow-none ![background-image:none]"
              onClick={() => {
                document.getElementById("create-support-ticket")?.scrollIntoView({ behavior: "smooth" });
                // Set priority to urgent via the select — this requires a ref which is inside CreateTicketForm
                // Instead we just scroll and highlight
              }}
            >
              Create urgent ticket
            </PrimaryButton>
          </Card>

          {/* Support Resources */}
          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Support resources</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold">
              {[
                { icon: FileText, label: "Terms of Service", href: "/legal/terms" },
                { icon: FileText, label: "Cancellation Policy", href: "/legal/cancellation" },
                { icon: FileText, label: "Privacy Policy", href: "/legal/privacy" },
              ].map((resource) => (
                <Link
                  className="flex items-center gap-3 rounded-xl border border-dar-border p-3 text-dar-navy transition hover:border-dar-primary hover:bg-dar-primary-soft"
                  href={resource.href}
                  key={resource.label}
                >
                  <resource.icon className="size-5 text-dar-primary" />
                  {resource.label}
                  <ExternalLink className="ml-auto size-4 shrink-0 text-dar-muted" />
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      {/* Help Article Modal */}
      {selectedArticle ? (
        <HelpArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      ) : null}
    </div>
  );
}
