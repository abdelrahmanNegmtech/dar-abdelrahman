"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Send } from "lucide-react";
import {
  replyToOwnerSupportTicket,
  updateOwnerSupportTicketStatus,
} from "@/features/support/owner/owner-support-actions";
import type {
  OwnerSupportTicketDetail,
} from "@/features/support/owner/owner-support-types";
import {
  getCategoryLabel,
  getPriorityColorClass,
  getPriorityLabel,
  getStatusColorClass,
  getStatusLabel,
  getRoleLabel,
  formatDate,
  formatDateTime,
} from "@/features/support/owner/owner-support-utils";

/* ------------------------------------------------------------------ */
/*  Status Info Card                                                   */
/* ------------------------------------------------------------------ */

function StatusInfoRow({ ticket }: { ticket: OwnerSupportTicketDetail }) {
  const statusColors = getStatusColorClass(ticket.status);
  const priorityColors = getPriorityColorClass(ticket.priority);

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <div>
        <p className="owner-helper font-semibold text-[#59637d]">Status</p>
        <span
          className={`owner-badge mt-2 inline-flex items-center rounded-lg px-2.5 py-1 font-bold ${statusColors.bg} ${statusColors.text}`}
        >
          {getStatusLabel(ticket.status)}
        </span>
      </div>
      <div>
        <p className="owner-helper font-semibold text-[#59637d]">Priority</p>
        <span
          className={`owner-badge mt-2 inline-flex items-center rounded-lg px-2.5 py-1 font-bold capitalize ${priorityColors.bg} ${priorityColors.text}`}
        >
          {getPriorityLabel(ticket.priority)}
        </span>
      </div>
      <div>
        <p className="owner-helper font-semibold text-[#59637d]">Category</p>
        <p className="owner-card-title mt-2 font-semibold text-[#070b2d]">
          {getCategoryLabel(ticket.category)}
        </p>
      </div>
      <div>
        <p className="owner-helper font-semibold text-[#59637d]">Last Updated</p>
        <p className="owner-card-title mt-2 font-semibold text-[#070b2d]">
          {formatDate(ticket.updatedAt)}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Message Bubble                                                     */
/* ------------------------------------------------------------------ */

function MessageBubble({
  message,
}: {
  message: OwnerSupportTicketDetail["messages"][number];
}) {
  const isOwner = message.senderRole === "owner";
  const isSupport =
    message.senderRole === "support_staff" || message.senderRole === "system";

  return (
    <div
      className={`rounded-lg p-4 ${
        isSupport ? "bg-[#f7f8fb]" : "bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="owner-card-title font-semibold text-[#070b2d]">
          {message.senderName}
        </span>
        <span
          className={`owner-badge inline-flex items-center rounded-lg px-2 py-0.5 font-bold ${
            isOwner
              ? "bg-[#ede9ff] text-[#5631d8]"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {getRoleLabel(message.senderRole)}
        </span>
        <span className="owner-helper text-[#8794b0]">
          {formatDateTime(message.createdAt)}
        </span>
      </div>
      <p className="owner-body mt-2 whitespace-pre-wrap leading-relaxed text-[#070b2d]">
        {message.message}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reply Form                                                         */
/* ------------------------------------------------------------------ */

function ReplyForm({
  ticketId,
  disabled,
}: {
  disabled: boolean;
  ticketId: string;
}) {
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleReply() {
    setServerMessage(null);
    setFieldError(null);

    const trimmed = replyText.trim();
    if (trimmed.length < 2) {
      setFieldError("Reply must be at least 2 characters.");
      return;
    }

    startTransition(async () => {
      const result = await replyToOwnerSupportTicket({
        message: trimmed,
        ticketId,
      });

      if (result.ok) {
        setReplyText("");
        setIsSuccess(true);
        setServerMessage(result.message ?? "Your reply has been sent.");
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        setServerMessage(result.message);
      }
    });
  }

  const inputClass =
    "w-full rounded-lg border border-[#e1e5ed] bg-white px-3 py-3 text-[13px] font-semibold text-[#070b2d] outline-none transition focus:border-[#5631d8] focus:ring-2 focus:ring-[rgba(86,49,216,0.12)] min-h-[100px] resize-none";

  return (
    <div id="ticket-reply">
      <h3 className="owner-card-title font-semibold text-[#070b2d]">Reply</h3>

      {serverMessage ? (
        <div
          className={`mt-3 rounded-lg border px-4 py-3 text-xs font-semibold ${
            isSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-[#e11d48]"
          }`}
        >
          {serverMessage}
        </div>
      ) : null}

      <textarea
        aria-describedby={fieldError ? "reply-error" : undefined}
        aria-invalid={fieldError ? true : undefined}
        className={`${inputClass} mt-3`}
        disabled={disabled || isPending}
        onChange={(e) => {
          setReplyText(e.target.value);
          setFieldError(null);
          setServerMessage(null);
        }}
        placeholder="Type your reply..."
        value={replyText}
      />

      {fieldError ? (
        <p className="mt-1 text-xs font-semibold text-[#e11d48]" id="reply-error">
          {fieldError}
        </p>
      ) : null}

      <div className="mt-3 flex justify-end">
        <button
          className="owner-button-text inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#5824e6] px-5 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          disabled={disabled || isPending || replyText.trim().length < 2}
          onClick={handleReply}
          type="button"
        >
          {isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {isPending ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Action Buttons                                              */
/* ------------------------------------------------------------------ */

function StatusActions({
  ticketId,
  status,
}: {
  status: string;
  ticketId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isClosed = status === "closed";

  function handleStatusChange(targetStatus: "closed" | "open") {
    setServerMessage(null);
    startTransition(async () => {
      const result = await updateOwnerSupportTicketStatus({
        status: targetStatus,
        ticketId,
      });
      if (result.ok) {
        setIsSuccess(true);
        setServerMessage(result.message ?? "Ticket updated.");
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        setServerMessage(result.message);
      }
    });
  }

  return (
    <div>
      <h3 className="owner-card-title font-semibold text-[#070b2d]">
        Actions
      </h3>

      {serverMessage ? (
        <div
          className={`mt-3 rounded-lg border px-4 py-3 text-xs font-semibold ${
            isSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-[#e11d48]"
          }`}
        >
          {serverMessage}
        </div>
      ) : null}

      <div className="mt-3">
        {isClosed ? (
          <button
            className="owner-button-text inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#5631d8] bg-white px-5 text-[#5631d8] transition hover:bg-[#f7f8fb] disabled:cursor-not-allowed disabled:text-slate-400"
            disabled={isPending}
            onClick={() => handleStatusChange("open")}
            type="button"
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : null}
            {isPending ? "Reopening..." : "Reopen ticket"}
          </button>
        ) : (
          <button
            className="owner-button-text inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#e1e5ed] bg-white px-5 text-[#59637d] transition hover:bg-[#f7f8fb] hover:text-[#070b2d] disabled:cursor-not-allowed disabled:text-slate-400"
            disabled={isPending}
            onClick={() => handleStatusChange("closed")}
            type="button"
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : null}
            {isPending ? "Closing..." : "Close ticket"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ticket Info Sidebar                                                */
/* ------------------------------------------------------------------ */

function TicketInfoSidebar({
  ticket,
}: {
  ticket: OwnerSupportTicketDetail;
}) {
  return (
    <div className="rounded-xl border border-[#e1e5ed] bg-white p-5">
      <h3 className="owner-card-title font-semibold text-[#070b2d]">
        Ticket Information
      </h3>
      <dl className="owner-body mt-4 space-y-3">
        {(
          [
            ["Ticket Reference", ticket.ticketReference],
            ["Status", getStatusLabel(ticket.status)],
            ["Priority", getPriorityLabel(ticket.priority)],
            ["Category", getCategoryLabel(ticket.category)],
            ["Created", formatDate(ticket.createdAt)],
            ["Last Updated", formatDate(ticket.updatedAt)],
          ] as const
        ).map(([label, value]) => (
          <div className="flex justify-between gap-3" key={label}>
            <dt className="font-semibold text-[#59637d]">{label}</dt>
            <dd className="text-right font-bold text-[#070b2d]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function OwnerTicketDetailContent({
  ticket,
}: {
  ticket: OwnerSupportTicketDetail;
}) {
  const canCloseOrReopen =
    ticket.status !== "resolved" && ticket.status !== "escalated";

  return (
    <div className="space-y-6">
      {/* ── Ticket Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="owner-page-title text-[#070b2d]">{ticket.subject}</h1>
        <p className="owner-page-description mt-2 text-[#59637d]">
          Ticket #{ticket.ticketReference} — Created{" "}
          {formatDate(ticket.createdAt)}
        </p>
      </div>

      {/* ── Status Summary ────────────────────────────────────────── */}
      <section className="rounded-xl border border-[#e1e5ed] bg-white p-5">
        <StatusInfoRow ticket={ticket} />
      </section>

      {/* ── Two Column Layout: Messages + Sidebar ─────────────────── */}
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          {/* ── Message Thread ────────────────────────────────────── */}
          <section className="space-y-4 rounded-xl border border-[#e1e5ed] bg-white p-5">
            <h3 className="owner-card-title font-semibold text-[#070b2d]">
              Conversation
            </h3>
            {ticket.messages.length > 0 ? (
              <div className="space-y-4">
                {ticket.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            ) : (
              <p className="owner-body text-center text-[#8794b0]">
                No messages yet.
              </p>
            )}
          </section>

          {/* ── Reply Form ────────────────────────────────────────── */}
          <section className="rounded-xl border border-[#e1e5ed] bg-white p-5">
            <ReplyForm
              disabled={ticket.status === "closed" || ticket.status === "resolved"}
              ticketId={ticket.id}
            />
          </section>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="space-y-5">
          <TicketInfoSidebar ticket={ticket} />

          {canCloseOrReopen ? (
            <div className="rounded-xl border border-[#e1e5ed] bg-white p-5">
              <StatusActions
                status={ticket.status}
                ticketId={ticket.id}
              />
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
