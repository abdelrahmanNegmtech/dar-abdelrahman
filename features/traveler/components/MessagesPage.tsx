"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  Copy,
  FileText,
  Forward,
  Headphones,
  ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Phone,
  Reply as ReplyIcon,
  Send,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/features/system-states/hooks/useToast";
import { deleteConversationMessage, markConversationRead, sendConversationMessage } from "../actions";
import type { MessageStatus, TravelerConversation, TravelerMessage } from "../types";
import { Card, EmptyState, IconButton, PageHeader, PrimaryButton, SearchInput, SecondaryButton, cx } from "./shared";
import { useUnreadMessages } from "./TravelerLayout";
import { formatCurrency } from "../utils";

type FilterOption = "all" | "owners" | "support" | "unread";

// ---------- helpers ----------

function getMessageStatusIcon(status?: MessageStatus) {
  switch (status) {
    case "sending":
      return { icon: Clock, className: "text-dar-muted" };
    case "sent":
      return { icon: Check, className: "text-dar-muted" };
    case "delivered":
      return { icon: CheckCheck, className: "text-dar-muted" };
    case "read":
      return { icon: CheckCheck, className: "text-dar-primary" };
    case "failed":
      return { icon: Clock, className: "text-dar-error" };
    default:
      return null;
  }
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatConversationTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return formatMessageTime(iso);
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

// ---------- sub-components ----------

function MessageStatusBadge({ status }: { status?: MessageStatus }) {
  const statusInfo = getMessageStatusIcon(status);
  if (!statusInfo) return null;
  const StatusIcon = statusInfo.icon;

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
      <StatusIcon className="size-3" />
      <span className="sr-only">{status}</span>
    </span>
  );
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

function ForwardDialog({
  conversations,
  onCancel,
  onForward,
}: {
  conversations: TravelerConversation[];
  onCancel: () => void;
  onForward: (targetId: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = conversations.filter((c) =>
    c.participant.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onCancel} role="dialog">
      <div className="w-full max-w-md rounded-dar border border-dar-border bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-dar-navy">Forward message</h3>
          <IconButton label="Close" onClick={onCancel}>
            <X className="size-4" />
          </IconButton>
        </div>
        <div className="mt-4">
          <SearchInput onChange={setSearchTerm} placeholder="Search conversations..." value={searchTerm} />
        </div>
        <div className="mt-4 max-h-56 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-dar-muted">No conversations found.</p>
          ) : (
            filtered.map((c) => (
              <button
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-dar-primary-soft"
                key={c.id}
                onClick={() => onForward(c.id)}
                type="button"
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                  <Image alt={c.participant.name} className="object-cover" fill src={c.participant.avatarUrl} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-dar-navy">{c.participant.name}</p>
                  <p className="truncate text-xs font-semibold text-dar-muted">{c.property.title}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyPreview({
  message,
  onCancel,
}: {
  message: { senderName: string; body: string };
  onCancel: () => void;
}) {
  return (
    <div className="mb-2 flex items-start gap-2 rounded-xl border border-dar-primary/30 bg-dar-primary-soft p-3">
      <ReplyIcon className="mt-0.5 size-4 shrink-0 text-dar-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-dar-primary">{message.senderName}</p>
        <p className="mt-0.5 truncate text-xs font-semibold text-dar-muted">{message.body}</p>
      </div>
      <IconButton label="Cancel reply" onClick={onCancel}>
        <X className="size-3.5" />
      </IconButton>
    </div>
  );
}

function MessageActionsMenu({
  message,
  onClose,
  onCopy,
  onReply,
  onDelete,
  onForward,
}: {
  message: TravelerMessage;
  onClose: () => void;
  onCopy: () => void;
  onReply: () => void;
  onDelete: () => void;
  onForward: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) onClose();
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const actions: { icon: typeof Copy; label: string; onClick: () => void; danger?: boolean }[] = [
    { icon: Copy, label: "Copy text", onClick: onCopy },
    { icon: ReplyIcon, label: "Reply", onClick: onReply },
  ];

  if (message.isOwn && !message.isDeleted) {
    actions.push({ icon: Trash2, label: "Delete", onClick: onDelete, danger: true });
  }

  actions.push({ icon: Forward, label: "Forward", onClick: onForward });

  return (
    <div
      className="absolute z-50 w-48 overflow-hidden rounded-xl border border-dar-border bg-white p-1 shadow-xl"
      ref={menuRef}
      role="menu"
    >
      {actions.map((action) => {
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
      })}
    </div>
  );
}

function MessageBubble({
  message,
  onForward,
  onReply,
}: {
  message: TravelerMessage;
  onForward: (message: TravelerMessage) => void;
  onReply: (message: TravelerMessage) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localDeleted, setLocalDeleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  if (message.messageType === "system") {
    return (
      <div className="flex justify-center">
        <div className="max-w-[70%] rounded-xl bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-800">
          {message.body}
        </div>
      </div>
    );
  }

  const isDeleted = localDeleted || message.isDeleted;

  function handleCopy() {
    navigator.clipboard.writeText(message.body).then(
      () => {
        setCopied(true);
        showToast({ description: "Message text copied to clipboard.", title: "Copied", type: "success" });
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        showToast({ description: "Could not copy text.", title: "Copy failed", type: "error" });
      },
    );
    setMenuOpen(false);
  }

  function handleDelete() {
    setShowConfirm(true);
    setMenuOpen(false);
  }

  async function confirmDelete() {
    setLocalDeleted(true);
    setShowConfirm(false);
    await deleteConversationMessage({ messageId: message.id });
    showToast({ description: "Message deleted.", title: "Deleted", type: "success" });
  }

  function handleReply() {
    onReply(message);
    setMenuOpen(false);
  }

  function handleForward() {
    onForward(message);
    setMenuOpen(false);
  }

  return (
    <>
      <div className={cx("group relative flex gap-3", message.isOwn ? "justify-end" : "justify-start")}>
        {!message.isOwn ? (
          <span className="relative mt-1 size-9 shrink-0 overflow-hidden rounded-full bg-slate-100">
            <Image alt={message.senderName} className="object-cover" fill src={message.senderAvatarUrl} />
          </span>
        ) : null}

        <div className="relative max-w-[76%]">
          {/* Reply indicator */}
          {message.replyTo ? (
            <div
              className={cx(
                "mb-1 rounded-xl border p-2 text-xs",
                message.isOwn ? "border-white/25 bg-white/12 text-white/80" : "border-dar-border bg-white text-dar-muted",
              )}>
              <p className="font-black">{message.replyTo.senderName}</p>
              <p className="mt-0.5 truncate">{message.replyTo.body}</p>
            </div>
          ) : null}

          <div
            className={cx(
              "rounded-2xl px-4 py-3 text-sm font-semibold leading-6 transition",
              message.isOwn ? "bg-dar-primary text-white" : "bg-slate-50 text-dar-navy",
              isDeleted ? "italic opacity-70" : "",
              copied ? "ring-2 ring-dar-primary" : "",
            )}
          >
            {isDeleted ? (
              <p className="text-xs">Message deleted</p>
            ) : (
              <>
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                {message.attachment ? (
                  <div
                    className={cx(
                      "mt-3 overflow-hidden rounded-xl border",
                      message.isOwn ? "border-white/25 bg-white/12" : "border-dar-border bg-white",
                    )}
                  >
                    {message.attachment.type === "image" ? (
                      <div className="relative h-40">
                        <Image
                          alt={message.attachment.name}
                          className="object-cover"
                          fill
                          sizes="300px"
                          src={message.attachment.url}
                        />
                      </div>
                    ) : (
                      <a
                        className="flex items-center justify-between p-3 text-xs"
                        href={message.attachment.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-black">{message.attachment.name}</span>
                          <span className="mt-0.5 block opacity-80">{message.attachment.size}</span>
                        </span>
                        <FileText className="ml-3 size-5 shrink-0" />
                      </a>
                    )}
                  </div>
                ) : null}
              </>
            )}

            <div className="mt-2 flex items-center justify-end gap-2">
              <span className={cx("text-[11px]", message.isOwn ? "text-white/70" : "text-dar-muted")}>
                {formatMessageTime(message.createdAt)}
              </span>
              {message.isOwn && !isDeleted ? (
                <MessageStatusBadge status={message.status} />
              ) : null}
            </div>
          </div>

          {/* Three-dot menu trigger — only for non-deleted messages */}
          {!isDeleted ? (
            <button
              aria-haspopup="menu"
              aria-label={`Message actions`}
              className={cx(
                "absolute -right-2 -top-2 grid size-7 place-items-center rounded-full border border-dar-border bg-white text-dar-muted opacity-0 shadow-sm transition hover:text-dar-primary group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary",
                menuOpen ? "opacity-100" : "",
              )}
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          ) : null}

          {menuOpen ? (
            <MessageActionsMenu
              message={message}
              onClose={closeMenu}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onForward={handleForward}
              onReply={handleReply}
            />
          ) : null}
        </div>
      </div>

      {showConfirm ? (
        <ConfirmDialog
          message="This will delete this message. This action cannot be undone."
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete message?"
        />
      ) : null}
    </>
  );
}

// ---------- Main MessagesPage ----------

export function MessagesPage({
  conversations: initialConversations,
  selectedConversation: initialSelected,
}: {
  conversations: TravelerConversation[];
  selectedConversation: TravelerConversation | null;
}) {
  const initialActiveId = initialSelected?.id ?? initialConversations[0]?.id ?? "";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [conversations, setConversations] = useState(() =>
    initialConversations.map((conversation) =>
      conversation.id === initialActiveId ? { ...conversation, unreadCount: 0 } : conversation,
    ),
  );
  const [localMessages, setLocalMessages] = useState<Record<string, TravelerMessage[]>>({});
  const [activeId, setActiveId] = useState(initialActiveId);
  const [composer, setComposer] = useState("");
  const [isPending, startTransition] = useTransition();
  const [replyTo, setReplyTo] = useState<TravelerMessage | null>(null);
  const [showForward, setShowForward] = useState<TravelerMessage | null>(null);
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { setUnreadMessages } = useUnreadMessages();
  const { showToast } = useToast();

  const activeConversation = conversations.find((c) => c.id === activeId);

  const visibleConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const queryMatch =
        !normalizedQuery ||
        conversation.participant.name.toLowerCase().includes(normalizedQuery) ||
        conversation.property.title.toLowerCase().includes(normalizedQuery) ||
        conversation.bookingId.toLowerCase().includes(normalizedQuery) ||
        conversation.messages.some((m) => m.body?.toLowerCase().includes(normalizedQuery));

      const filterMatch =
        filter === "all" ||
        (filter === "owners" && conversation.participant.role === "owner") ||
        (filter === "support" && conversation.participant.role === "support") ||
        (filter === "unread" && conversation.unreadCount > 0);

      return queryMatch && filterMatch;
    });
  }, [conversations, filter, query]);

  // Keep sidebar badge in sync whenever unread counts change
  useEffect(() => {
    const total = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
    setUnreadMessages(total);
  }, [conversations, setUnreadMessages]);

  // Sort visible conversations by most recent message
  const sortedConversations = useMemo(() => {
    return [...visibleConversations].sort((a, b) => {
      const aLast = a.messages.at(-1)?.createdAt ?? a.updatedAt;
      const bLast = b.messages.at(-1)?.createdAt ?? b.updatedAt;
      return new Date(bLast).getTime() - new Date(aLast).getTime();
    });
  }, [visibleConversations]);

  function selectConversation(conversationId: string) {
    setActiveId(conversationId);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    );
    startTransition(async () => {
      await markConversationRead({ conversationId });
    });
  }

  // Auto-scroll to bottom only if user is near the bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 150;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages, activeId]);

  // NOTE: Partner typing indicator ('Participant is typing...') requires realtime
  // backend (Supabase channel presence) which is not connected in dev preview.

  // Clean up typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  function handleComposerChange(value: string) {
    setComposer(value);

    // Local typing indicator simulation
    if (value.trim().length > 0 && !isTypingLocal) {
      setIsTypingLocal(true);
    }
    if (value.trim().length === 0 && isTypingLocal) {
      setIsTypingLocal(false);
    }

    // Debounced stop typing
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTypingLocal(false);
    }, 1500);
  }

  function handleForwardMessage(message: TravelerMessage, targetId: string) {
    const target = conversations.find((c) => c.id === targetId);
    if (!target) {
      showToast({ description: "Could not find target conversation.", title: "Forward failed", type: "error" });
      return;
    }

    const forwarded: TravelerMessage = {
      body: `[Forwarded from ${message.senderName}]: ${message.body}`,
      createdAt: new Date().toISOString(),
      id: `forwarded-${Date.now()}`,
      isDeleted: false,
      isOwn: true,
      messageType: "text",
      senderAvatarUrl: "/assets/images/backgrounds/Nighttime_photo.jpeg",
      senderId: "me",
      senderName: "You",
      status: "sending",
    };

    setLocalMessages((current) => ({
      ...current,
      [targetId]: [...(current[targetId] ?? []), forwarded],
    }));

    // Simulate send
    setTimeout(() => {
      setLocalMessages((current) => ({
        ...current,
        [targetId]: (current[targetId] ?? []).map((m) =>
          m.id === forwarded.id ? { ...m, status: "sent" as MessageStatus } : m,
        ),
      }));
    }, 800);

    setShowForward(null);
    showToast({
      description: `Forwarded to ${target.participant.name}.`,
      title: "Message forwarded",
      type: "success",
    });
  }

  function submitMessage(messageBody = composer) {
    if (!activeConversation || !messageBody.trim() || isPending) return;

    const optimisticMessage: TravelerMessage = {
      body: messageBody.trim(),
      createdAt: new Date().toISOString(),
      id: `local-${Date.now()}`,
      isDeleted: false,
      isOwn: true,
      messageType: "text",
      replyTo: replyTo
        ? { body: replyTo.body.slice(0, 80), id: replyTo.id, senderName: replyTo.senderName }
        : null,
      senderAvatarUrl: "/assets/images/backgrounds/Nighttime_photo.jpeg",
      senderId: "me",
      senderName: "You",
      status: "sending",
    };

    setLocalMessages((current) => ({
      ...current,
      [activeConversation.id]: [...(current[activeConversation.id] ?? []), optimisticMessage],
    }));
    setComposer("");
    setReplyTo(null);
    setIsTypingLocal(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    startTransition(async () => {
      const result = await sendConversationMessage({
        conversationId: activeConversation.id,
        message: messageBody.trim(),
      });

      // Update optimistic message with real status
      setLocalMessages((current) => ({
        ...current,
        [activeConversation!.id]: (current[activeConversation!.id] ?? []).map((m) =>
          m.id === optimisticMessage.id
            ? {
                ...m,
                status: (result.ok ? "sent" : "failed") as MessageStatus,
              }
            : m,
        ),
      }));

      if (!result.ok) {
        showToast({
          description: result.message,
          title: "Message failed",
          type: "error",
        });
      }
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  function handleRetry(message: TravelerMessage) {
    setLocalMessages((current) => ({
      ...current,
      [activeConversation!.id]: (current[activeConversation!.id] ?? []).filter(
        (m) => m.id !== message.id,
      ),
    }));
    setComposer(message.body);
  }

  function handleReply(message: TravelerMessage) {
    setReplyTo(message);
  }

  const messages = activeConversation
    ? [...activeConversation.messages, ...(localMessages[activeConversation.id] ?? [])]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader description="Coordinate booking details, files, and support safely inside DAR." title="Messages" />

      <div className="grid min-h-[calc(100dvh-180px)] gap-5 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
        {/* ---------- Conversation list ---------- */}
        <Card className="overflow-hidden">
          <div className="border-b border-dar-border p-4">
            <SearchInput onChange={setQuery} placeholder="Search conversations" value={query} />
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {(["all", "owners", "support", "unread"] as const).map((item) => (
                <button
                  className={cx(
                    "shrink-0 rounded-lg px-3 py-2 text-xs font-black capitalize transition",
                    filter === item ? "bg-dar-primary text-white" : "bg-slate-50 text-dar-muted hover:bg-dar-primary-soft",
                  )}
                  key={item}
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item}
                  {item === "unread" && conversations.some((c) => c.unreadCount > 0)
                    ? ` (${conversations.reduce((t, c) => t + c.unreadCount, 0)})`
                    : null}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[640px] overflow-y-auto p-3">
            {sortedConversations.length === 0 ? (
              <div className="py-12 text-center">
                <MessageCircle className="mx-auto size-8 text-dar-muted" />
                <p className="mt-3 text-sm font-semibold text-dar-muted">
                  {query || filter !== "all" ? "No conversations match this filter." : "No conversations yet."}
                </p>
              </div>
            ) : (
              sortedConversations.map((conversation) => (
                <button
                  className={cx(
                    "mb-2 grid w-full grid-cols-[48px_1fr_auto] gap-3 rounded-xl border p-3 text-left transition",
                    activeId === conversation.id
                      ? "border-dar-primary bg-dar-primary-soft"
                      : "border-transparent hover:bg-slate-50",
                  )}
                  key={conversation.id}
                  onClick={() => {
                    selectConversation(conversation.id);
                    setReplyTo(null);
                  }}
                  type="button"
                >
                  <span className="relative size-12 overflow-hidden rounded-full bg-slate-100">
                    <Image
                      alt={conversation.participant.name}
                      className="object-cover"
                      fill
                      sizes="48px"
                      src={conversation.participant.avatarUrl}
                    />
                    <span
                      className={cx(
                        "absolute bottom-0 right-0 size-3 rounded-full border-2 border-white",
                        conversation.participant.isOnline ? "bg-emerald-500" : "bg-slate-300",
                      )}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="block truncate text-sm font-black text-dar-navy">
                        {conversation.participant.name}
                      </span>
                      {conversation.participant.verified ? (
                        <span className="shrink-0 rounded-full bg-dar-primary-soft px-1.5 py-0.5 text-[10px] font-black text-dar-primary">
                          Verified
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-dar-muted">
                      {conversation.property.title}
                    </span>
                    {conversation.messages.length > 0 ? (
                      <span className="mt-1 block truncate text-xs font-semibold text-dar-muted">
                        {conversation.messages.at(-1)?.isDeleted
                          ? "Message deleted"
                          : conversation.messages.at(-1)?.body}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    {conversation.messages.length > 0 ? (
                      <span className="text-[11px] font-semibold text-dar-muted">
                        {formatConversationTime(conversation.messages.at(-1)?.createdAt ?? conversation.updatedAt)}
                      </span>
                    ) : null}
                    {conversation.unreadCount > 0 ? (
                      <span className="grid min-w-5 place-items-center rounded-full bg-dar-primary px-1.5 py-0.5 text-[11px] font-black text-white">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* ---------- Chat area ---------- */}
        {activeConversation ? (
          <Card className="flex min-h-[640px] flex-col overflow-hidden">
            {/* Chat header */}
            <header className="flex flex-col gap-3 border-b border-dar-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="relative size-12 overflow-hidden rounded-full bg-slate-100">
                  <Image
                    alt={activeConversation.participant.name}
                    className="object-cover"
                    fill
                    sizes="48px"
                    src={activeConversation.participant.avatarUrl}
                  />
                  <span
                    className={cx(
                      "absolute bottom-0 right-0 size-3 rounded-full border-2 border-white",
                      activeConversation.participant.isOnline ? "bg-emerald-500" : "bg-slate-300",
                    )}
                  />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-dar-navy">{activeConversation.participant.name}</h2>
                    {activeConversation.participant.verified ? (
                      <span className="rounded-full bg-dar-primary-soft px-2 py-0.5 text-[10px] font-black text-dar-primary">
                        Verified
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs font-semibold text-dar-muted">
                    {activeConversation.participant.isOnline
                      ? "Online"
                      : "Usually responds in 20 minutes"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/traveler/bookings/${activeConversation.bookingId}`}>
                  <SecondaryButton className="min-h-10 text-xs">
                    <CalendarDays className="size-4" />
                    View booking
                  </SecondaryButton>
                </Link>
                <IconButton
                  label="Call feature"
                  className="relative group"
                  disabled
                >
                  <Phone className="size-4" />
                  <span className="absolute -top-1 left-1/2 z-50 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-dar-navy px-3 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block">
                    Calling is not available yet
                  </span>
                </IconButton>
              </div>
            </header>

            {/* Safety banner */}
            <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              Keep payments and booking changes inside DAR for your protection.
            </div>

            {/* Messages area */}
            <div
              className="flex-1 space-y-4 overflow-y-auto p-4 scroll-smooth"
              ref={messagesContainerRef}
            >
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="mx-auto size-8 text-dar-muted" />
                    <p className="mt-3 text-sm font-semibold text-dar-muted">
                      No messages yet. Send a message to start the conversation.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onForward={(m) => setShowForward(m)}
                    onReply={handleReply}
                  />
                ))
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Failed messages with retry */}
            {activeConversation && localMessages[activeConversation.id]
              ?.filter((m) => m.status === "failed")
              .map((failedMsg) => (
                <div className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3" key={failedMsg.id}>
                  <p className="flex-1 text-xs font-semibold text-red-700">
                    Message failed to send.
                  </p>
                  <SecondaryButton
                    className="min-h-8 border-red-200 text-xs text-red-600 hover:bg-red-100"
                    onClick={() => handleRetry(failedMsg)}
                  >
                    Retry
                  </SecondaryButton>
                </div>
              ))}

            {/* Reply preview */}
            {replyTo ? (
              <div className="mx-4">
                <ReplyPreview
                  message={{ body: replyTo.body, senderName: replyTo.senderName }}
                  onCancel={() => setReplyTo(null)}
                />
              </div>
            ) : null}

            {/* Composer */}
            <footer className="border-t border-dar-border p-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitMessage();
                }}
              >
                <div className="flex items-end gap-2">
                  <div className="flex flex-col gap-2">
                    <IconButton
                      label="Attach file"
                      disabled
                      className="relative group"
                    >
                      <Paperclip className="size-4" />
                      <span className="absolute -top-1 left-1/2 z-50 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-dar-navy px-3 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block">
                        File upload not available in preview
                      </span>
                    </IconButton>
                    <IconButton
                      label="Attach image"
                      disabled
                      className="relative group"
                    >
                      <ImageIcon className="size-4" />
                      <span className="absolute -top-1 left-1/2 z-50 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-dar-navy px-3 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block">
                        Image upload not available in preview
                      </span>
                    </IconButton>
                  </div>
                  <div className="flex-1">
                    <label className="sr-only" htmlFor="message-composer">Write a message</label>
                    <textarea
                      className="min-h-[44px] w-full resize-none rounded-xl border border-dar-border bg-white px-4 py-3 text-sm font-semibold text-dar-navy caret-dar-primary outline-none transition placeholder:text-dar-muted focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)]"
                      id="message-composer"
                      onChange={(event) => handleComposerChange(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Write a message..."
                      rows={1}
                      value={composer}
                    />
                  </div>
                  <PrimaryButton
                    aria-label="Send"
                    disabled={!composer.trim()}
                    loading={isPending}
                    loadingLabel="Sending"
                    type="submit"
                  >
                    <Send className="size-4" />
                  </PrimaryButton>
                </div>
              </form>
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {["Arrival time", "Ask for Wi-Fi", "Request directions", "Need support"].map((quick) => (
                  <button
                    className="shrink-0 rounded-xl border border-dar-primary px-3 py-2 text-xs font-black text-dar-primary transition hover:bg-dar-primary-soft"
                    key={quick}
                    onClick={() => submitMessage(quick)}
                    type="button"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </footer>
          </Card>
        ) : (
          <EmptyState action={
            conversations.length > 0 ? (
              <SecondaryButton onClick={() => selectConversation(conversations[0].id)}>
                Open first conversation
              </SecondaryButton>
            ) : null
          } description="Choose a conversation to start messaging." title="No conversation selected" />
        )}

        {/* ---------- Booking sidebar ---------- */}
        {activeConversation ? (
          <aside className="space-y-5">
            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Booking details</h2>
              <div className="mt-4 grid grid-cols-[120px_1fr] gap-4">
                <div className="relative h-24 overflow-hidden rounded-xl">
                  <Image
                    alt={activeConversation.property.title}
                    className={cx("object-cover", activeConversation.property.imagePosition)}
                    fill
                    sizes="120px"
                    src={activeConversation.property.imageUrl}
                  />
                </div>
                <div>
                  <h3 className="font-black text-dar-navy">{activeConversation.property.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-dar-muted">
                    {activeConversation.property.area}, {activeConversation.property.city}
                  </p>
                  <p className="mt-2 text-sm font-black text-dar-navy">
                    {formatCurrency(activeConversation.property.pricePerNight)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm font-semibold text-dar-muted">
                <span>
                  {activeConversation.property.type} &middot; {activeConversation.property.bedrooms} bed &middot;{" "}
                  {activeConversation.property.maxGuests} guests
                </span>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Shared files</h2>
              <div className="mt-4 space-y-3">
                {messages.filter((m) => m.attachment && !m.isDeleted).length === 0 ? (
                  <p className="py-4 text-center text-sm font-semibold text-dar-muted">
                    No files shared yet.
                  </p>
                ) : (
                  messages
                    .filter((m) => m.attachment && !m.isDeleted)
                    .map((message) => (
                      <a
                        className="flex items-center justify-between rounded-xl border border-dar-border p-3 transition hover:border-dar-primary"
                        href={message.attachment!.url}
                        key={message.id}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black text-dar-navy">
                            {message.attachment!.name}
                          </span>
                          <span className="text-xs font-semibold text-dar-muted">
                            {message.attachment!.size}
                          </span>
                        </span>
                        <FileText className="ml-3 size-4 shrink-0 text-dar-primary" />
                      </a>
                    ))
                )}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Safety and support</h2>
              <div className="mt-4 grid gap-3">
                <Link href="/traveler/support">
                  <SecondaryButton className="w-full">
                    <Headphones className="size-4" />
                    Contact DAR support
                  </SecondaryButton>
                </Link>
                <Link href="/traveler/support?tab=open">
                  <SecondaryButton className="w-full border-red-200 text-red-600 hover:bg-red-50">
                    <ShieldAlert className="size-4" />
                    Report issue
                  </SecondaryButton>
                </Link>
              </div>
            </Card>
          </aside>
        ) : null}
      </div>

      {showForward ? (
        <ForwardDialog
          conversations={conversations.filter((c) => c.id !== activeId)}
          onCancel={() => setShowForward(null)}
          onForward={(targetId) => handleForwardMessage(showForward, targetId)}
        />
      ) : null}
    </div>
  );
}
