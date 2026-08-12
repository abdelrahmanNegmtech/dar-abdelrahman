"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ComponentType, HTMLAttributes, MouseEvent as ReactMouseEvent, ReactNode, SVGProps } from "react";
import {
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Search,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import type {
  BookingStatus,
  PaymentStatus,
  SupportTicketPriority,
  SupportTicketStatus,
  TravelerBooking,
  TravelerProperty,
} from "../types";
import { formatCurrency, formatDateRange, getStatusLabel } from "../utils";
import { useToast } from "@/features/system-states/hooks/useToast";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <section
      className={cx(
        "rounded-dar border border-dar-border bg-dar-card shadow-dar-card",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function IconButton({
  children,
  className = "",
  label,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className={cx(
        "grid size-10 place-items-center rounded-xl border border-dar-border bg-white text-dar-navy transition hover:border-dar-primary hover:text-dar-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500",
        className,
      )}
      title={label}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

type TravelerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
};

export function PrimaryButton({
  children,
  className = "",
  disabled,
  loading = false,
  loadingLabel = "Loading",
  type = "button",
  ...props
}: TravelerButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(93,47,229,0.25)] transition [background-image:var(--dar-gradient)] hover:brightness-95 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none disabled:[background-image:none]",
        className,
      )}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
      {loading ? loadingLabel : children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  disabled,
  loading = false,
  loadingLabel = "Loading",
  type = "button",
  ...props
}: TravelerButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dar-primary bg-white px-5 text-sm font-bold text-dar-primary transition hover:bg-dar-primary-soft active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500",
        className,
      )}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
      {loading ? loadingLabel : children}
    </button>
  );
}

export function DangerButton({
  children,
  className = "",
  disabled,
  loading = false,
  loadingLabel = "Loading",
  type = "button",
  ...props
}: TravelerButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dar-error bg-white px-5 text-sm font-bold text-dar-error transition hover:bg-red-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500",
        className,
      )}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
      {loading ? loadingLabel : children}
    </button>
  );
}

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return <label className="text-xs font-bold text-dar-muted" htmlFor={htmlFor}>{children}</label>;
}

export function TextField({
  className = "",
  error,
  icon,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  icon?: ReactNode;
  label?: string;
}) {
  const generatedId = useId();
  const fieldId = props.id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="space-y-2">
      {label ? <FieldLabel htmlFor={fieldId}>{label}</FieldLabel> : null}
      <div className="flex h-11 items-center gap-3 rounded-xl border border-dar-border bg-white px-3 text-dar-muted transition focus-within:border-dar-primary focus-within:ring-4 focus-within:ring-[rgba(94,47,229,0.12)]">
        {icon}
        <input
          aria-describedby={errorId}
          aria-invalid={error ? true : undefined}
          className={cx(
            "min-w-0 flex-1 bg-transparent text-sm font-semibold text-dar-navy caret-dar-primary outline-none [-webkit-text-fill-color:var(--dar-navy)] placeholder:text-dar-muted disabled:text-slate-500",
            className,
          )}
          id={fieldId}
          {...props}
        />
      </div>
      {error ? <p className="text-xs font-semibold text-dar-error" id={errorId}>{error}</p> : null}
    </div>
  );
}

export function TextAreaField({
  className = "",
  error,
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  label?: string;
}) {
  const generatedId = useId();
  const fieldId = props.id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="space-y-2">
      {label ? <FieldLabel htmlFor={fieldId}>{label}</FieldLabel> : null}
      <textarea
        aria-describedby={errorId}
        aria-invalid={error ? true : undefined}
        className={cx(
          "min-h-28 w-full resize-none rounded-xl border border-dar-border bg-white px-3 py-3 text-sm font-semibold text-dar-navy caret-dar-primary outline-none transition [-webkit-text-fill-color:var(--dar-navy)] placeholder:text-dar-muted focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)] disabled:bg-slate-50 disabled:text-slate-500",
          className,
        )}
        id={fieldId}
        {...props}
      />
      {error ? <p className="text-xs font-semibold text-dar-error" id={errorId}>{error}</p> : null}
    </div>
  );
}

