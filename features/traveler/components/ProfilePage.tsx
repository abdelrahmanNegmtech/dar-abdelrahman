"use client";

import Image from "next/image";
import { useEffect, useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Camera,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  User,
  Wallet,
  XCircle,
  Clock,
} from "lucide-react";
import { useToast } from "@/features/system-states/hooks/useToast";
import { updateTravelerProfile, removePaymentMethod, setDefaultPaymentMethod } from "../actions";
import type { ActivityEvent, PaymentMethod, TravelerProfile } from "../types";
import { profileSchema, type ProfileFormValues } from "../validation";
import { Card, PageHeader, PrimaryButton, SecondaryButton, SelectField, TextField, cx } from "./shared";

const profileFieldNames: Array<keyof ProfileFormValues> = [
  "address",
  "city",
  "country",
  "dateOfBirth",
  "displayName",
  "email",
  "emergencyContactName",
  "emergencyContactPhone",
  "fullName",
  "nationality",
  "phone",
  "preferredCurrency",
  "preferredLanguage",
];

function isProfileField(value: unknown): value is keyof ProfileFormValues {
  return typeof value === "string" && profileFieldNames.includes(value as keyof ProfileFormValues);
}

function formatActivityDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

type CompletionItem = {
  label: string;
  done: boolean;
  hint: string;
};

