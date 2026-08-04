"use client";

import Image from "next/image";
import Link from "next/link";
import { type KeyboardEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Copy,
  ExternalLink,
  Eye,
  Frown,
  Meh,
  MoreVertical,
  Pencil,
  Search,
  Share2,
  Smile,
  Star,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/features/system-states/hooks/useToast";
import { deleteReview, submitReview, updateReview } from "../actions";
import type { TravelerReview } from "../types";
import { reviewSchema, type ReviewFormValues } from "../validation";
import { Card, EmptyState, IconButton, PageHeader, PrimaryButton, SecondaryButton, StatusBadge, TextAreaField, cx } from "./shared";

// ─── Types ───────────────────────────────────────────────────────────

type ReviewTab = "all" | "pending" | "submitted";
type SortOption = "newest" | "oldest" | "highest" | "lowest";
type RatingFilter = 0 | 1 | 2 | 3 | 4 | 5;

const REVIEWS_PER_PAGE = 6;

const reviewFieldNames: Array<keyof ReviewFormValues> = [
  "accuracyRating",
  "bookingId",
  "cleanlinessRating",
  "comment",
  "communicationRating",
  "locationRating",
  "rating",
  "valueRating",
];

function isReviewField(value: unknown): value is keyof ReviewFormValues {
  return typeof value === "string" && reviewFieldNames.includes(value as keyof ReviewFormValues);
}

// ─── Helpers ─────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateShort(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(iso);
}

// ─── Rating Stars ────────────────────────────────────────────────────