export function SelectField({
  children,
  label,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
}) {
  const generatedId = useId();
  const fieldId = props.id ?? generatedId;

  return (
    <div className="space-y-2">
      {label ? <FieldLabel htmlFor={fieldId}>{label}</FieldLabel> : null}
      <select
        className="h-11 w-full rounded-xl border border-dar-border bg-white px-3 text-sm font-bold text-dar-navy caret-dar-primary outline-none transition focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)] disabled:bg-slate-50 disabled:text-slate-500"
        id={fieldId}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function SearchInput({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <TextField
      aria-label={placeholder}
      icon={<Search className="size-4" />}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  );
}

const bookingStatusStyles: Record<BookingStatus, string> = {
  cancelled: "bg-red-50 text-dar-error",
  completed: "bg-slate-100 text-slate-700",
  confirmed: "bg-emerald-50 text-dar-success",
  pending: "bg-amber-50 text-dar-warning",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  failed: "bg-red-50 text-dar-error",
  paid: "bg-emerald-50 text-dar-success",
  pending: "bg-amber-50 text-dar-warning",
  refunded: "bg-sky-50 text-dar-info",
};

const ticketStatusStyles: Record<SupportTicketStatus, string> = {
  awaiting_dar: "bg-amber-50 text-dar-warning",
  awaiting_you: "bg-sky-50 text-dar-info",
  closed: "bg-slate-100 text-slate-600",
  escalated: "bg-red-50 text-dar-error",
  in_progress: "bg-amber-50 text-dar-warning",
  open: "bg-emerald-50 text-dar-success",
  resolved: "bg-emerald-50 text-dar-success",
};

const ticketPriorityStyles: Record<SupportTicketPriority, string> = {
  high: "bg-red-50 text-dar-error",
  low: "bg-emerald-50 text-dar-success",
  medium: "bg-amber-50 text-dar-warning",
  urgent: "bg-red-50 text-dar-error",
};

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "booking" | "neutral" | "payment" | "priority" | "ticket";
}) {
  const lowerLabel = label.toLowerCase().replaceAll(" ", "_");
  let className = "bg-slate-100 text-slate-700";

  if (tone === "booking" && lowerLabel in bookingStatusStyles) {
    className = bookingStatusStyles[lowerLabel as BookingStatus];
  }

  if (tone === "payment" && lowerLabel in paymentStatusStyles) {
    className = paymentStatusStyles[lowerLabel as PaymentStatus];
  }

  if (tone === "ticket" && lowerLabel in ticketStatusStyles) {
    className = ticketStatusStyles[lowerLabel as SupportTicketStatus];
  }

  if (tone === "priority" && lowerLabel in ticketPriorityStyles) {
    className = ticketPriorityStyles[lowerLabel as SupportTicketPriority];
  }

  return (
    <span className={cx("inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-black", className)}>
      {getStatusLabel(label)}
    </span>
  );
}

