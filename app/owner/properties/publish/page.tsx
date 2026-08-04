"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/host-landing/icons";
import { DarLogo } from "@/components/brand/dar-logo";
const photos = ["publish-thumb-1-reference.png", "publish-thumb-2-reference.png", "publish-thumb-3-reference.png"];
const checklist = ["Basic information", "Location", "Amenities", "Pricing & availability", "Photos", "House rules", "Policies"];
type PreviewProperty = { title:string; location:string; bedrooms:string; bathrooms:string; guests:string };
const defaultPreview:PreviewProperty={title:"Modern Apartment in Zamalek",location:"Zamalek, Cairo, Egypt",bedrooms:"2",bathrooms:"2",guests:"4"};

export default function PublishPropertyPage() {
  const router = useRouter();
  const [preference, setPreference] = useState<"now" | "later">("now");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [property,setProperty]=useState<PreviewProperty>(defaultPreview);
  useEffect(()=>{let active=true;queueMicrotask(()=>{if(!active)return;try{const saved=localStorage.getItem("dar-owner-property:1");if(saved)setProperty({...defaultPreview,...JSON.parse(saved)});}catch{}});return()=>{active=false}},[]);

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
    <main className="min-h-screen bg-[#fafbfe] text-[#11183b]">
      <div className="owner-dashboard-frame overflow-hidden">
        <Sidebar />
        <section className="owner-dashboard-main">
          <DesktopTopbar />
          <MobileTopbar />
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
        </section>
      </div>
      <MobileNav />
      {toast ? <div role="status" className={`owner-body fixed right-5 top-5 z-[60] rounded-lg px-4 py-3 text-white shadow-xl ${toast.type === "success" ? "bg-[#159a51]" : "bg-[#d14343]"}`}>{toast.message}</div> : null}
      {scheduleOpen ? <ScheduleDialog onClose={() => setScheduleOpen(false)} onConfirm={() => { window.localStorage.setItem("dar-property-scheduled", "true"); router.push("/owner/properties"); }} /> : null}
    </main>
  );
}

function Sidebar() {
  const main = [["Dashboard", "dashboard"], ["Properties", "properties"], ["Bookings", "bookings"], ["Messages", "messages"], ["Reviews", "reviews"], ["Payouts", "payouts"], ["Profile settings", "settings"]] as const;
  return <aside className="w-[205px] shrink-0 border-r border-[#eff1f7] px-[18px] py-[16px] max-[760px]:hidden">
    <DarLogo surface="light" alt="DAR Find Your Perfect Stay" width={610} height={260} className="h-auto w-[105px] object-contain object-left" priority />
    <nav className="owner-body mt-[18px] text-[#505a82]">{main.map(([label, icon], i) => <div key={label}>
      <Link href={label === "Bookings" ? "/owner/bookings/request-decision" : "/owner/properties"} className={`owner-button-text flex h-[38px] items-center gap-[13px] rounded-lg px-[8px] ${i === 1 ? "font-bold text-[#242b54]" : "font-medium"}`}><SidebarIcon name={icon} />{label}{label === "Properties" ? <SidebarIcon name="chevron" className="ml-auto size-[13px]" /> : null}{label === "Messages" ? <b className="owner-label ml-auto grid size-[17px] place-items-center rounded-[4px] bg-[#5824e6] text-white">2</b> : null}</Link>
      {i === 1 ? <div className="ml-[41px] space-y-[2px]"><Link className="owner-body block py-[8px]" href="/owner/properties">My properties</Link><Link className="owner-body block py-[8px]" href="/add-property">Add new property</Link><Link className="owner-body flex py-[8px]" href="/owner/properties/drafts">Drafts <b className="owner-label ml-auto mr-[3px] grid size-[17px] place-items-center rounded-[4px] border border-[#8e6aff]">4</b></Link></div> : null}
    </div>)}</nav>
    <div className="owner-body mt-[25px] h-[194px] overflow-hidden rounded-[8px] bg-[#f6f1ff] px-[14px] pt-[14px]"><b className="owner-label">List more, earn more</b><p className="owner-body mt-[4px]">Complete your property and<br />start welcoming guests.</p><Link href="/add-property" className="owner-button-text mt-[10px] grid h-[34px] place-items-center rounded-[5px] border border-[#9c7cff] bg-white">Finish property</Link><div className="relative mx-auto mt-[4px] h-[69px] w-[132px]"><Image src="/finish-property-illustration.png" alt="" fill sizes="132px" className="object-contain" /></div></div>
    <div className="owner-body mt-[28px] h-[119px] rounded-[8px] bg-[#fbfbfe] px-[14px] pt-[14px]"><b>Need help?</b><p className="owner-body mt-[3px]">Our support team is here<br />24/7 to help you.</p><button className="owner-button-text mt-[9px] flex h-[34px] w-full items-center justify-center gap-[8px] rounded-[5px] border border-[#9c7cff]"><SidebarIcon name="support" className="size-[15px]" />Contact support</button></div>
  </aside>;
}

