"use client";

import Link from "next/link";
import { useOwnerPropertyDraft } from "@/lib/owner-property-draft";
import { ensurePropertyCalendar, useOwnerCalendar } from "@/lib/owner-calendar";

export default function OwnerPropertiesPage() {
  const draft = useOwnerPropertyDraft();
  const calendars = useOwnerCalendar();
  const propertyCalendar = ensurePropertyCalendar(calendars, "1");
  const showDraft = Boolean(draft.updatedAt || draft.status === "pending_review");
  return <div className="owner-dashboard-content">
    <div className="flex items-center justify-between gap-4 max-[600px]:items-start"><div><h1 className="owner-page-title">My Properties</h1><p className="owner-page-description mt-2">Manage your listings and review their current status.</p></div><Link href="/owner/properties/new/details" className="owner-button-text shrink-0 rounded-lg bg-[#5824e6] px-5 py-3 text-white">Add Property</Link></div>
    {showDraft ? <article className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"><div className="flex items-center justify-between gap-4"><div><h2 className="owner-section-title">{draft.title || "Untitled property"}</h2><p className="owner-body mt-1">{[draft.neighborhood,draft.city].filter(Boolean).join(", ")}</p></div><span className={`owner-badge rounded-full px-3 py-1 ${draft.status === "pending_review" ? "bg-warning/10 text-warning" : "bg-[var(--brand-soft)] text-[var(--brand)]"}`}>{draft.status === "pending_review" ? "Pending Review" : "Draft"}</span></div><div className="mt-5 flex flex-wrap gap-3"><Link href="/owner/properties/new/details" className="owner-button-text rounded-lg border border-[var(--brand)] px-4 py-2">Edit property</Link>{draft.status === "pending_review" ? <Link href="/owner/properties/publish" className="owner-button-text rounded-lg bg-[var(--brand)] px-4 py-2 text-white">View review</Link> : null}</div></article> : null}
    <article className="mt-5 rounded-xl border border-[#f0d9db] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="owner-section-title">Modern Apartment in Zamalek</h2><p className="owner-body mt-1">Zamalek, Cairo, Egypt · {Object.values(propertyCalendar.dates).filter((date) => date.state === "blocked" || date.state === "unavailable").length} blocked dates</p></div><span className="owner-badge rounded-full bg-[#fff0f0] px-3 py-1">Rejected</span></div><div className="mt-5 flex flex-wrap gap-3"><Link href="/owner/properties/1/rejected" className="owner-button-text rounded-lg border border-[#9d7cff] px-4 py-2">View rejection reasons</Link><Link href="/owner/properties/1/rejected" className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">Make changes</Link><Link href="/owner/properties/1/calendar-management" className="owner-button-text rounded-lg border border-[#9d7cff] px-4 py-2">Manage calendar</Link></div></article>
  </div>;
}
