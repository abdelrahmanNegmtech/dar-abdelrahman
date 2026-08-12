"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Download, FileText, ImageIcon, MoreHorizontal, Paperclip, Send } from "lucide-react";
import { useToast } from "@/features/system-states/hooks/useToast";
import { replyToSupportTicket, updateSupportTicketStatus } from "../actions";
import type { SupportTicket, SupportTicketMessage } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Card, EmptyState, IconButton, PageHeader, PrimaryButton, SecondaryButton, StatusBadge, TextAreaField, TimelineItem, cx } from "./shared";
import { formatCurrency } from "../utils";

function TicketMessageCard({ message }: { message: SupportTicketMessage }) {
  return (
    <div className={cx("flex gap-3", message.senderRole === "traveler" ? "" : "rounded-xl bg-dar-primary-soft p-4")}>
      <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-100">
        <Image alt={message.senderName} className="object-cover" fill src={message.senderAvatarUrl} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-dar-navy">{message.senderName}</h3>
          <StatusBadge label={message.senderRole === "support" ? "Support Agent" : "You"} />
          <span className="text-xs font-semibold text-dar-muted">
            {new Date(message.createdAt).toLocaleString("en-US", { day: "numeric", hour: "2-digit", minute: "2-digit", month: "short" })}
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold leading-6 text-dar-navy">{message.message}</p>
        {message.attachments.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {message.attachments.map((attachment) => (
              <a className="flex items-center justify-between rounded-xl border border-dar-border bg-white p-3" href={attachment.fileUrl} key={attachment.id}>
                <span className="inline-flex items-center gap-3">
                  <FileText className="size-5 text-dar-primary" />
                  <span>
                    <span className="block text-sm font-black text-dar-navy">{attachment.fileName}</span>
                    <span className="text-xs font-semibold text-dar-muted">{attachment.fileSize}</span>
                  </span>
                </span>
                <Download className="size-4 text-dar-muted" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SupportTicketDetailsPage({ ticket }: { ticket: SupportTicket | null }) {
  const [reply, setReply] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  if (!ticket) {
    return (
      <EmptyState
        action={
          <Link href="/traveler/support">
            <PrimaryButton>Back to tickets</PrimaryButton>
          </Link>
        }
        description="This ticket either does not exist or is not available to your account."
        title="Ticket not found"
      />
    );
  }

  const ticketId = ticket.id;

  function sendReply() {
    if (files.length) {
      showToast({
        description: "Support attachment uploads are not connected in Phase 16 yet.",
        title: "Attachments are deferred",
        type: "info",
      });
      return;
    }

    startTransition(async () => {
      const result = await replyToSupportTicket({ message: reply, ticketId });
      showToast({
        description: result.message,
        title: result.ok ? "Reply sent" : "Could not send reply",
        type: result.ok ? "success" : "error",
      });
      if (result.ok) {
        setReply("");
        setFiles([]);
      }
    });
  }

  function updateStatus(status: "closed" | "open") {
    startTransition(async () => {
      const result = await updateSupportTicketStatus(ticketId, status);
      showToast({
        description: result.message,
        title: result.ok ? "Ticket updated" : "Could not update ticket",
        type: result.ok ? "success" : "error",
      });
    });
  }

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-black text-dar-primary" href="/traveler/support">
        <ArrowLeft className="size-4" />
        Back to tickets
      </Link>

      <PageHeader
        action={
          <div className="flex flex-wrap gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton label="More ticket actions">
                  <MoreHorizontal className="size-5" />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(ticket.reference).then(
                  () => showToast({ description: "Ticket ID copied to clipboard.", title: "Copied", type: "success" }),
                  () => showToast({ description: "Could not copy ticket ID.", title: "Copy failed", type: "error" }),
                )}>
                  Copy ticket ID
                </DropdownMenuItem>
                {ticket.booking ? (
                  <DropdownMenuItem onClick={() => window.open(`/traveler/bookings/${ticket.booking!.id}`, "_self")}>
                    View related booking
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                {ticket.status === "closed" ? (
                  <DropdownMenuItem onClick={() => updateStatus("open")}>
                    Reopen ticket
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => updateStatus("closed")}>
                    Close ticket
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <PrimaryButton onClick={() => document.getElementById("ticket-reply")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Reply</PrimaryButton>
          </div>
        }
        description={`Ticket ID: #${ticket.reference} - Created on ${new Date(ticket.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`}
        title={ticket.subject}
      />

      <Card className="grid gap-4 p-5 md:grid-cols-5">
        <div>
          <p className="text-xs font-bold text-dar-muted">Status</p>
          <div className="mt-2"><StatusBadge label={ticket.status} tone="ticket" /></div>
        </div>
        <div>
          <p className="text-xs font-bold text-dar-muted">Priority</p>
          <div className="mt-2"><StatusBadge label={ticket.priority} tone="priority" /></div>
        </div>
        <div>
          <p className="text-xs font-bold text-dar-muted">Category</p>
          <p className="mt-2 text-sm font-black text-dar-navy">{ticket.category}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-dar-muted">Assigned to</p>
          <p className="mt-2 text-sm font-black text-dar-navy">{ticket.assignedAgent?.name ?? "DAR Support"}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-dar-muted">Expected reply</p>
          <p className="mt-2 text-sm font-black text-dar-navy">{new Date(ticket.expectedReplyAt).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", weekday: "short" })}</p>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px_260px]">
        <div className="space-y-5">
          <Card className="space-y-6 p-5">
            {ticket.messages.map((message) => (
              <TicketMessageCard key={message.id} message={message} />
            ))}
          </Card>

          <Card className="p-5" id="ticket-reply">
            <h2 className="text-lg font-black text-dar-navy">Reply</h2>
            <div className="mt-4">
              <TextAreaField
                onChange={(event) => setReply(event.target.value)}
                placeholder="Type your message..."
                value={reply}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <label className="grid size-10 cursor-pointer place-items-center rounded-xl border border-dar-border text-dar-muted">
                  <Paperclip className="size-4" />
                  <input className="sr-only" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} type="file" />
                </label>
                <IconButton
                  label="Attach image"
                  onClick={() => showToast({ description: "Image upload is not connected in this local preview.", title: "Attachment preview", type: "info" })}
                >
                  <ImageIcon className="size-4" />
                </IconButton>
                {files.length ? <span className="self-center text-xs font-semibold text-dar-muted">{files.length} file(s)</span> : null}
              </div>
              <PrimaryButton disabled={reply.trim().length < 2} loading={isPending} loadingLabel="Sending reply" onClick={sendReply}>
                <Send className="size-4" />
                Send Reply
              </PrimaryButton>
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Ticket Information</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Ticket ID", ticket.reference],
                ["Status", ticket.status],
                ["Priority", ticket.priority],
                ["Category", ticket.category],
                ["Created", new Date(ticket.createdAt).toLocaleString()],
                ["Last Updated", new Date(ticket.updatedAt).toLocaleString()],
              ].map(([label, value]) => (
                <div className="flex justify-between gap-3" key={label}>
                  <dt className="font-bold text-dar-muted">{label}</dt>
                  <dd className="font-black text-dar-navy">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {ticket.assignedAgent ? (
            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Assigned Agent</h2>
              <div className="mt-4 flex items-center gap-3">
                <span className="relative size-14 overflow-hidden rounded-full bg-slate-100">
                  <Image alt={ticket.assignedAgent.name} className="object-cover" fill src={ticket.assignedAgent.avatarUrl} />
                </span>
                <div>
                  <p className="font-black text-dar-navy">{ticket.assignedAgent.name}</p>
                  <p className="text-sm font-semibold text-dar-muted">{ticket.assignedAgent.title}</p>
                </div>
              </div>
            </Card>
          ) : null}

          {ticket.booking ? (
            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Ticket Details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="font-bold text-dar-muted">Related Booking</dt>
                  <dd className="font-black text-dar-primary">{ticket.booking.reference}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-bold text-dar-muted">Property</dt>
                  <dd className="text-right font-black text-dar-navy">{ticket.booking.property.title}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-bold text-dar-muted">Amount</dt>
                  <dd className="font-black text-dar-navy">{formatCurrency(ticket.booking.totalAmount, ticket.booking.currency)}</dd>
                </div>
              </dl>
            </Card>
          ) : null}

          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Actions</h2>
            <div className="mt-4 grid gap-3">
              {ticket.status === "closed" ? (
                <SecondaryButton disabled={isPending} onClick={() => updateStatus("open")}>Reopen ticket</SecondaryButton>
              ) : (
                <SecondaryButton disabled={isPending} onClick={() => updateStatus("closed")}>Close ticket</SecondaryButton>
              )}
            </div>
          </Card>
        </aside>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Ticket Status</h2>
            <div className="mt-6 space-y-6">
              <TimelineItem active label="Created" meta={new Date(ticket.createdAt).toLocaleString("en-US", { day: "numeric", hour: "2-digit", minute: "2-digit", month: "short" })} />
              <TimelineItem active label="In Progress" meta={new Date(ticket.updatedAt).toLocaleString("en-US", { day: "numeric", hour: "2-digit", minute: "2-digit", month: "short" })} />
              <TimelineItem active={ticket.status === "resolved" || ticket.status === "closed"} label="Resolved" meta={ticket.status === "resolved" ? "Complete" : "Pending"} />
              <TimelineItem active={ticket.status === "closed"} label="Closed" meta={ticket.status === "closed" ? "Complete" : "Pending"} />
            </div>
          </Card>

          <Card className="p-5 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-dar-primary-soft text-dar-primary">
              <FileText className="size-8" />
            </span>
            <h2 className="mt-4 text-lg font-black text-dar-navy">We are here to help</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-dar-muted">Our team is working to resolve your issue as quickly as possible.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