function SidebarIcon({ name, className = "size-[17px]" }: { name: "dashboard" | "properties" | "bookings" | "messages" | "reviews" | "payouts" | "settings" | "support" | "chevron"; className?: string }) {
  return <svg aria-hidden="true" className={`shrink-0 text-[#626c9b] ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {name === "dashboard" && <><path d="m4 11 8-7 8 7"/><path d="M6.5 9.5V20h11V9.5"/><path d="M9.5 20v-6h5v6"/></>}
    {name === "properties" && <><path d="m3.5 10.5 8.5-7 8.5 7"/><path d="M5.5 9v11h13V9"/><path d="M8 20v-8h8v8"/><path d="M10 12V9h4v3"/></>}
    {name === "bookings" && <><rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17"/><path d="M7 14h3M7 17h3"/></>}
    {name === "messages" && <path d="M4 5.5h16v11H9l-5 3v-14Z"/>}
    {name === "reviews" && <path d="m12 3.5 2.55 5.16 5.7.83-4.13 4.02.98 5.68L12 17.5l-5.1 2.69.98-5.68-4.13-4.02 5.7-.83L12 3.5Z"/>}
    {name === "payouts" && <><rect x="3.5" y="6" width="17" height="13" rx="2"/><path d="M3.5 10h17M7 15h3"/></>}
    {name === "settings" && <><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7a7 7 0 0 0-.7-1.7l.9-1.9-2.1-2.1-1.9.9a7 7 0 0 0-1.7-.7L10.5 2h-3l-.7 2a7 7 0 0 0-1.7.7l-1.9-.9-2.1 2.1.9 1.9a7 7 0 0 0-.7 1.7L0 10.5v3l2 .7c.16.6.4 1.17.7 1.7l-.9 1.9 2.1 2.1 1.9-.9c.53.3 1.1.54 1.7.7l.7 2h3l.7-2c.6-.16 1.17-.4 1.7-.7l1.9.9 2.1-2.1-.9-1.9c.3-.53.54-1.1.7-1.7l2-.7Z" transform="translate(2.5 0) scale(.78)"/></>}
    {name === "support" && <><path d="M5 13v-2a7 7 0 0 1 14 0v2"/><path d="M5 12H3.5A1.5 1.5 0 0 0 2 13.5v3A1.5 1.5 0 0 0 3.5 18H6v-6H5ZM19 12h1.5a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H18v-6h1ZM18 18c0 2-1.5 3-4 3h-1"/><circle cx="11.5" cy="21" r="1"/></>}
    {name === "chevron" && <path d="m8 10 4 4 4-4"/>}
  </svg>;
}

function DesktopTopbar() { return <header className="flex h-[62px] items-center justify-end border-b border-[#f0f1f6] pr-[29px] max-[760px]:hidden"><div className="flex h-full items-center text-[#11183b]"><span className="owner-body relative grid size-[22px] place-items-center"><Icon name="bell" className="size-[19px]" strokeWidth="1.8" /><b className="owner-label absolute -right-[3px] -top-[5px] grid size-[15px] place-items-center rounded-full bg-[#ef3945] text-white">3</b></span><Image src="/publish-avatar-ahmed-reference.svg" alt="Ahmed H." width={32} height={32} className="ml-[23px] size-[32px] rounded-full object-cover" /><span className="owner-body ml-[10px]">Ahmed H.</span><Icon name="chevron" className="ml-[9px] size-[12px]" strokeWidth="1.8" /></div></header>; }
function MobileTopbar() { return <header className="hidden h-[72px] items-center justify-between border-b border-[#eef0f6] px-5 max-[760px]:flex"><Icon name="menu" className="size-[19px]"/><DarLogo surface="light" alt="DAR" width={82} height={30} className="h-auto w-[82px] object-contain" priority /><span className="owner-body relative"><Icon name="bell" className="size-[19px]"/><b className="owner-label absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-[#ef3945] text-white">3</b></span></header>; }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-[10px] border border-[#edf0f6] bg-white shadow-[0_8px_24px_rgba(28,31,65,.035)] ${className}`}>{children}</section>; }