function RatingStars({
  label = "Rating",
  onChange,
  size = "md",
  value,
}: {
  label?: string;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
  value: number;
}) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const selectedRating = Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;
  const displayedRating = hoveredRating || selectedRating;
  const sizeClass = size === "sm" ? "size-4" : size === "lg" ? "size-7" : "size-6";

  function updateRating(nextRating: number) {
    onChange(Math.max(0, Math.min(5, nextRating)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, starValue: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      updateRating(Math.min(5, selectedRating + 1 || starValue));
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      updateRating(Math.max(1, selectedRating - 1 || starValue));
      return;
    }
    if (event.key === "Home") { event.preventDefault(); updateRating(1); return; }
    if (event.key === "End") { event.preventDefault(); updateRating(5); }
  }

  return (
    <div aria-label={label} className="flex gap-0.5" onMouseLeave={() => setHoveredRating(0)} role="radiogroup">
      {[1, 2, 3, 4, 5].map((item) => {
        const active = item <= displayedRating;
        return (
          <button
            aria-checked={selectedRating === item}
            aria-label={`${item} of 5 stars`}
            className={cx(
              "rounded-sm p-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
              size === "sm" ? "p-0" : "p-0.5",
            )}
            data-active={active ? "true" : "false"}
            key={item}
            onClick={() => updateRating(item)}
            onFocus={() => setHoveredRating(item)}
            onKeyDown={(event) => handleKeyDown(event, item)}
            onMouseEnter={() => setHoveredRating(item)}
            role="radio"
            type="button"
          >
            <Star
              className={cx(
                sizeClass,
                "transition",
                active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-slate-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Display Stars (read-only) ───────────────────────────────────────

function DisplayStars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "size-5" : "size-3.5";
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((item) => (
        <Star
          className={cx(sizeClass, item <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300")}
          key={item}
        />
      ))}
    </span>
  );
}

// ─── Mood Icon ───────────────────────────────────────────────────────

function MoodIcon({ rating }: { rating: number }) {
  if (rating >= 4) return <Smile className="size-4 text-dar-success" />;
  if (rating >= 3) return <Meh className="size-4 text-dar-warning" />;
  return <Frown className="size-4 text-dar-error" />;
}

// ─── Confirm Dialog ──────────────────────────────────────────────────

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

// ─── Review Dialog (Write / Edit) ────────────────────────────────────

function ReviewDialog({
  onClose,
  review,
  isEditing = false,
}: {
  onClose: () => void;
  review: TravelerReview;
  isEditing?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  function getInitialValue(key: keyof Pick<ReviewFormValues, "accuracyRating" | "cleanlinessRating" | "communicationRating" | "locationRating" | "rating" | "valueRating">) {
    if (!isEditing) return 0;
    const value = Number(review[key as keyof TravelerReview] ?? 0);
    return Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;
  }

  const {
    formState: { errors },
    control,
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<ReviewFormValues>({
    defaultValues: {
      accuracyRating: getInitialValue("accuracyRating"),
      bookingId: review.bookingId,
      cleanlinessRating: getInitialValue("cleanlinessRating"),
      comment: review.comment,
      communicationRating: getInitialValue("communicationRating"),
      locationRating: getInitialValue("locationRating"),
      rating: getInitialValue("rating"),
      valueRating: getInitialValue("valueRating"),
    },
  });

  const watchedValues = useWatch({ control });
  const comment = watchedValues.comment ?? "";
  const rating = Number(watchedValues.rating ?? 0);

  useEffect(() => {
    const dialog = dialogRef.current;
    const firstFocusable = dialog?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();
  }, []);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") { onClose(); return; }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onSubmit(values: ReviewFormValues) {
    const parsed = reviewSchema.safeParse(values);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field = firstIssue?.path[0];
      if (isReviewField(field)) {
        setError(field, { message: firstIssue.message, type: "manual" });
      }
      showToast({
        description: parsed.error.issues[0]?.message ?? "Please check your review.",
        title: "Review needs attention",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateReview({ ...parsed.data, reviewId: review.id })
        : await submitReview(parsed.data);

      showToast({
        description: result.message,
        title: result.ok ? (isEditing ? "Review updated" : "Review submitted") : "Could not submit review",
        type: result.ok ? "success" : "error",
      });
      if (result.ok) onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        aria-labelledby="review-dialog-title"
        aria-modal="true"
        className="max-h-[calc(100dvh-32px)] w-full max-w-xl overflow-y-auto rounded-dar border border-dar-border bg-dar-card p-5 shadow-dar-card"
        onKeyDown={handleDialogKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-dar-navy" id="review-dialog-title">
              {isEditing ? "Edit your review" : "Review your stay"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-dar-muted">{review.property.title}</p>
          </div>
          <IconButton label="Close review dialog" onClick={onClose}>
            <X className="size-5" />
          </IconButton>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <Image
              alt={review.property.title}
              className={cx("object-cover", review.property.imagePosition)}
              fill
              src={review.property.imageUrl}
            />
          </span>
          <div>
            <p className="font-black text-dar-navy">{review.property.title}</p>
            <p className="text-sm font-semibold text-dar-muted">
              {review.property.area}, {review.property.city}
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("bookingId")} />
          <div>
            <p className="mb-2 text-sm font-black text-dar-navy">Overall rating</p>
            <RatingStars
              label="Overall rating"
              onChange={(value) => setValue("rating", value, { shouldDirty: true, shouldValidate: true })}
              value={rating}
            />
            {errors.rating ? <p className="mt-2 text-xs font-semibold text-dar-error">{errors.rating.message}</p> : null}
          </div>

          <div className="grid gap-3">
            {([
              ["cleanlinessRating", "Cleanliness"],
              ["accuracyRating", "Accuracy"],
              ["communicationRating", "Communication"],
              ["locationRating", "Location"],
              ["valueRating", "Value"],
            ] as const).map(([name, label]) => (
              <div className="grid grid-cols-[120px_1fr_32px] items-center gap-3" key={name}>
                <span className="text-sm font-bold text-dar-muted">{label}</span>
                <RatingStars
                  label={`${label} rating`}
                  onChange={(value) => setValue(name as keyof ReviewFormValues, value, { shouldDirty: true, shouldValidate: true })}
                  value={Number(watchedValues[name as keyof ReviewFormValues] ?? 0)}
                />
                <span className="text-sm font-black text-dar-navy">
                  {Number(watchedValues[name as keyof ReviewFormValues] ?? 0).toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          <TextAreaField
            error={errors.comment?.message}
            label="Tell future guests about your stay"
            placeholder="Share what stood out, how check-in went, and whether the listing matched expectations."
            {...register("comment")}
          />
          <p className="text-right text-xs font-semibold text-dar-muted">{comment.length} / 1000</p>

          <label className="flex items-start gap-3 text-sm font-semibold text-dar-muted">
            <input className="mt-1 accent-dar-primary" defaultChecked required type="checkbox" />
            I confirm this review is based on my actual stay.
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <SecondaryButton disabled={isPending} onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton loading={isPending} loadingLabel={isEditing ? "Updating review" : "Submitting review"} type="submit">
              {isEditing ? "Update review" : "Submit review"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

// ─── Three-Dot Menu (Radix DropdownMenu) ─────────────────────────────

function ReviewActionsMenuRadix({
  isOwn,
  onCopy,
  onDelete,
  onEdit,
  onShare,
  onViewBooking,
  onViewProperty,
}: {
  isOwn: boolean;
  onCopy: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onShare: () => void;
  onViewBooking: () => void;
  onViewProperty: () => void;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="More actions"
          className="grid size-9 place-items-center rounded-xl border border-dar-border text-dar-muted transition hover:border-dar-primary hover:text-dar-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary"
          type="button"
        >
          <MoreVertical className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-4" />
          Edit review
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewBooking}>
          <Eye className="size-4" />
          View booking
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewProperty}>
          <ExternalLink className="size-4" />
          View property
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}>
          <Share2 className="size-4" />
          Share review
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopy}>
          <Copy className="size-4" />
          Copy review text
        </DropdownMenuItem>
        {isOwn ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="!text-red-600 hover:!bg-red-50"
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              Delete review
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Review Card ─────────────────────────────────────────────────────

function ReviewCard({
  review,
  onDelete,
  onEdit,
  onShare,
  onViewBooking,
  onViewProperty,
}: {
  review: TravelerReview;
  onDelete: (review: TravelerReview) => void;
  onEdit: (review: TravelerReview) => void;
  onShare: (review: TravelerReview) => void;
  onViewBooking: (review: TravelerReview) => void;
  onViewProperty: (review: TravelerReview) => void;
}) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  function handleCopy() {
    const text = [
      `Review by ${review.travelerName}`,
      `Property: ${review.property.title}`,
      `Rating: ${review.rating.toFixed(1)} / 5`,
      `Comment: ${review.comment || "No comment provided"}`,
      `Date: ${formatDate(review.createdAt)}`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        showToast({ description: "Review text copied to clipboard.", title: "Copied", type: "success" });
        setTimeout(() => setCopied(false), 2000);
      },
      () => showToast({ description: "Could not copy review.", title: "Copy failed", type: "error" }),
    );
  }


  function handleEdit() { onEdit(review); }
  function handleDelete() { onDelete(review); }
  function handleViewBooking() { onViewBooking(review); }
  function handleViewProperty() { onViewProperty(review); }

  const property = review.property;

  return (
    <Card className="overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-dar-hover">
      <div className="grid md:grid-cols-[140px_1fr]">
        {/* Property image */}
        <div className="relative min-h-[130px] overflow-hidden md:min-h-full">
          <Image
            alt={property.title}
            className={cx("object-cover", property.imagePosition)}
            fill
            sizes="140px"
            src={property.imageUrl}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-dar-navy">{property.title}</h3>
              <p className="mt-1 truncate text-xs font-semibold text-dar-muted">
                Hosted by {review.hostName}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-dar-muted">
                Booking {review.bookingId.replace("booking-", "DAR-").toUpperCase()} &middot; {formatDateShort(review.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {review.status === "submitted" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">
                  <CheckCircle2 className="size-3" />
                  Verified stay
                </span>
              ) : null}
              <StatusBadge label={review.status} />
            </div>
          </div>

          {/* Pending state — prompt to write */}
          {review.status === "pending" ? (
            <div className="mt-4 flex-1">
              <p className="text-sm font-semibold leading-6 text-dar-muted">
                You stayed at this property. Share your experience to help future guests.
              </p>
            </div>
          ) : (
            <>
              {/* Overall rating */}
              <div className="mt-3 flex items-center gap-2">
                <DisplayStars rating={review.rating} size="sm" />
                <span className="text-sm font-black text-dar-navy">{review.rating.toFixed(1)}</span>
                <MoodIcon rating={review.rating} />
              </div>

              {/* Category ratings */}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-dar-muted">
                <span>Cleanliness {review.cleanlinessRating.toFixed(1)}</span>
                <span>Accuracy {review.accuracyRating.toFixed(1)}</span>
                <span>Communication {review.communicationRating.toFixed(1)}</span>
                <span>Location {review.locationRating.toFixed(1)}</span>
                <span>Value {review.valueRating.toFixed(1)}</span>
              </div>

              {/* Comment */}
              {review.comment ? (
                <p className="mt-3 text-sm font-semibold leading-6 text-dar-navy">{review.comment}</p>
              ) : (
                <p className="mt-3 text-sm font-semibold leading-6 text-dar-muted italic">
                  No written review provided.
                </p>
              )}

              {/* Host response */}
              {review.ownerResponse ? (
                <div className="mt-4 rounded-xl bg-dar-primary-soft/40 p-4 text-sm font-semibold text-dar-muted">
                  <p className="font-black text-dar-primary">Host response:</p>
                  <p className="mt-1 leading-6">{review.ownerResponse}</p>
                </div>
              ) : null}
            </>
          )}

          {/* Actions */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <div className="flex items-center gap-2">
              {review.status === "pending" ? (
                <PrimaryButton className="min-h-9 px-4 text-xs" onClick={() => handleEdit()}>
                  Write a review
                </PrimaryButton>
              ) : (
                <SecondaryButton className="min-h-9 px-4 text-xs" onClick={() => handleEdit()}>
                  <Pencil className="size-3.5" />
                  Edit
                </SecondaryButton>
              )}
              <Link href={`/traveler/bookings/${review.bookingId}`}>
                <SecondaryButton className="min-h-9 px-4 text-xs">
                  <Eye className="size-3.5" />
                  Booking
                </SecondaryButton>
              </Link>
              <Link href={`/stays/${review.property.id}`}>
                <SecondaryButton className="min-h-9 px-4 text-xs">
                  <ExternalLink className="size-3.5" />
                  Property
                </SecondaryButton>
              </Link>
            </div>
            <ReviewActionsMenuRadix
              isOwn={true}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onShare={() => onShare(review)}
              onViewBooking={handleViewBooking}
              onViewProperty={handleViewProperty}
            />
          </div>

          {/* Copy-feedback flash */}
          {copied ? (
            <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-dar-success">
              <ClipboardCopy className="size-3" />
              Copied!
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="size-11 animate-pulse rounded-full bg-slate-200" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="size-4 animate-pulse rounded bg-slate-200" />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function ReviewsPage({
  pending,
  reviews,
  submitted,
}: {
  pending: TravelerReview[];
  reviews: TravelerReview[];
  submitted: TravelerReview[];
}) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<ReviewTab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>(0);
  const [page, setPage] = useState(1);
  const [editingReview, setEditingReview] = useState<TravelerReview | null>(null);
  const [deletingReview, setDeletingReview] = useState<TravelerReview | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Dynamic analytics ──

  const analytics = useMemo(() => {
    const average = submitted.length
      ? submitted.reduce((total, r) => total + r.rating, 0) / submitted.length
      : 0;

    const distribution = [5, 4, 3, 2, 1].map((rating) => ({
      count: submitted.filter((r) => Math.round(r.rating) === rating).length,
      rating,
    }));

    const categoryAverages = {
      accuracy: submitted.length ? submitted.reduce((t, r) => t + r.accuracyRating, 0) / submitted.length : 0,
      cleanliness: submitted.length ? submitted.reduce((t, r) => t + r.cleanlinessRating, 0) / submitted.length : 0,
      communication: submitted.length ? submitted.reduce((t, r) => t + r.communicationRating, 0) / submitted.length : 0,
      location: submitted.length ? submitted.reduce((t, r) => t + r.locationRating, 0) / submitted.length : 0,
      value: submitted.length ? submitted.reduce((t, r) => t + r.valueRating, 0) / submitted.length : 0,
    };

    return { average, categoryAverages, distribution, totalSubmitted: submitted.length, totalPending: pending.length };
  }, [pending, submitted]);

  // ── Filtered & sorted reviews ──

  const visibleReviews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reviews
      .filter((review) => {
        // Status tab
        const tabMatch = tab === "all" || review.status === tab;
        if (!tabMatch) return false;

        // Search
        const queryMatch =
          !normalizedQuery ||
          review.travelerName.toLowerCase().includes(normalizedQuery) ||
          review.property.title.toLowerCase().includes(normalizedQuery) ||
          review.bookingId.toLowerCase().includes(normalizedQuery) ||
          review.comment.toLowerCase().includes(normalizedQuery);
        if (!queryMatch) return false;

        // Rating filter
        if (ratingFilter > 0 && Math.round(review.rating) !== ratingFilter) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "highest": return b.rating - a.rating;
          case "lowest": return a.rating - b.rating;
          default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [query, ratingFilter, reviews, sort, tab]);

  // ── Pagination ──

  const totalPages = Math.max(1, Math.ceil(visibleReviews.length / REVIEWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedReviews = visibleReviews.slice((safePage - 1) * REVIEWS_PER_PAGE, safePage * REVIEWS_PER_PAGE);

  // ── Dynamic insights from comments ──

  const insights = useMemo(() => {
    const wordCounts = new Map<string, number>();
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "was", "are", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall", "can", "need", "dare", "ought", "used", "it", "its", "this", "that", "these", "those", "my", "your", "his", "her", "its", "our", "their", "very", "just", "also", "too", "so", "if", "then", "than", "as", "by", "from", "about", "into", "through", "during", "before", "after", "above", "below", "between", "out", "off", "over", "under", "again", "further", "once", "here", "there", "when", "where", "why", "how", "all", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same"]);
    for (const review of submitted) {
      if (!review.comment) continue;
      const words = review.comment.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
      for (const word of words) {
        if (word.length < 3 || stopWords.has(word)) continue;
        wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
      }
    }
    return Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [submitted]);

  // ── Actions ──

  function handleEdit(review: TravelerReview) { setEditingReview(review); }
  function handleDelete(review: TravelerReview) { setDeletingReview(review); }

  function handleShare(review: TravelerReview) {
    const shareData = {
      text: `Review by ${review.travelerName}: "${review.comment}" — ${review.rating.toFixed(1)}/5 at ${review.property.title}`,
      title: `${review.travelerName}'s review`,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareData.text).then(
        () => showToast({ description: "Review shared to clipboard.", title: "Copied", type: "success" }),
        () => showToast({ description: "Could not share review.", title: "Share failed", type: "error" }),
      );
    }
  }

  function handleViewBooking(review: TravelerReview) {
    window.open(`/traveler/bookings/${review.bookingId}`, "_self");
  }

  function handleViewProperty(review: TravelerReview) {
    window.open(`/stays/${review.property.id}`, "_self");
  }

  function confirmDelete() {
    if (!deletingReview) return;
    const reviewId = deletingReview.id;
    setDeletingReview(null);
    startTransition(async () => {
      const result = await deleteReview({ reviewId });
      showToast({
        description: result.message,
        title: result.ok ? "Review deleted" : "Could not delete",
        type: result.ok ? "success" : "error",
      });
    });
  }

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        description={`${analytics.totalSubmitted} submitted reviews across your completed stays.`}
        title="Guest reviews"
      />

      {/* ═══ Analytics Dashboard ═══ */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card className="grid gap-5 p-5 md:grid-cols-[160px_1fr_1fr]">
            {/* Overall rating */}
            <div className="text-center md:border-r md:border-dar-border">
              <p className="text-5xl font-black text-dar-navy" aria-label={`${analytics.average.toFixed(1)} out of 5`}>
                {analytics.average.toFixed(1)}
              </p>
              <p className="mt-1 text-xs font-bold text-dar-muted">out of 5</p>
              <div className="mt-2 flex justify-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Star
                    className={cx("size-5", item <= Math.round(analytics.average) ? "fill-amber-400" : "fill-transparent")}
                    key={item}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs font-semibold text-dar-muted">
                Based on {analytics.totalSubmitted} {analytics.totalSubmitted === 1 ? "stay" : "stays"}
              </p>
            </div>

            {/* Rating distribution */}
            <div className="space-y-2 self-center">
              {analytics.distribution.map(({ rating, count }) => (
                <div className="grid grid-cols-[24px_1fr_24px] items-center gap-2" key={rating}>
                  <span className="text-xs font-bold text-dar-muted">{rating}</span>
                  <span
                    aria-label={`${rating} stars: ${count} reviews`}
                    className="relative h-2.5 rounded-full bg-slate-100"
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all"
                      style={{ width: `${analytics.totalSubmitted ? (count / analytics.totalSubmitted) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="text-right text-xs font-bold text-dar-muted">{count}</span>
                </div>
              ))}
            </div>

            {/* Category averages */}
            <div className="space-y-2 self-center">
              {([
                ["cleanliness", "Cleanliness"],
                ["accuracy", "Accuracy"],
                ["communication", "Communication"],
                ["location", "Location"],
                ["value", "Value"],
              ] as const).map(([key, label]) => {
                const avg = analytics.categoryAverages[key];
                return (
                  <div className="flex items-center justify-between text-sm" key={key}>
                    <span className="font-semibold text-dar-muted">{label}</span>
                    <span className="inline-flex items-center gap-1.5 font-black text-dar-navy">
                      <DisplayStars rating={avg} />
                      <span className="ml-1 text-xs">{avg.toFixed(1)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ═══ Search, Filter, Sort Toolbar ═══ */}
          <Card className="p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dar-muted">
                  <Search className="size-4" />
                </span>
                <input
                  aria-label="Search reviews by guest name, property, booking ID, or review text"
                  className="h-11 w-full rounded-xl border border-dar-border bg-white pl-10 pr-4 text-sm font-semibold text-dar-navy outline-none transition focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)]"
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search reviews... (Ctrl+K)"
                  ref={searchRef}
                  type="text"
                  value={query}
                />
              </div>

              {/* Sort */}
              <select
                aria-label="Sort reviews"
                className="h-11 rounded-xl border border-dar-border bg-white px-3 text-sm font-bold text-dar-navy outline-none transition focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)]"
                onChange={(e) => {
                  setSort(e.target.value as SortOption);
                  setPage(1);
                }}
                value={sort}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>

              {/* Rating filter */}
              <select
                aria-label="Filter by rating"
                className="h-11 rounded-xl border border-dar-border bg-white px-3 text-sm font-bold text-dar-navy outline-none transition focus:border-dar-primary focus:ring-4 focus:ring-[rgba(94,47,229,0.12)]"
                onChange={(e) => {
                  setRatingFilter(Number(e.target.value) as RatingFilter);
                  setPage(1);
                }}
                value={ratingFilter}
              >
                <option value={0}>All ratings</option>
                <option value={5}>5 stars</option>
                <option value={4}>4 stars</option>
                <option value={3}>3 stars</option>
                <option value={2}>2 stars</option>
                <option value={1}>1 star</option>
              </select>
            </div>
          </Card>

          {/* ═══ Status Tabs ═══ */}
          <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Review status filters">
            {([
              { id: "all" as ReviewTab, label: `All (${reviews.length})` },
              { id: "pending" as ReviewTab, label: `Pending (${analytics.totalPending})` },
              { id: "submitted" as ReviewTab, label: `Submitted (${analytics.totalSubmitted})` },
            ]).map(({ id, label }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                className={cx(
                  "shrink-0 rounded-xl border px-4 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary",
                  tab === id
                    ? "border-dar-primary bg-dar-primary text-white"
                    : "border-dar-border bg-white text-dar-muted hover:border-dar-primary hover:text-dar-primary",
                )}
                onClick={() => {
                  setTab(id);
                  setPage(1);
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {/* ═══ Review Grid ═══ */}
          {paginatedReviews.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2" role="list" aria-label="Guest reviews">
              {paginatedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onShare={handleShare}
                  onViewBooking={handleViewBooking}
                  onViewProperty={handleViewProperty}
                />
              ))}
            </div>
          ) : isPending ? (
            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => <ReviewSkeleton key={i} />)}
            </div>
          ) : (
            <EmptyState
              description={query || ratingFilter > 0 ? "No reviews match your search or filters." : "No reviews yet. Complete a stay to leave a review."}
              icon={Star}
              title="No reviews found"
            />
          )}

          {/* ═══ Pagination ═══ */}
          {visibleReviews.length > REVIEWS_PER_PAGE ? (
            <nav aria-label="Review pagination" className="flex items-center justify-center gap-3">
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
              <span className="text-sm font-bold text-dar-muted" aria-current="page">
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
          ) : null}
        </div>

        {/* ═══ Sidebar ═══ */}
        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Review insights</h2>
            {insights.length > 0 ? (
              <>
                <p className="mt-3 text-sm font-semibold leading-6 text-dar-muted">
                  Most mentioned topics across your reviews:
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {insights.map(([word, count]) => (
                    <span
                      className="rounded-lg bg-dar-primary-soft px-3 py-1.5 text-xs font-black text-dar-primary"
                      key={word}
                      title={`Mentioned ${count} time${count === 1 ? "" : "s"}`}
                    >
                      {word.charAt(0).toUpperCase() + word.slice(1)}
                      <span className="ml-1.5 text-dar-muted">({count})</span>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm font-semibold leading-6 text-dar-muted">
                Insights will appear here once reviews with comments are submitted.
              </p>
            )}
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Review rules</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold text-dar-muted">
              {[
                "Only verified guests can leave a review.",
                "Reviews are published after moderation.",
                "Be respectful and helpful to other guests.",
                "Reviews cannot be edited after 14 days.",
              ].map((rule) => (
                <p className="flex gap-2" key={rule}>
                  <ThumbsUp className="mt-0.5 size-4 shrink-0 text-dar-primary" />
                  {rule}
                </p>
              ))}
            </div>
          </Card>
        </aside>
      </section>

      {/* Dialogs */}
      {editingReview ? (
        <ReviewDialog
          onClose={() => setEditingReview(null)}
          review={editingReview}
          isEditing={editingReview.status === "submitted"}
        />
      ) : null}
      {deletingReview ? (
        <ConfirmDialog
          message="This review will be permanently deleted. This cannot be undone."
          onCancel={() => setDeletingReview(null)}
          onConfirm={confirmDelete}
          title="Delete review?"
        />
      ) : null}
    </div>
  );
}