export function StatCard({
  href,
  icon: Icon,
  label,
  tone = "purple",
  value,
}: {
  href?: string;
  icon: IconComponent;
  label: string;
  tone?: "purple" | "green" | "amber" | "blue" | "red";
  value: string;
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-500",
    blue: "bg-sky-50 text-sky-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-dar-primary-soft text-dar-primary",
    red: "bg-red-50 text-red-600",
  };

  const cardBody = (
    <div className="flex items-center gap-4">
      <span className={cx("grid size-12 shrink-0 place-items-center rounded-full", tones[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-dar-muted">{label}</p>
        <p className="mt-1 text-2xl font-black text-dar-navy">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        aria-label={`View ${label.toLowerCase()}`}
        className="block rounded-dar border border-dar-border bg-dar-card p-4 shadow-dar-card transition hover:-translate-y-0.5 hover:shadow-dar-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary focus-visible:ring-offset-2"
        href={href}
      >
        {cardBody}
      </Link>
    );
  }

  return (
    <section
      className={cx(
        "rounded-dar border border-dar-border bg-dar-card p-4 shadow-dar-card",
      )}
    >
      {cardBody}
    </section>
  );
}

export function PropertyCard({
  action,
  onSave,
  property,
  view = "grid",
}: {
  action?: ReactNode;
  onSave?: (propertyId: string) => void;
  property: TravelerProperty;
  view?: "grid" | "list";
}) {
  return (
    <article
      className={cx(
        "overflow-hidden rounded-dar border border-dar-border bg-white shadow-dar-card transition hover:-translate-y-0.5 hover:shadow-dar-hover",
        view === "list" ? "grid grid-cols-[118px_1fr] sm:grid-cols-[160px_1fr]" : "",
      )}
    >
      <div className={cx("relative overflow-hidden", view === "list" ? "min-h-full" : "h-44")}>
        <Image
          alt={property.title}
          className={cx("object-cover", property.imagePosition)}
          fill
          sizes={view === "list" ? "180px" : "(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"}
          src={property.imageUrl}
        />
        {property.isFeatured ? (
          <span className="absolute left-3 top-3 rounded-lg px-3 py-1 text-xs font-black text-white shadow-lg [background-image:var(--dar-gradient)]">
            Featured
          </span>
        ) : null}
        <button
          aria-label={property.isSaved ? `Unsave ${property.title}` : `Save ${property.title}`}
          aria-pressed={property.isSaved}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white text-dar-primary shadow-lg transition hover:scale-105"
          onClick={() => onSave?.(property.id)}
          type="button"
        >
          <Heart className={cx("size-5", property.isSaved ? "fill-dar-primary" : "")} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-black text-dar-navy">{property.title}</h3>
            <p className="mt-1 text-xs font-semibold text-dar-muted">
              {property.area}, {property.city}, {property.country}
            </p>
          </div>
          {action ?? (
            <IconButton className="size-8 rounded-lg" label={`More actions for ${property.title}`}>
              <MoreHorizontal className="size-4" />
            </IconButton>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-dar-muted">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="size-3.5" />
            {property.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="size-3.5" />
            {property.bathrooms}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {property.maxGuests}
          </span>
          <span>{property.areaSize} m2</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-dar-primary">
            <Star className="size-4 fill-dar-primary" />
            {property.ratingAverage.toFixed(1)} ({property.reviewsCount})
          </span>
          <p className="text-sm font-black text-dar-navy">
            {formatCurrency(property.pricePerNight, property.currency)}
            <span className="text-xs font-semibold text-dar-muted"> / night</span>
          </p>
        </div>
      </div>
    </article>
  );
}

function BookingActionsDropdown({
  booking,
  onClose,
  style,
}: {
  booking: TravelerBooking;
  onClose: () => void;
  style: React.CSSProperties;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed z-50 w-56 overflow-y-auto rounded-xl border border-dar-border bg-white p-1 shadow-xl max-h-[360px]"
      ref={menuRef}
      role="menu"
      style={style}
    >
      <Link
        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-dar-navy transition hover:bg-dar-primary-soft hover:text-dar-primary"
        href={`/traveler/bookings/${booking.id}`}
        onClick={onClose}
        role="menuitem"
      >
        <ExternalLink className="size-4" />
        View booking details
      </Link>
      <Link
        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-dar-navy transition hover:bg-dar-primary-soft hover:text-dar-primary"
        href={`/traveler/bookings/${booking.id}/invoice`}
        onClick={onClose}
        rel="noopener noreferrer"
        role="menuitem"
        target="_blank"
      >
        <Download className="size-4" />
        Download invoice
      </Link>
      <Link
        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-dar-navy transition hover:bg-dar-primary-soft hover:text-dar-primary"
        href={`/traveler/messages?booking=${booking.id}`}
        onClick={onClose}
        role="menuitem"
      >
        <MessageCircle className="size-4" />
        Contact host
      </Link>
      {booking.status === "confirmed" || booking.status === "pending" ? (
        <Link
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
          href={`/traveler/bookings/${booking.id}`}
          onClick={onClose}
          role="menuitem"
        >
          <XCircle className="size-4" />
          Cancel booking
        </Link>
      ) : null}
    </div>
  );
}

export function BookingCard({
  booking,
  compact = false,
}: {
  booking: TravelerBooking;
  compact?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  function handleActionsMenuClick(event: ReactMouseEvent<HTMLButtonElement>) {
    const triggerRect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 224;
    const gap = 4;

    setMenuStyle({
      left: `${Math.max(gap, Math.min(triggerRect.right - menuWidth, window.innerWidth - menuWidth - gap))}px`,
      top: `${triggerRect.bottom + gap}px`,
    });
    setMenuOpen((current) => !current);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(booking.reference);
      setCopied(true);
      showToast({
        description: `${booking.reference} copied to clipboard.`,
        title: "Booking ID copied",
        type: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({
        description: "Could not copy booking ID. Please try selecting it manually.",
        title: "Copy failed",
        type: "error",
      });
    }
  }

  return (
    <Card className={cx("overflow-hidden", compact ? "p-3" : "p-4")}>
      <div className={cx("grid gap-4", compact ? "grid-cols-[112px_1fr]" : "md:grid-cols-[260px_1fr_190px]")}>
        <div className="relative min-h-28 overflow-hidden rounded-xl">
          <Image
            alt={booking.property.title}
            className={cx("object-cover", booking.property.imagePosition)}
            fill
            sizes="(min-width: 1024px) 260px, 100vw"
            src={booking.property.imageUrl}
          />
          <span className="absolute left-3 top-3 rounded-lg px-3 py-1 text-xs font-black text-white [background-image:var(--dar-gradient)]">
            {booking.status === "pending" ? "Pending" : "Upcoming"}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-dar-navy">{booking.property.title}</h3>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-dar-muted">
                <MapPin className="size-4" />
                {booking.property.area}, {booking.property.city}
              </p>
            </div>
            <StatusBadge label={booking.status} tone="booking" />
          </div>
          <div className="mt-4 grid gap-2 text-sm font-semibold text-dar-muted sm:grid-cols-2">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" />
              {formatDateRange(booking)} ({booking.nightsCount} nights)
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="size-4" />
              {booking.guestsCount} guests, {booking.roomsCount} room
            </span>
          </div>
          {!compact ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={`/traveler/bookings/${booking.id}`}>
                <SecondaryButton className="min-h-10">View details</SecondaryButton>
              </Link>
              <IconButton
                label={copied ? "Booking ID copied" : `Copy booking ID ${booking.reference}`}
                onClick={handleCopy}
              >
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </IconButton>
              <div>
                <IconButton
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  label={`More actions for ${booking.reference}`}
                  onClick={handleActionsMenuClick}
                >
                  <MoreHorizontal className="size-4" />
                </IconButton>
                {menuOpen ? <BookingActionsDropdown booking={booking} onClose={closeMenu} style={menuStyle} /> : null}
              </div>
            </div>
          ) : null}
        </div>
        {!compact ? (
          <div className="flex flex-col justify-between border-t border-dar-border pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
            <div>
              <p className="text-xs font-bold text-dar-muted">Total paid</p>
              <p className="mt-1 text-xl font-black text-dar-navy">{formatCurrency(booking.totalAmount, booking.currency)}</p>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold text-dar-muted">Booking ID</p>
              <p className="mt-1 text-sm font-black text-dar-navy">{booking.reference}</p>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function EmptyState({
  action,
  description,
  icon: Icon = CheckCircle2,
  title,
}: {
  action?: ReactNode;
  description: string;
  icon?: IconComponent;
  title: string;
}) {
  return (
    <Card className="grid min-h-56 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-dar-primary-soft text-dar-primary">
          <Icon className="size-7" />
        </span>
        <h3 className="mt-4 text-lg font-black text-dar-navy">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-dar-muted">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </Card>
  );
}

export function LoadingRows() {
  return (
    <Card className="space-y-4 p-5">
      {[0, 1, 2].map((item) => (
        <div className="flex gap-4" key={item}>
          <div className="size-12 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-1/3 rounded bg-slate-200" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </Card>
  );
}

export function PageHeader({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-normal text-dar-navy md:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm font-semibold text-dar-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MiniFact({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-dar-border bg-white px-3 py-2 text-xs font-bold text-dar-muted">
      <Icon className="size-4 text-dar-primary" />
      <span>{label}</span>
      <strong className="text-dar-navy">{value}</strong>
    </span>
  );
}

export function TimelineItem({
  active,
  label,
  meta,
}: {
  active: boolean;
  label: string;
  meta: string;
}) {
  return (
    <div className="grid grid-cols-[24px_1fr] gap-3">
      <span className={cx("mt-0.5 grid size-5 place-items-center rounded-full", active ? "bg-dar-success text-white" : "border border-slate-300 text-slate-400")}>
        {active ? <CheckCircle2 className="size-4" /> : <Clock3 className="size-3.5" />}
      </span>
      <div>
        <p className="text-sm font-black text-dar-navy">{label}</p>
        <p className="mt-1 text-xs font-semibold text-dar-muted">{meta}</p>
      </div>
    </div>
  );
}
