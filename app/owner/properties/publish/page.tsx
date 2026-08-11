"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/host-landing/icons";
import { DarLogo } from "@/components/brand/dar-logo";
import { useOwnerPropertyDraft } from "@/lib/owner-property-draft";
const photos = ["publish-thumb-1-reference.png", "publish-thumb-2-reference.png", "publish-thumb-3-reference.png"];
const checklist = ["Basic information", "Location", "Amenities", "Pricing & availability", "Photos", "House rules", "Policies"];
type PreviewProperty = { title:string; location:string; bedrooms:string; bathrooms:string; guests:string; size:string; nightlyPrice:string };

export default function PublishPropertyPage() {
  const router = useRouter();
  const draft = useOwnerPropertyDraft();
  const [preference, setPreference] = useState<"now" | "later">("now");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const property: PreviewProperty = { title: draft.title || "Untitled property", location: draft.address || [draft.neighborhood, draft.city].filter(Boolean).join(", "), bedrooms: draft.bedrooms, bathrooms: draft.bathrooms, guests: draft.guests, size: draft.size, nightlyPrice: draft.nightlyPrice };

  async function publish() {
    if (isPublishing) return;
    const verification = window.localStorage.getItem("dar-owner-verification");
    if (!verification || !(JSON.parse(verification) as { submitted?: boolean }).submitted) {
      router.push("/owner/verification?returnTo=/owner/properties/1/publish");
      return;
    }
    setIsPublishing(true);
    setToast(null);
    const propertyId = window.localStorage.getItem("dar-owner-property-id") ?? "modern-apartment-zamalek";

    try {
      const response = await fetch(`/api/owner/properties/${encodeURIComponent(propertyId)}/submit`, { method: "POST" });
      if (!response.ok) throw new Error("Submission failed");
      const property = await response.json() as { id: string; status: "pending_review" };
      window.localStorage.setItem("dar-owner-property-id", property.id);
      window.localStorage.setItem(`dar-owner-property-status:${property.id}`, property.status);
      setToast({ type: "success", message: "Your property has been submitted for review." });
      window.setTimeout(() => router.push(`/owner/properties/${property.id}`), 900);
    } catch {
      setToast({ type: "error", message: "We couldn't submit your property. Please try again." });
      setIsPublishing(false);
    }
  }

  function save() {
    window.localStorage.setItem("dar-property-publish-preference", preference);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="min-h-screen bg-[#fafbfe] text-[#11183b]">
          <div className="owner-dashboard-content max-[760px]:pb-24">
            <Link href="/owner/properties/drafts" className="owner-body inline-flex items-center gap-2"><Icon name="arrow-left" className="size-[14px]"/>Back to drafts</Link>
            <div className="mt-4">
              <h1 className="owner-page-title tracking-[-.02em]">Publish property</h1>
              <p className="owner-page-description mt-1 max-[760px]:max-w-[285px]">Review your property and publish it to start receiving bookings.</p>
            </div>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_250px] gap-5 max-[960px]:grid-cols-1">
              <div className="min-w-0 space-y-4">
                <PropertySummary property={property} />
                <ListingPreview property={property} />
                <Preference value={preference} onChange={(value) => { setPreference(value); if (value === "later") setScheduleOpen(true); }} />
                <SafetyBar saved={saved} isPublishing={isPublishing} onSave={save} onPublish={() => preference === "later" ? setScheduleOpen(true) : publish()} />
              </div>
              <aside className="space-y-4">
                <Checklist isPublishing={isPublishing} onPublish={publish} onSchedule={() => setScheduleOpen(true)} />
                <NextCard />
              </aside>
            </div>
          </div>
      {toast ? <div role="status" className={`owner-body fixed right-5 top-5 z-[60] rounded-lg px-4 py-3 text-white shadow-xl ${toast.type === "success" ? "bg-[#159a51]" : "bg-[#d14343]"}`}>{toast.message}</div> : null}
      {scheduleOpen ? <ScheduleDialog onClose={() => setScheduleOpen(false)} onConfirm={() => { window.localStorage.setItem("dar-property-scheduled", "true"); router.push("/owner/properties"); }} /> : null}
    </div>
  );
}