function PropertySummary({property}:{property:PreviewProperty}) { return <Card className="flex min-h-[172px] gap-[20px] p-[14px] max-[760px]:gap-3 max-[760px]:p-3">
  <div className="relative h-[119px] w-[170px] shrink-0 overflow-hidden rounded-[7px] max-[760px]:h-[105px] max-[760px]:w-[122px]"><Image src="/publish-summary-reference.png" alt="Apartment living room" fill className="object-cover object-center" sizes="170px" /></div>
  <div className="flex min-w-0 flex-1 flex-col"><h2 className="owner-section-title">{property.title}</h2><p className="owner-body mt-[9px] flex items-center gap-[6px]"><PropertyIcon name="location" className="size-[14px]" />{property.location}</p><div className="owner-body mt-[21px] flex flex-wrap gap-x-[24px] gap-y-2 text-[#4f597b] max-[760px]:mt-2 max-[760px]:gap-x-4"><Detail icon="bed">{property.bedrooms} Beds</Detail><Detail icon="bath">{property.bathrooms} Baths</Detail><Detail icon="guests">{property.guests} Guests</Detail><Detail icon="area">120 m²</Detail></div><p className="owner-body mt-[16px] max-[760px]:hidden">Last updated: 18 May 2025, 10:30 AM</p><Link href="/owner/properties/1/edit?tab=basic" className="owner-button-text mt-auto ml-auto flex h-[34px] min-w-[126px] items-center justify-center gap-[8px] rounded-[5px] border border-[#8a61ff] max-[760px]:mt-3 max-[760px]:w-full">Edit property <PropertyIcon name="edit" className="size-[14px]" /></Link></div>
  </Card>; }

function ListingPreview({property}:{property:PreviewProperty}) { return <Card className="p-[14px] max-[760px]:hidden"><h2 className="owner-section-title">Preview your listing</h2><div className="mt-[11px] grid h-[181px] grid-cols-[minmax(0,1fr)_93px] gap-[10px]"><div className="relative overflow-hidden rounded-[7px]"><Image src="/publish-preview-reference.png" alt="Apartment listing preview" fill className="object-cover object-center" sizes="520px" /><span className="owner-badge absolute left-[7px] top-[7px] rounded-[4px] bg-[#5824e6] px-[9px] py-[4px] text-white">Preview</span></div><div className="grid grid-rows-3 gap-[6px]">{photos.map((p, i) => <div className="relative overflow-hidden rounded-[6px]" key={p}><Image src={`/${p}`} alt="" fill className="object-cover object-center" sizes="93px" />{i === 2 ? <span className="owner-body absolute inset-0 grid place-items-center bg-black/40 text-white">+12</span> : null}</div>)}</div></div><div className="mt-[10px] flex items-end justify-between"><div><h3 className="owner-card-title">{property.title}</h3><p className="owner-body mt-[5px] flex items-center gap-[5px]"><PropertyIcon name="location" className="size-[12px]" />{property.location}</p><div className="owner-body mt-[11px] flex gap-[22px] text-[#4f597b]"><Detail icon="bed">{property.bedrooms} Beds</Detail><Detail icon="bath">{property.bathrooms} Baths</Detail><Detail icon="guests">{property.guests} Guests</Detail><Detail icon="area">120 m²</Detail></div></div><div className="pb-[1px] text-right"><b className="owner-label">EGP 2,500</b><span className="owner-body"> / night</span><p className="owner-body mt-[8px] flex items-center justify-end gap-[4px]"><PropertyIcon name="star" className="size-[13px] fill-current" />4.8 <span className="owner-body">(120 reviews)</span></p></div></div></Card>; }

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

function MobileNav() { return <nav className="owner-body fixed inset-x-0 bottom-0 z-30 hidden h-[72px] items-center justify-around border-t border-[#eceef5] bg-white text-center text-[#566080] max-[760px]:flex"><span><Icon name="home" className="mx-auto size-[18px]"/><small className="owner-helper mt-1 block">Dashboard</small></span><Link href="/owner/bookings/request-decision"><Icon name="calendar" className="mx-auto size-[18px]"/><small className="owner-helper mt-1 block">Bookings</small></Link><Link href="/add-property" className="owner-button-text grid size-11 place-items-center rounded-full bg-[#5824e6] text-white">+</Link><span><Icon name="message" className="mx-auto size-[18px]"/><small className="owner-helper mt-1 block">Messages</small></span><span><Icon name="user-plain" className="mx-auto size-[18px]"/><small className="owner-helper mt-1 block">Profile</small></span></nav>; }
function ScheduleDialog({ onClose, onConfirm }: { onClose:()=>void; onConfirm:()=>void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-[#11152d]/35 p-4" onMouseDown={onClose}><div className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-2xl" onMouseDown={e=>e.stopPropagation()}><div className="flex justify-between"><h2 className="owner-section-title">Schedule publication</h2><button onClick={onClose} aria-label="Close"><Icon name="x" className="size-[16px]"/></button></div><p className="owner-body mt-2">Choose when your property should go live.</p><label className="owner-label mt-5 block">Publish date and time<input type="datetime-local" className="owner-input-text mt-2 h-11 w-full rounded-md border border-[#dce1ec] px-3" /></label><div className="mt-6 flex gap-3"><button onClick={onClose} className="owner-button-text h-10 flex-1 rounded-md border border-[#a183fa]">Cancel</button><button onClick={onConfirm} className="owner-button-text h-10 flex-1 rounded-md bg-[#5824e6] text-white">Schedule</button></div></div></div>; }
