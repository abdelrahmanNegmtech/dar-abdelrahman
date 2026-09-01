"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowRight,
  BellOff,
  Camera,
  CheckCircle2,
  CircleHelp,
  KeyRound,
  Mail,
  MapPin,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Button } from "@/features/design-system";
import { ownerRoutes } from "@/lib/owner-routes";
import { updateOwnerSettingsProfile } from "./actions";
import type {
  OwnerSettingsActionResult,
  OwnerSettingsFormValues,
  OwnerSettingsPageData,
} from "./settings-types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildInitialValues(data: OwnerSettingsPageData): OwnerSettingsFormValues {
  return {
    address: data.profile.address ?? "",
    city: data.profile.city ?? "",
    country: data.profile.country ?? data.profile.countryName ?? "",
    displayName: data.profile.displayName ?? "",
    fullName: data.profile.fullName,
    phone: data.profile.phone ?? "",
    preferredCurrency: data.profile.preferredCurrency ?? "",
    preferredLanguage: data.profile.preferredLanguage ?? "",
  };
}

function normalizeFormValues(values: OwnerSettingsFormValues): OwnerSettingsFormValues {
  return {
    address: values.address.trim(),
    city: values.city.trim(),
    country: values.country.trim(),
    displayName: values.displayName.trim(),
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    preferredCurrency: values.preferredCurrency.trim(),
    preferredLanguage: values.preferredLanguage.trim(),
  };
}

