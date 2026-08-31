"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { createOwnerSupportTicket } from "@/features/support/owner/owner-support-actions";
import type { OwnerSupportBookingReference } from "@/features/support/owner/owner-support-types";
import { ownerSupportTicketSchema } from "@/features/support/owner/owner-support-validation";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "@/features/support/owner/owner-support-utils";

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const OWNER_SUPPORT_DEFAULTS = {
  category: "other",
  priority: "medium",
} as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OwnerCreateTicketForm({
  bookings,
  onSuccess,
}: {
  bookings: OwnerSupportBookingReference[];
  onSuccess: (ticketId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<string>(
    OWNER_SUPPORT_DEFAULTS.category,
  );
  const [priority, setPriority] = useState<string>(
    OWNER_SUPPORT_DEFAULTS.priority,
  );
  const [bookingId, setBookingId] = useState("");
  const [message, setMessage] = useState("");

  const messageLength = message.length;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const input = {
      bookingId: bookingId || undefined,
      category,
      message,
      priority,
      subject,
    };

    const parsed = ownerSupportTicketSchema.safeParse(input);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      const result = await createOwnerSupportTicket(parsed.data);

      if (result.ok) {
        onSuccess(result.data.ticketId);
      } else {
        setServerError(result.message);
      }
    });
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-[#e1e5ed] bg-white px-3 text-[13px] font-semibold text-[#070b2d] outline-none transition focus:border-[#5631d8] focus:ring-2 focus:ring-[rgba(86,49,216,0.12)]";
  const errorTextClass = "mt-1 text-xs font-semibold text-[#e11d48]";
  const labelClass = "owner-label text-[13px] font-semibold text-[#59637d]";

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {serverError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-[#e11d48]">
          {serverError}
        </div>
      ) : null}

      {/* Subject */}
      <div>
        <label className={labelClass} htmlFor="owner-ticket-subject">
          Subject
        </label>
        <input
          aria-describedby={
            fieldErrors.subject ? "owner-ticket-subject-error" : undefined
          }
          aria-invalid={fieldErrors.subject ? true : undefined}
          className={`${inputClass} mt-2`}
          disabled={isPending}
          id="owner-ticket-subject"
          maxLength={120}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Briefly describe your issue"
          type="text"
          value={subject}
        />
        {fieldErrors.subject ? (
          <p className={errorTextClass} id="owner-ticket-subject-error">
            {fieldErrors.subject}
          </p>
        ) : null}
      </div>

      {/* Booking */}
      <div>
        <label className={labelClass} htmlFor="owner-ticket-booking">
          Related booking / property
        </label>
        <select
          className={`${inputClass} mt-2`}
          disabled={isPending}
          id="owner-ticket-booking"
          onChange={(e) => setBookingId(e.target.value)}
          value={bookingId}
        >
          <option value="">General issue / No booking</option>
          {bookings.map((booking) => (
            <option key={booking.id} value={booking.id}>
              {booking.reference} — {booking.propertyTitle}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass} htmlFor="owner-ticket-category">
          Category
        </label>
        <select
          className={`${inputClass} mt-2`}
          disabled={isPending}
          id="owner-ticket-category"
          onChange={(e) => setCategory(e.target.value)}
          value={category}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div>
        <label className={labelClass} htmlFor="owner-ticket-priority">
          Priority
        </label>
        <select
          className={`${inputClass} mt-2`}
          disabled={isPending}
          id="owner-ticket-priority"
          onChange={(e) => setPriority(e.target.value)}
          value={priority}
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className={labelClass} htmlFor="owner-ticket-message">
          Message
        </label>
        <textarea
          aria-describedby={
            fieldErrors.message ? "owner-ticket-message-error" : undefined
          }
          aria-invalid={fieldErrors.message ? true : undefined}
          className={`${inputClass} mt-2 min-h-[120px] resize-none py-3`}
          disabled={isPending}
          id="owner-ticket-message"
          maxLength={2000}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue in detail. Include any relevant information to help us assist you faster."
          value={message}
        />
        <div className="mt-1 flex justify-between">
          {fieldErrors.message ? (
            <p className={errorTextClass} id="owner-ticket-message-error">
              {fieldErrors.message}
            </p>
          ) : (
            <span />
          )}
          <p
            className={`text-xs font-semibold ${messageLength > 1800 ? "text-[#e11d48]" : "text-[#8794b0]"}`}
          >
            {messageLength} / 2000
          </p>
        </div>
      </div>

      {/* Submit */}
      <button
        className="owner-button-text inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5824e6] px-5 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : null}
        {isPending ? "Submitting..." : "Submit support request"}
      </button>
    </form>
  );
}
