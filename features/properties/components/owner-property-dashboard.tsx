import Link from "next/link";
import type { ReactNode } from "react";
import { OwnerShell } from "@/components/owner/owner-shell";
import type {
  OwnerAvailabilityViewModel,
  OwnerPricingRuleViewModel,
  OwnerPropertySummary,
  OwnerPropertyStatusGroup,
} from "@/features/properties/data/owner-property-queries";

export function formatCurrencyFromMinor(minor: number) {
  return new Intl.NumberFormat("en-EG", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "EGP",
  }).format(minor / 100);
}

export function formatOwnerDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OwnerPropertyPageShell({
  actions,
  children,
  description,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <OwnerShell active="My Properties" actions={actions}>
      <div className="owner-dashboard-content space-y-5">
        <div>
          <h1 className="owner-page-title">{title}</h1>
          <p className="owner-page-description mt-2">{description}</p>
        </div>
        {children}
      </div>
    </OwnerShell>
  );
}

export function OwnerPropertyTabs({ propertyId }: { propertyId: string }) {
  const tabs = [
    ["Overview", `/owner/properties/${propertyId}`],
    ["Edit", `/owner/properties/${propertyId}/edit`],
    ["Photos", `/owner/properties/${propertyId}/photos`],
    ["Calendar", `/owner/properties/${propertyId}/calendar-management`],
    ["Availability", `/owner/properties/${propertyId}/availability-rules`],
    ["Pricing", `/owner/properties/${propertyId}/seasonal-pricing`],
    ["Publish", `/owner/properties/${propertyId}/publish`],
  ] as const;

  return (
    <nav className="flex flex-wrap gap-2">
      {tabs.map(([label, href]) => (
        <Link
          key={label}
          href={href}
          className="owner-button-text rounded-lg border border-[#d9e0ea] bg-white px-4 py-2 text-[#26344f]"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function OwnerStatusBadge({
  statusGroup,
  statusLabel,
}: {
  statusGroup: OwnerPropertyStatusGroup;
  statusLabel: string;
}) {
  const tones: Record<OwnerPropertyStatusGroup, string> = {
    approved: "bg-[#eaf8ed] text-[#156b37]",
    archived: "bg-[#eef2f7] text-[#405166]",
    draft: "bg-[#f5f0ff] text-[#5f31d8]",
    pending_review: "bg-[#fff3d7] text-[#996200]",
    published: "bg-[#eaf8ed] text-[#156b37]",
    rejected: "bg-[#fff0f0] text-[#af3030]",
    suspended: "bg-[#fde6e6] text-[#a03b3b]",
  };

  return (
    <span className={`owner-badge inline-flex rounded-full px-3 py-1 ${tones[statusGroup]}`}>
      {statusLabel}
    </span>
  );
}

export function OwnerPropertySummaryCard({
  extra,
  summary,
}: {
  extra?: ReactNode;
  summary: OwnerPropertySummary;
}) {
  return (
    <section className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="owner-section-title">{summary.title}</h2>
            <OwnerStatusBadge
              statusGroup={summary.statusGroup}
              statusLabel={summary.statusLabel}
            />
          </div>
          <p className="owner-body mt-2">{summary.locationLabel}</p>
          <p className="owner-helper mt-2 text-slate-500">
            {summary.bedroomsCount} bedrooms · {summary.bathroomsCount} bathrooms · {summary.maxGuests} guests
          </p>
        </div>
        <div className="text-right">
          <p className="owner-card-title">{formatCurrencyFromMinor(summary.pricePerNight * 100)}</p>
          <p className="owner-helper text-slate-500">per night</p>
        </div>
      </div>
      {summary.description ? (
        <p className="owner-body mt-4 rounded-lg bg-[#f7f9fc] p-4">{summary.description}</p>
      ) : null}
      {extra ? <div className="mt-4">{extra}</div> : null}
    </section>
  );
}

export function OwnerInfoGrid({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-xl border border-[#e6ebf2] bg-white p-4 shadow-sm"
        >
          <p className="owner-helper text-slate-500">{item.label}</p>
          <div className="owner-card-title mt-2">{item.value}</div>
        </article>
      ))}
    </section>
  );
}

export function OwnerDeferredNotice({
  children,
  title = "Deferred in this phase",
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <section className="rounded-xl border border-[#eadcb0] bg-[#fff9ea] p-4 text-[#6b5210] shadow-sm">
      <p className="owner-card-title">{title}</p>
      <div className="owner-body mt-2">{children}</div>
    </section>
  );
}

export function OwnerAvailabilityTable({
  rows,
}: {
  rows: OwnerAvailabilityViewModel[];
}) {
  if (!rows.length) {
    return (
      <section className="rounded-xl border border-dashed border-[#d7dfea] bg-white p-5 text-slate-500">
        No availability rows yet.
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <article key={row.id} className="rounded-xl border border-[#e6ebf2] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="owner-card-title">{row.date}</p>
              <p className="owner-helper mt-1 text-slate-500">
                {row.status} · {row.reason ?? "no reason"} · {row.isManual ? "manual" : "booking-generated"}
              </p>
            </div>
            {row.bookingId ? (
              <span className="owner-badge rounded-full bg-[#eef2f7] px-3 py-1 text-[#405166]">
                Read-only booking row
              </span>
            ) : null}
          </div>
          {row.note ? <p className="owner-body mt-3">{row.note}</p> : null}
        </article>
      ))}
    </div>
  );
}

export function OwnerPricingTable({
  rows,
}: {
  rows: OwnerPricingRuleViewModel[];
}) {
  if (!rows.length) {
    return (
      <section className="rounded-xl border border-dashed border-[#d7dfea] bg-white p-5 text-slate-500">
        No pricing rules yet.
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <article key={row.id} className="rounded-xl border border-[#e6ebf2] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="owner-card-title">{row.label}</p>
              <p className="owner-helper mt-1 text-slate-500">
                {row.ruleType} · {row.startsOn} to {row.endsOn} · priority {row.priority}
              </p>
            </div>
            <span className={`owner-badge rounded-full px-3 py-1 ${row.isActive ? "bg-[#eaf8ed] text-[#156b37]" : "bg-[#eef2f7] text-[#405166]"}`}>
              {row.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