function DesktopTopbar() { return <header className="flex h-[62px] items-center justify-end border-b border-[#f0f1f6] pr-[29px] max-[760px]:hidden"><div className="flex h-full items-center text-[#11183b]"><span className="owner-body relative grid size-[22px] place-items-center"><Icon name="bell" className="size-[19px]" strokeWidth="1.8" /><b className="owner-label absolute -right-[3px] -top-[5px] grid size-[15px] place-items-center rounded-full bg-[#ef3945] text-white">3</b></span><Image src="/publish-avatar-ahmed-reference.svg" alt="Ahmed H." width={32} height={32} className="ml-[23px] size-[32px] rounded-full object-cover" /><span className="owner-body ml-[10px]">Ahmed H.</span><Icon name="chevron" className="ml-[9px] size-[12px]" strokeWidth="1.8" /></div></header>; }
function MobileTopbar() { return <header className="hidden h-[72px] items-center justify-between border-b border-[#eef0f6] px-5 max-[760px]:flex"><Icon name="menu" className="size-[19px]"/><DarLogo surface="light" alt="DAR" width={82} height={30} className="h-auto w-[82px] object-contain" priority /><span className="owner-body relative"><Icon name="bell" className="size-[19px]"/><b className="owner-label absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-[#ef3945] text-white">3</b></span></header>; }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-[10px] border border-[#edf0f6] bg-white shadow-[0_8px_24px_rgba(28,31,65,.035)] ${className}`}>{children}</section>; }

function PropertySummary({property}:{property:PreviewProperty}) { return <Card className="flex min-h-[172px] gap-[20px] p-[14px] max-[760px]:gap-3 max-[760px]:p-3">
  <div className="relative h-[119px] w-[170px] shrink-0 overflow-hidden rounded-[7px] max-[760px]:h-[105px] max-[760px]:w-[122px]"><Image src="/publish-summary-reference.png" alt="Apartment living room" fill className="object-cover object-center" sizes="170px" /></div>
  <div className="flex min-w-0 flex-1 flex-col"><h2 className="owner-section-title">{property.title}</h2><p className="owner-body mt-[9px] flex items-center gap-[6px]"><PropertyIcon name="location" className="size-[14px]" />{property.location}</p><div className="owner-body mt-[21px] flex flex-wrap gap-x-[24px] gap-y-2 text-[#4f597b] max-[760px]:mt-2 max-[760px]:gap-x-4"><Detail icon="bed">{property.bedrooms} Beds</Detail><Detail icon="bath">{property.bathrooms} Baths</Detail><Detail icon="guests">{property.guests} Guests</Detail><Detail icon="area">{property.size} m²</Detail></div><p className="owner-body mt-[16px] max-[760px]:hidden">Saved locally for Owner review</p><Link href="/owner/properties/new/details" className="owner-button-text mt-auto ml-auto flex h-[34px] min-w-[126px] items-center justify-center gap-[8px] rounded-[5px] border border-[#8a61ff] max-[760px]:mt-3 max-[760px]:w-full">Edit property <PropertyIcon name="edit" className="size-[14px]" /></Link></div>
  </Card>; }

function ListingPreview({property}:{property:PreviewProperty}) { return <Card className="p-[14px] max-[760px]:hidden"><h2 className="owner-section-title">Preview your listing</h2><div className="mt-[11px] grid h-[181px] grid-cols-[minmax(0,1fr)_93px] gap-[10px]"><div className="relative overflow-hidden rounded-[7px]"><Image src="/publish-preview-reference.png" alt="Apartment listing preview" fill className="object-cover object-center" sizes="520px" /><span className="owner-badge absolute left-[7px] top-[7px] rounded-[4px] bg-[#5824e6] px-[9px] py-[4px] text-white">Preview</span></div><div className="grid grid-rows-3 gap-[6px]">{photos.map((p, i) => <div className="relative overflow-hidden rounded-[6px]" key={p}><Image src={`/${p}`} alt="" fill className="object-cover object-center" sizes="93px" />{i === 2 ? <span className="owner-body absolute inset-0 grid place-items-center bg-black/40 text-white">+12</span> : null}</div>)}</div></div><div className="mt-[10px] flex items-end justify-between"><div><h3 className="owner-card-title">{property.title}</h3><p className="owner-body mt-[5px] flex items-center gap-[5px]"><PropertyIcon name="location" className="size-[12px]" />{property.location}</p><div className="owner-body mt-[11px] flex gap-[22px] text-[#4f597b]"><Detail icon="bed">{property.bedrooms} Beds</Detail><Detail icon="bath">{property.bathrooms} Baths</Detail><Detail icon="guests">{property.guests} Guests</Detail><Detail icon="area">{property.size} m²</Detail></div></div><div className="pb-[1px] text-right"><b className="owner-label">EGP {Number(property.nightlyPrice || 0).toLocaleString()}</b><span className="owner-body"> / night</span><p className="owner-body mt-[8px] flex items-center justify-end gap-[4px]"><PropertyIcon name="star" className="size-[13px] fill-current" />New listing</p></div></div></Card>; }

function Preference({ value, onChange }: { value: "now" | "later"; onChange: (v: "now" | "later") => void }) { return <Card className="p-[12px] max-[760px]:hidden"><h2 className="owner-section-title">Set your publish preference</h2><div className="mt-[10px] grid grid-cols-2 gap-[10px]"><Choice active={value === "now"} onClick={() => onChange("now")} icon="publish" title="Publish now" note="Your property will go live immediately."/><Choice active={value === "later"} onClick={() => onChange("later")} icon="calendar" title="Schedule for later" note="Choose a date and time to publish."/></div></Card>; }
function Choice({ active, onClick, icon, title, note }: { active:boolean; onClick:()=>void; icon:"publish"|"calendar"; title:string; note:string }) { return <button onClick={onClick} className={`owner-button-text flex h-[66px] items-center gap-[12px] rounded-[6px] border px-[12px] text-left ${active ? "border-[#8d68ff] bg-[#fbf9ff]" : "border-[#e7eaf2] bg-white"}`}><span className={`owner-badge size-[15px] shrink-0 rounded-full border-[1.5px] ${active ? "border-[#6938f0] bg-[#6938f0] shadow-[inset_0_0_0_3.5px_white]" : "border-[#aeb9d0]"}`} /><span className="owner-badge grid size-[32px] shrink-0 place-items-center rounded-full bg-[#f1ecff]"><PropertyIcon name={icon} className="size-[16px]" /></span><span><b className="owner-button-text block">{title}</b><small className="owner-helper mt-[5px] block">{note}</small></span></button>; }

function Detail({ icon, children }: { icon: "bed" | "bath" | "guests" | "area"; children: React.ReactNode }) { return <span className="owner-body flex items-center gap-[6px] whitespace-nowrap"><PropertyIcon name={icon} className="size-[15px]" />{children}</span>; }

function PropertyIcon({ name, className = "size-4" }: { name: "bed" | "bath" | "guests" | "area" | "location" | "edit" | "star" | "publish" | "calendar"; className?: string }) {
  return <svg aria-hidden="true" className={`shrink-0 text-[#525c91] ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {name === "bed" && <><path d="M3 18v-8M21 18v-5.5a2 2 0 0 0-2-2H9.5A2.5 2.5 0 0 0 7 13v2"/><path d="M3 15h18M6.5 10.5v-2h4v2"/></>}
    {name === "bath" && <><path d="M3 13h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2Z"/><path d="M6 13V7a3 3 0 0 1 5.6-1.5M8 20v2M17 20v2"/></>}
    {name === "guests" && <><circle cx="12" cy="7" r="3"/><path d="M5 20v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2H5Z"/></>}
    {name === "area" && <><path d="M4 10V4h6M14 20h6v-6M4 4l7 7M20 20l-7-7"/></>}
    {name === "location" && <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>}
    {name === "edit" && <><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m14 7 3 3"/></>}
    {name === "star" && <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>}
    {name === "publish" && <><path d="M7 9V7a5 5 0 0 1 10 0v2"/><path d="M5 9h14l1 12H4L5 9Z"/><path d="m12 16 3-3M12 16l-3-3M12 16v-6"/></>}
    {name === "calendar" && <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M8 14h3M13 14h3M8 17h3"/></>}
  </svg>;
}

function Checklist({ isPublishing, onPublish, onSchedule }: { isPublishing:boolean; onPublish:()=>void; onSchedule:()=>void }) {
  return <Card className="min-h-[430px] p-[16px]">
    <h2 className="owner-section-title">Publishing checklist</h2>
    <p className="owner-body mt-[6px]">Make sure everything is ready to go live.</p>
    <div className="mt-[17px] space-y-[12px]">
      {checklist.map(item => <div className="flex items-start gap-[10px]" key={item}>
        <span className="owner-badge mt-[1px] grid size-[14px] shrink-0 place-items-center rounded-full bg-[#16a75a] text-white"><Icon name="check" className="size-[9px]" strokeWidth="2.5" /></span>
        <div className="owner-body"><p className="owner-body">{item}</p><p className="owner-body mt-[5px]">Completed</p></div>
      </div>)}
    </div>
    <div className="owner-body mt-[18px] flex min-h-[62px] gap-[10px] rounded-[7px] border border-[#dcefe5] bg-[#f1faf6] px-[11px] py-[10px]">
      <span className="owner-badge grid size-[23px] shrink-0 place-items-center rounded-full bg-[#ddf4e8]"><Icon name="check" className="size-[13px]" strokeWidth="2.4" /></span>
      <div><b className="owner-label">Great job!</b><p className="owner-body mt-[6px]">Your property is ready to be<br />published.</p></div>
    </div>
    <div className="mt-4 hidden space-y-2 max-[760px]:block"><button disabled={isPublishing} onClick={onPublish} className="owner-button-text flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#5824e6] text-white shadow-[0_8px_18px_rgba(88,36,230,.22)] disabled:cursor-wait disabled:opacity-70">{isPublishing ? <><span className="owner-body size-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />Submitting...</> : <><Icon name="navigation" className="size-[13px]"/>Publish now</>}</button><button disabled={isPublishing} onClick={onSchedule} className="owner-button-text flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#8a61ff] disabled:opacity-50"><Icon name="calendar" className="size-[14px]"/>Schedule for later</button></div>
  </Card>;
}

function NextCard() {
  const items = [
    ["navigation", "Your listing will be live instantly", "Travelers will be able to find and book your property."],
    ["briefcase", "Bookings & notifications", "You will receive booking requests and messages."],
    ["calendar", "You are in control", "You can update your listing or calendar anytime."],
  ] as const;
  return <Card className="min-h-[190px] p-[15px] max-[760px]:hidden">
    <h2 className="owner-section-title">What happens next?</h2>
    <div className="mt-[14px] space-y-[16px]">{items.map(([icon,title,note]) => <div className="flex items-start gap-[10px]" key={title}>
      <span className="owner-badge grid size-[24px] shrink-0 place-items-center rounded-full bg-[#f0ebff]"><Icon name={icon} className="size-[13px]" strokeWidth="1.8" /></span>
      <div className="pt-[1px]"><b className="owner-label block">{title}</b><p className="owner-body mt-[4px]">{note}</p></div>
    </div>)}</div>
  </Card>;
}
function SafetyBar({ saved, isPublishing, onSave, onPublish }: { saved:boolean; isPublishing:boolean; onSave:()=>void; onPublish:()=>void }) {
  return <div className="flex h-[66px] items-center rounded-[8px] bg-[#f8f5ff] px-[12px] max-[760px]:hidden">
    <span className="owner-badge grid size-[40px] shrink-0 place-items-center rounded-full bg-[#e9e0ff]"><Icon name="shield" className="size-[22px]" strokeWidth="1.8" /></span>
    <div className="ml-[12px] mr-auto flex h-full flex-col justify-center">
      <b className="owner-label">{"We've got your back"}</b>
      <p className="owner-body mt-[5px]">All listings are reviewed to ensure a safe and trusted experience for our community.</p>
    </div>
    <div className="ml-[18px] flex items-center gap-[12px]">
      <button disabled={isPublishing} onClick={onSave} className="owner-button-text h-[34px] w-[110px] rounded-[5px] border border-[#9d7cff] bg-white disabled:opacity-50">{saved ? <>Saved <Icon name="check" className="ml-1 inline size-[12px]"/></> : "Save changes"}</button>
      <button disabled={isPublishing} onClick={onPublish} className="owner-button-text flex h-[34px] w-[126px] items-center justify-center gap-[7px] rounded-[5px] bg-[#5824e6] text-white shadow-[0_5px_12px_rgba(88,36,230,.16)] disabled:cursor-wait disabled:opacity-70">{isPublishing ? <><span className="owner-body size-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />Submitting...</> : <>Publish now <Icon name="navigation" className="size-[13px]" strokeWidth="1.8" /></>}</button>
    </div>
  </div>;
}

function ScheduleDialog({ onClose, onConfirm }: { onClose:()=>void; onConfirm:()=>void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-[#11152d]/35 p-4" onMouseDown={onClose}><div className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-2xl" onMouseDown={e=>e.stopPropagation()}><div className="flex justify-between"><h2 className="owner-section-title">Schedule publication</h2><button onClick={onClose} aria-label="Close"><Icon name="x" className="size-[16px]"/></button></div><p className="owner-body mt-2">Choose when your property should go live.</p><label className="owner-label mt-5 block">Publish date and time<input type="datetime-local" className="owner-input-text mt-2 h-11 w-full rounded-md border border-[#dce1ec] px-3" /></label><div className="mt-6 flex gap-3"><button onClick={onClose} className="owner-button-text h-10 flex-1 rounded-md border border-[#a183fa]">Cancel</button><button onClick={onConfirm} className="owner-button-text h-10 flex-1 rounded-md bg-[#5824e6] text-white">Schedule</button></div></div></div>; }