function Field({
  error,
  hint,
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  type = "text",
}: {
  error?: string;
  hint?: string;
  label: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: "email" | "text";
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#0d1735]">{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        className={`mt-2 h-12 w-full rounded-xl border px-4 text-sm outline-none transition ${
          readOnly
            ? "cursor-default border-[#dbe2ee] bg-[#f8fafc] text-[#475569]"
            : error
              ? "border-[#ef4444] bg-white text-[#0d1735] focus:border-[#ef4444] focus:ring-4 focus:ring-[#ef4444]/10"
              : "border-[#dbe2ee] bg-white text-[#0d1735] hover:border-[#c6d0e1] focus:border-[#6C3DFF] focus:ring-4 focus:ring-[#6C3DFF]/10"
        }`}
      />
      {error ? <p className="mt-2 text-xs font-medium text-[#dc2626]">{error}</p> : null}
      {!error && hint ? <p className="mt-2 text-xs text-[#64748b]">{hint}</p> : null}
    </label>
  );
}

function StatusPill({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-[#e8f7ee] text-[#166534]"
          : "bg-[#f1f5f9] text-[#475569]"
      }`}
    >
      <span
        className={`size-2 rounded-full ${active ? "bg-[#16a34a]" : "bg-[#94a3b8]"}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function ActionCard({
  description,
  href,
  icon: Icon,
  title,
}: {
  description: string;
  href: string;
  icon: typeof ShieldCheck;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-[28px] border border-[#e2e8f0] bg-white p-6 transition duration-200 hover:border-[#cdbefc] hover:shadow-[0_18px_40px_rgba(91,44,230,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-[#efe8ff] text-[#5b2ce6] transition group-hover:bg-[#5b2ce6] group-hover:text-white">
        <Icon className="size-5" strokeWidth={1.8} />
      </span>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#0d1735]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#59637d]">{description}</p>
        </div>
        <ArrowRight className="mt-1 size-4 shrink-0 text-[#5b2ce6]" strokeWidth={1.8} />
      </div>
    </Link>
  );
}

export default function OwnerSettingsPageClient({
  data,
}: {
  data: OwnerSettingsPageData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(() => buildInitialValues(data));
  const [result, setResult] = useState<OwnerSettingsActionResult | null>(null);
  const accountStatus = useMemo(
    () => [
      {
        active: data.profile.emailVerified,
        label: data.profile.emailVerified ? "Email verified" : "Email not verified",
      },
      {
        active: data.profile.phoneVerified,
        label: data.profile.phoneVerified ? "Phone verified" : "Phone not verified",
      },
      {
        active: data.profile.identityVerified,
        label: data.profile.identityVerified ? "Identity verified" : "Identity review pending",
      },
    ],
    [data.profile.emailVerified, data.profile.identityVerified, data.profile.phoneVerified],
  );

  function updateField<Key extends keyof OwnerSettingsFormValues>(key: Key, value: OwnerSettingsFormValues[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    startTransition(async () => {
      const nextResult = await updateOwnerSettingsProfile(form);
      setResult(nextResult);

      if (nextResult.ok) {
        setForm(normalizeFormValues(form));
        router.refresh();
      }
    });
  }

  return (
    <div className="owner-dashboard-page px-7 pb-8 pt-6 max-[700px]:px-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="owner-page-title">Settings</h1>
          <p className="owner-page-description mt-2 text-slate-500">
            Manage the profile details and account preferences that DAR already supports for your owner account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {accountStatus.map((item) => (
            <StatusPill key={item.label} active={item.active} label={item.label} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-[radial-gradient(circle_at_top_left,_rgba(239,232,255,0.9),_rgba(255,255,255,1)_55%)] p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <ProfileAvatar
                  src={data.profile.avatarUrl}
                  name={data.profile.displayName || data.profile.fullName}
                  size={72}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold text-[#0d1735]">
                      {data.profile.displayName || data.profile.fullName}
                    </h2>
                    <StatusPill
                      active={data.profile.identityVerified}
                      label={data.profile.identityVerified ? "Verified owner" : "Verification in progress"}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[#59637d]">{data.profile.email}</p>
                  <p className="mt-1 text-sm text-[#59637d]">
                    {data.profile.city || data.profile.country || data.profile.countryName
                      ? [data.profile.city, data.profile.country || data.profile.countryName].filter(Boolean).join(", ")
                      : "Location not set"}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 rounded-[24px] border border-white/70 bg-white/80 p-4 text-sm text-[#475569] sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-[#0d1735]">Member since</p>
                  <p className="mt-1">{formatDate(data.profile.createdAt)}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0d1735]">Last profile update</p>
                  <p className="mt-1">{formatDate(data.profile.updatedAt)}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0d1735]">Preferred language</p>
                  <p className="mt-1">{data.profile.preferredLanguage || "Not set"}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0d1735]">Preferred currency</p>
                  <p className="mt-1">{data.profile.preferredCurrency || "Not set"}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <ActionCard
              href={ownerRoutes.verification}
              icon={ShieldCheck}
              title="Verification"
              description={`Current status: ${data.verification.statusLabel}. Continue the dedicated verification workflow for documents and approval updates.`}
            />
            <ActionCard
              href={ownerRoutes.help}
              icon={CircleHelp}
              title="Help Center"
              description="Get support for listings, bookings, payouts, or owner account questions without leaving the portal."
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <section className="rounded-[30px] border border-[#e2e8f0] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#0d1735]">Profile</h2>
                  <p className="mt-2 text-sm leading-6 text-[#59637d]">
                    Edit the real profile fields stored on your authenticated owner account.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm text-[#475569]">
                  Avatar updates are deferred
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field
                  label="Full name"
                  value={form.fullName}
                  onChange={(value) => updateField("fullName", value)}
                  error={result?.fieldErrors?.fullName}
                />
                <Field
                  label="Display name"
                  value={form.displayName}
                  onChange={(value) => updateField("displayName", value)}
                  error={result?.fieldErrors?.displayName}
                  hint="Optional short name shown around the product when available."
                />
                <Field
                  label="Email address"
                  type="email"
                  readOnly
                  value={data.profile.email}
                  hint="Email changes are managed by the authentication flow."
                />
                <Field
                  label="Phone number"
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                  error={result?.fieldErrors?.phone}
                  hint="Include a country code if you want this used for verification and support."
                />
                <div className="md:col-span-2">
                  <Field
                    label="Address"
                    value={form.address}
                    onChange={(value) => updateField("address", value)}
                    error={result?.fieldErrors?.address}
                    hint="Street address or building details."
                  />
                </div>
                <Field
                  label="City"
                  value={form.city}
                  onChange={(value) => updateField("city", value)}
                  error={result?.fieldErrors?.city}
                />
                <Field
                  label="Country"
                  value={form.country}
                  onChange={(value) => updateField("country", value)}
                  error={result?.fieldErrors?.country}
                />
              </div>
            </section>

            <section className="rounded-[30px] border border-[#e2e8f0] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
              <h2 className="text-xl font-semibold text-[#0d1735]">Preferences</h2>
              <p className="mt-2 text-sm leading-6 text-[#59637d]">
                Store your preferred language and currency on the owner profile without introducing fake notification toggles.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field
                  label="Preferred language"
                  value={form.preferredLanguage}
                  onChange={(value) => updateField("preferredLanguage", value)}
                  error={result?.fieldErrors?.preferredLanguage}
                  placeholder="English"
                />
                <Field
                  label="Preferred currency"
                  value={form.preferredCurrency}
                  onChange={(value) => updateField("preferredCurrency", value)}
                  error={result?.fieldErrors?.preferredCurrency}
                  placeholder="EGP"
                />
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-[24px] border border-[#e2e8f0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-5 text-sm">
                {result ? (
                  <p className={result.ok ? "text-[#166534]" : "text-[#b91c1c]"}>
                    {result.ok ? <CheckCircle2 className="mr-2 inline size-4" /> : <AlertCircle className="mr-2 inline size-4" />}
                    {result.message}
                  </p>
                ) : (
                  <p className="text-[#64748b]">
                    Changes save to the authenticated owner profile in Supabase.
                  </p>
                )}
              </div>
              <Button type="submit" disabled={isPending} className="min-w-[170px]">
                {isPending ? "Saving..." : "Save settings"}
              </Button>
            </div>
          </form>

          <section className="rounded-[30px] border border-[#e2e8f0] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
            <h2 className="text-xl font-semibold text-[#0d1735]">Security</h2>
            <p className="mt-2 text-sm leading-6 text-[#59637d]">
              Only real account security actions already supported by DAR are surfaced here.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-[#e2e8f0] bg-[#fbfcff] p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#efe8ff] text-[#5b2ce6]">
                    <KeyRound className="size-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-[#0d1735]">Password reset</h3>
                    <p className="mt-2 text-sm leading-6 text-[#59637d]">
                      Use DAR&apos;s password recovery flow to reset your password through the existing auth provider.
                    </p>
                    <Link
                      href="/forgot-password"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#5b2ce6] hover:text-[#4c22ca]"
                    >
                      Open password recovery
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#e2e8f0] bg-[#fbfcff] p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#e8f7ee] text-[#15803d]">
                    <ShieldCheck className="size-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-[#0d1735]">Verification status</h3>
                    <p className="mt-2 text-sm leading-6 text-[#59637d]">
                      Account verification remains in the dedicated owner verification workflow so document handling stays backend-authoritative.
                    </p>
                    <Link
                      href={data.verification.href}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#5b2ce6] hover:text-[#4c22ca]"
                    >
                      Open verification
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-[#e2e8f0] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
            <h2 className="text-xl font-semibold text-[#0d1735]">Deferred for now</h2>
            <p className="mt-2 text-sm leading-6 text-[#59637d]">
              These items were intentionally not simulated because I did not find safe backend support for them.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  description: "The profile stores an avatar URL, but there is no owner-safe avatar upload flow wired to Supabase yet.",
                  icon: Camera,
                  title: "Avatar management",
                },
                {
                  description: "I did not find backend fields or actions for owner notification preferences, so no fake toggles were added.",
                  icon: BellOff,
                  title: "Notification preferences",
                },
                {
                  description: "The public owner page is still backed by static mock content, so public profile linking remains deferred.",
                  icon: MapPin,
                  title: "Public profile linkage",
                },
                {
                  description: "The profiles table has deactivation fields, but there is no safe owner-facing deactivate or delete workflow implemented.",
                  icon: UserX,
                  title: "Account deactivation",
                },
              ].map(({ description, icon: Icon, title }) => (
                <article key={title} className="rounded-[24px] border border-dashed border-[#d7deea] bg-[#fbfcff] p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#f1f5f9] text-[#475569]">
                      <Icon className="size-5" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-[#0d1735]">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#59637d]">{description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[28px] border border-[#e2e8f0] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#0d1735]">Account summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#64748b]">Email</dt>
                <dd className="text-right font-medium text-[#0d1735]">{data.profile.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#64748b]">Phone</dt>
                <dd className="text-right font-medium text-[#0d1735]">{data.profile.phone || "Not set"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#64748b]">Verification</dt>
                <dd className="text-right font-medium text-[#0d1735]">{data.verification.statusLabel}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#64748b]">Submitted</dt>
                <dd className="text-right font-medium text-[#0d1735]">
                  {data.verification.submittedAt ? formatDate(data.verification.submittedAt) : "Not submitted"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[28px] border border-[#e2e8f0] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#0d1735]">Support</h2>
            <p className="mt-3 text-sm leading-6 text-[#59637d]">
              Reach the owner help center for listing, booking, payout, or account support.
            </p>
            <Link
              href={ownerRoutes.help}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#5b2ce6] hover:text-[#4c22ca]"
            >
              <Mail className="size-4" />
              Open Help Center
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