export function ProfilePage({
  activity,
  completion,
  methods,
  profile,
}: {
  activity: ActivityEvent[];
  completion: number;
  methods: PaymentMethod[];
  profile: TravelerProfile;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "personal";
  const [activePanel, setActivePanel] = useState(tabFromUrl);

  function handleTabChange(tab: string) {
    setActivePanel(tab);
    router.replace(`/traveler/profile?tab=${tab}`, { scroll: false });
  }
  const [isPending, startTransition] = useTransition();
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removingMethodId, setRemovingMethodId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      address: profile.address,
      city: profile.city,
      country: profile.country,
      dateOfBirth: profile.dateOfBirth,
      displayName: profile.displayName,
      email: profile.email,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone: profile.emergencyContactPhone,
      fullName: profile.fullName,
      nationality: profile.nationality,
      phone: profile.phone,
      preferredCurrency: profile.preferredCurrency,
      preferredLanguage: profile.preferredLanguage,
    },
    mode: "onBlur",
  });

  const hasUnsavedChanges = isDirty;
  const currentAvatarUrl = photoPreview ?? profile.avatarUrl;

  // ── Dynamic completion items ──
  const completionItems: CompletionItem[] = [
    { label: "Full name entered", done: profile.fullName.trim().length >= 2, hint: "Add your full legal name." },
    { label: "Profile photo uploaded", done: profile.avatarUrl.length > 0, hint: "Upload a profile photo." },
    { label: "Email verified", done: profile.emailVerified, hint: "Verify your email address." },
    { label: "Phone verified", done: profile.phoneVerified, hint: "Verify your phone number." },
    { label: "Date of birth added", done: profile.dateOfBirth.length > 0, hint: "Add your date of birth." },
    { label: "Address completed", done: !!(profile.address && profile.city && profile.country), hint: "Complete your address." },
    { label: "Emergency contact added", done: !!(profile.emergencyContactName && profile.emergencyContactPhone), hint: "Add an emergency contact." },
    { label: "Identity verified", done: profile.identityVerified, hint: "Complete identity verification." },
  ];

  // ── Beforeunload guard ──
  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [hasUnsavedChanges]);

  // ── Photo upload ──
  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast({ description: "Please select a JPG, PNG, or WebP image.", title: "Invalid file type", type: "error" });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      showToast({ description: "Image must be under 5 MB.", title: "File too large", type: "error" });
      return;
    }

    setIsPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
      setIsPhotoUploading(false);
      showToast({ description: "Photo selected. Save your profile to apply changes.", title: "New photo ready", type: "info" });
    };
    reader.onerror = () => {
      setIsPhotoUploading(false);
      showToast({ description: "Could not read the selected file.", title: "Upload failed", type: "error" });
    };
    reader.readAsDataURL(file);
    // Reset input so selecting the same file triggers change again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Form submission ──
  function onSubmit(values: ProfileFormValues) {
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field = firstIssue?.path[0];
      if (isProfileField(field)) {
        setError(field, { message: firstIssue.message, type: "manual" });
      }
      showToast({
        description: parsed.error.issues[0]?.message ?? "Please check your profile.",
        title: "Profile needs attention",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      const result = await updateTravelerProfile(parsed.data);
      showToast({
        description: result.message,
        title: result.ok ? "Profile saved" : "Could not save profile",
        type: result.ok ? "success" : "error",
      });
      if (result.ok) {
        reset(parsed.data);
        setPhotoPreview(null);
      }
    });
  }

  // ── Payment actions ──
  function handleSetDefault(methodId: string) {
    startTransition(async () => {
      const result = await setDefaultPaymentMethod(methodId);
      showToast({
        description: result.message,
        title: result.ok ? "Default updated" : "Could not update default",
        type: result.ok ? "success" : "error",
      });
    });
  }

  function handleRemoveMethod(methodId: string) {
    setConfirmRemoveId(methodId);
  }

  function confirmRemove() {
    if (!confirmRemoveId) return;
    const id = confirmRemoveId;
    setConfirmRemoveId(null);
    setRemovingMethodId(id);
    startTransition(async () => {
      const result = await removePaymentMethod(id);
      showToast({
        description: result.message,
        title: result.ok ? "Payment method removed" : "Could not remove",
        type: result.ok ? "success" : "error",
      });
      setRemovingMethodId(null);
    });
  }

  function handleDiscard() {
    setConfirmDiscard(false);
    reset();
    setPhotoPreview(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage your personal details, verification, and payment methods."
        title="Profile settings"
      />

      <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        {/* ── Left nav tabs ── */}
        <Card className="self-start p-3">
          <nav className="space-y-1" aria-label="Profile sections">
            {[
              ["personal", User, "Personal information"],
              ["verification", ShieldCheck, "Verification"],
              ["payment", CreditCard, "Payment methods"],
            ].map(([id, Icon, label]) => (
              <button
                key={String(id)}
                type="button"
                role="tab"
                aria-selected={activePanel === id}
                className={cx(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary",
                  activePanel === id ? "bg-dar-primary-soft text-dar-primary" : "text-dar-muted hover:bg-slate-50",
                )}
                onClick={() => handleTabChange(String(id))}
              >
                <Icon className="size-5" />
                {String(label)}
              </button>
            ))}
          </nav>
        </Card>

        {/* ── Main form ── */}
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Personal information */}
          {activePanel === "personal" && (
            <>
              <Card className="p-5" id="personal">
                <h2 className="text-lg font-black text-dar-navy">Personal information</h2>
                <p className="mt-1 text-sm font-semibold text-dar-muted">
                  Your name, photo, and contact details.
                </p>

                <div className="mt-5 grid gap-5 lg:grid-cols-[150px_1fr]">
                  {/* Photo */}
                  <div>
                    <span className="relative block size-24 overflow-hidden rounded-full bg-slate-100">
                      {isPhotoUploading ? (
                        <span className="absolute inset-0 grid place-items-center bg-black/20 text-white text-xs font-bold">
                          Uploading...
                        </span>
                      ) : null}
                      <Image
                        alt={profile.fullName}
                        className="object-cover"
                        fill
                        sizes="96px"
                        src={currentAvatarUrl}
                      />
                    </span>
                    <label className="mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dar-primary px-4 text-sm font-black text-dar-primary transition hover:bg-dar-primary-soft">
                      <Camera className="size-4" />
                      Change photo
                      <input
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={handlePhotoChange}
                        ref={fileInputRef}
                        type="file"
                      />
                    </label>
                    <p className="mt-2 text-xs font-semibold text-dar-muted">JPG, PNG or WebP up to 5 MB.</p>
                  </div>

                  {/* Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField
                      error={errors.fullName?.message}
                      label="Full name"
                      placeholder="Your legal full name"
                      {...register("fullName")}
                    />
                    <TextField
                      error={errors.displayName?.message}
                      label="Display name"
                      placeholder="How others see you"
                      {...register("displayName")}
                    />
                    <div>
                      <TextField
                        disabled
                        label="Email address"
                        title="Email changes require a separate verification process."
                        type="email"
                        {...register("email")}
                      />
                      <p className="mt-1.5 text-[11px] font-semibold text-dar-muted">
                        Email changes require a separate verification process.{' '}
                        <a className="text-dar-primary underline" href="/traveler/support?tab=create">
                          Contact support
                        </a>{' '}
                        to update your email.
                      </p>
                    </div>
                    <TextField
                      error={errors.phone?.message}
                      label="Phone number"
                      placeholder="+20 100 000 0000"
                      type="tel"
                      {...register("phone")}
                    />
                    <TextField
                      error={errors.dateOfBirth?.message}
                      label="Date of birth"
                      type="date"
                      {...register("dateOfBirth")}
                    />
                    <TextField
                      error={errors.nationality?.message}
                      label="Nationality"
                      placeholder="e.g. German"
                      {...register("nationality")}
                    />
                    <SelectField label="Preferred language" {...register("preferredLanguage")}>
                      <option value="English">English</option>
                      <option value="Arabic">Arabic</option>
                      <option value="German">German</option>
                    </SelectField>
                    <SelectField label="Preferred currency" {...register("preferredCurrency")}>
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </SelectField>
                  </div>
                </div>
              </Card>

              {/* Contact and address */}
              <Card className="p-5">
                <h2 className="text-lg font-black text-dar-navy">Contact and address</h2>
                <p className="mt-1 text-sm font-semibold text-dar-muted">
                  Your location and emergency contact. This information is kept private.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <TextField
                    error={errors.country?.message}
                    label="Country of residence"
                    placeholder="e.g. Germany"
                    {...register("country")}
                  />
                  <TextField
                    error={errors.city?.message}
                    label="City"
                    placeholder="e.g. Berlin"
                    {...register("city")}
                  />
                  <div className="md:col-span-2">
                    <TextField
                      error={errors.address?.message}
                      label="Address"
                      placeholder="Street, building, apartment"
                      {...register("address")}
                    />
                  </div>
                  <TextField
                    error={errors.emergencyContactName?.message}
                    label="Emergency contact name"
                    placeholder="Full name"
                    {...register("emergencyContactName")}
                  />
                  <TextField
                    error={errors.emergencyContactPhone?.message}
                    label="Emergency contact phone"
                    placeholder="+20 100 000 0000"
                    type="tel"
                    {...register("emergencyContactPhone")}
                  />
                </div>
              </Card>
            </>
          )}

          {/* Verification */}
          {activePanel === "verification" && (
            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Verification</h2>
              <p className="mt-1 text-sm font-semibold text-dar-muted">
                Verified accounts enjoy faster booking approvals and higher host trust.
              </p>
              <div className="mt-5 space-y-4">
                {/* Email */}
                <div className="flex items-center justify-between rounded-xl border border-dar-border p-4">
                  <div className="flex items-center gap-3">
                    {profile.emailVerified ? (
                      <CheckCircle2 className="size-6 text-dar-success" />
                    ) : (
                      <XCircle className="size-6 text-dar-muted" />
                    )}
                    <div>
                      <p className="text-sm font-black text-dar-navy">Email address</p>
                      <p className="text-xs font-semibold text-dar-muted">{profile.email}</p>
                    </div>
                  </div>
                  <span className={cx(
                    "rounded-lg px-2.5 py-1 text-[11px] font-black",
                    profile.emailVerified ? "bg-emerald-50 text-dar-success" : "bg-amber-50 text-dar-warning",
                  )}>
                    {profile.emailVerified ? "Verified" : "Pending"}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between rounded-xl border border-dar-border p-4">
                  <div className="flex items-center gap-3">
                    {profile.phoneVerified ? (
                      <CheckCircle2 className="size-6 text-dar-success" />
                    ) : (
                      <XCircle className="size-6 text-dar-muted" />
                    )}
                    <div>
                      <p className="text-sm font-black text-dar-navy">Phone number</p>
                      <p className="text-xs font-semibold text-dar-muted">{profile.phone || "Not added"}</p>
                    </div>
                  </div>
                  <span className={cx(
                    "rounded-lg px-2.5 py-1 text-[11px] font-black",
                    profile.phoneVerified ? "bg-emerald-50 text-dar-success" : "bg-amber-50 text-dar-warning",
                  )}>
                    {profile.phoneVerified ? "Verified" : "Not verified"}
                  </span>
                </div>

                {/* Identity */}
                <div className="flex items-center justify-between rounded-xl border border-dar-border p-4">
                  <div className="flex items-center gap-3">
                    {profile.identityVerified ? (
                      <CheckCircle2 className="size-6 text-dar-success" />
                    ) : (
                      <ShieldCheck className="size-6 text-dar-muted" />
                    )}
                    <div>
                      <p className="text-sm font-black text-dar-navy">Identity verification</p>
                      <p className="text-xs font-semibold text-dar-muted">
                        {profile.identityVerified
                          ? "Verified successfully"
                          : "Upload a government ID to verify your identity."}
                      </p>
                    </div>
                  </div>
                  <SecondaryButton
                    className="min-h-9 px-3 text-xs"
                    onClick={() =>
                      showToast({
                        description: "Identity verification is not available in preview mode.",
                        title: "Verification preview",
                        type: "info",
                      })
                    }
                  >
                    {profile.identityVerified ? "View" : "Upload ID"}
                  </SecondaryButton>
                </div>
              </div>
            </Card>
          )}

          {/* Payment methods */}
          {activePanel === "payment" && (
            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Payment methods</h2>
              <p className="mt-1 text-sm font-semibold text-dar-muted">
                Manage your saved payment methods. Manage full transactions from the{" "}
                <a className="text-dar-primary underline" href="/traveler/payments">
                  Payments page
                </a>.
              </p>

              <div className="mt-4 space-y-3">
                {methods.length === 0 ? (
                  <p className="py-6 text-center text-sm font-semibold text-dar-muted">
                    No payment methods saved yet.
                  </p>
                ) : (
                  methods.map((method) => (
                    <div
                      key={method.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dar-border p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Wallet className="size-5 shrink-0 text-dar-primary" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-dar-navy">
                            {method.brand}
                            {method.lastFour ? ` ending ${method.lastFour}` : ""}
                            {method.isDefault ? (
                              <span className="ml-2 rounded-md bg-dar-primary-soft px-2 py-0.5 text-[10px] font-bold text-dar-primary">
                                Default
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs font-semibold text-dar-muted">
                            {method.methodType === "card" && method.expiryMonth && method.expiryYear
                              ? `Expires ${method.expiryMonth}/${method.expiryYear}`
                              : method.methodType === "wallet"
                                ? "Wallet"
                                : "Saved"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!method.isDefault ? (
                          <button
                            className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-dar-primary transition hover:bg-dar-primary-soft"
                            onClick={() => handleSetDefault(method.id)}
                            type="button"
                          >
                            Set default
                          </button>
                        ) : null}
                        <button
                          className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                          disabled={removingMethodId === method.id}
                          onClick={() => handleRemoveMethod(method.id)}
                          type="button"
                        >
                          {removingMethodId === method.id ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <a
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-dar-primary text-sm font-bold text-dar-primary transition hover:bg-dar-primary-soft"
                href="/traveler/payments"
              >
                <ExternalLink className="size-4" />
                Manage in Payments page
              </a>
            </Card>
          )}

          {/* ── Save / Discard footer ── */}
          <div className="sticky bottom-[84px] z-20 flex flex-col gap-3 rounded-dar border border-dar-border bg-white/92 p-3 shadow-dar-card backdrop-blur lg:bottom-4 lg:flex-row lg:justify-end">
            <SecondaryButton
              disabled={!hasUnsavedChanges || isPending}
              onClick={() => setConfirmDiscard(true)}
            >
              Discard changes
            </SecondaryButton>
            <PrimaryButton
              disabled={!hasUnsavedChanges || isPending}
              loading={isPending}
              loadingLabel="Saving changes"
              type="submit"
            >
              Save changes
            </PrimaryButton>
          </div>
        </form>

        {/* ── Right sidebar ── */}
        <aside className="space-y-5">
          {/* Profile completion */}
          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Profile completion</h2>
            <p className="mt-2 text-3xl font-black text-dar-navy">{completion}%</p>
            <div className="mt-3 h-2.5 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-dar-primary transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <div className="mt-4 space-y-3">
              {completionItems.map((item, index) => {
                const tabTarget =
                  index <= 1 ? "personal" :
                  index <= 3 ? "personal" :
                  index === 5 ? "personal" :
                  "verification";
                return item.done ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-dar-muted" key={item.label}>
                    <Check className="size-4 shrink-0 text-dar-success" />
                    {item.label}
                  </p>
                ) : (
                  <button
                    className="flex w-full items-center gap-2 text-left text-sm font-semibold text-dar-muted transition hover:text-dar-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dar-primary rounded-lg"
                    key={item.label}
                    onClick={() => handleTabChange(tabTarget)}
                    type="button"
                  >
                    <span className="size-4 shrink-0 rounded-full border-2 border-slate-300" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Account trust */}
          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Account trust level</h2>
            <div className="mt-4 flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-dar-primary-soft text-dar-primary">
                <ShieldCheck className="size-8" />
              </span>
              <div>
                <p className="font-black text-dar-navy">
                  {profile.emailVerified && profile.phoneVerified ? "Trusted traveler" : "Standard guest"}
                </p>
                <p className="mt-1 text-sm font-semibold leading-5 text-dar-muted">
                  {profile.emailVerified && profile.phoneVerified
                    ? "Your verified profile enables faster bookings and higher host confidence."
                    : "Verify your email and phone to become a trusted traveler."}
                </p>
              </div>
            </div>
          </Card>

          {/* Recent activity */}
          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Recent activity</h2>
            {activity.length === 0 ? (
              <p className="mt-4 text-sm font-semibold text-dar-muted">No recent activity.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {activity.slice(0, 5).map((item) => (
                  <div className="flex items-start gap-3" key={item.id}>
                    <Clock className="mt-0.5 size-4 shrink-0 text-dar-muted" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-dar-navy">{item.label}</p>
                      <p className="text-xs font-semibold text-dar-muted">{item.description}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-dar-muted/70">
                        {formatActivityDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>

      {/* ── Confirm discard modal ── */}
      {confirmDiscard ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setConfirmDiscard(false)}
        >
          <div
            className="w-full max-w-sm rounded-dar border border-dar-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="discard-title"
          >
            <h3 id="discard-title" className="text-lg font-black text-dar-navy">Discard unsaved changes?</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-dar-muted">
              Any unsaved changes to your profile will be lost.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl border border-dar-border px-5 py-2.5 text-sm font-bold text-dar-navy transition hover:bg-slate-50"
                onClick={() => setConfirmDiscard(false)}
                type="button"
              >
                Keep editing
              </button>
              <button
                className="rounded-xl border border-dar-error px-5 py-2.5 text-sm font-bold text-dar-error transition hover:bg-red-50"
                onClick={handleDiscard}
                type="button"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Confirm remove modal ── */}
      {confirmRemoveId ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setConfirmRemoveId(null)}
        >
          <div
            className="w-full max-w-sm rounded-dar border border-dar-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-method-title"
          >
            <h3 id="remove-method-title" className="text-lg font-black text-dar-navy">Remove payment method?</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-dar-muted">
              This payment method will be removed from your account. You can add it again later.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl border border-dar-border px-5 py-2.5 text-sm font-bold text-dar-navy transition hover:bg-slate-50"
                onClick={() => setConfirmRemoveId(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-dar-error px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
                onClick={confirmRemove}
                type="button"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
