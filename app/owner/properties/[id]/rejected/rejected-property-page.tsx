"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/host-landing/icons";
import { DarLogo } from "@/components/brand/dar-logo";

const nav = [["Dashboard","dashboard"],["Properties","properties"],["Bookings","bookings"],["Calendar","calendar"],["Messages","messages"],["Reviews","reviews"],["Payouts","payouts"],["Analytics","analytics"],["Settings","settings"]] as const;

export default function RejectedPropertyPage({ id }: { id: string }) {
  const router = useRouter();
  async function resubmit() {
    window.localStorage.setItem(`dar-owner-property-status:${id}`, "pending_review");
    await fetch(`/api/owner/properties/${encodeURIComponent(id)}/submit`, { method: "POST" });
    router.push("/owner/properties");
  }

  return <main className="min-h-screen bg-[#fbfcff] text-[#10183b]">
    <div className="owner-dashboard-frame">
      <OwnerSidebar />
      <section className="owner-dashboard-main pb-[74px]">
        <DesktopHeader />
        <MobileHeader />
        <div className="owner-dashboard-content">
          <div className="owner-body hidden items-center gap-3 pb-3 text-[var(--brand)] max-[760px]:flex"><Link href="/owner/properties" className="inline-flex items-center gap-2"><Icon name="arrow-left" className="size-[14px]"/>Properties</Link><Icon name="chevron" className="size-[11px] -rotate-90"/><span className="owner-body">Property Details</span></div>
          <RejectedBanner />
          <PropertySummary id={id} />
          <Reasons id={id} />
          <Tips />
        </div>
        <div className="mx-8 mb-8 mt-3 flex min-h-[62px] items-center justify-end gap-[16px] rounded-lg border border-[#e7eaf2] bg-white px-5 max-[760px]:mx-3 max-[760px]:mb-5 max-[760px]:h-auto max-[760px]:flex-col max-[760px]:gap-[10px] max-[760px]:border-0 max-[760px]:px-0">
          <Link href="/owner/properties" className="owner-button-text grid h-[38px] w-[142px] place-items-center rounded-[5px] border border-[#d8deea] max-[760px]:order-2 max-[760px]:h-[44px] max-[760px]:w-full max-[760px]:border-[#9b7cff] max-[760px]:text-[#5824e6]">Discard changes</Link>
          <button onClick={resubmit} className="owner-button-text h-[38px] w-[208px] rounded-[5px] bg-[#5824e6] text-white shadow-[0_7px_18px_rgba(88,36,230,.2)] max-[760px]:h-[44px] max-[760px]:w-full">Make changes &amp; resubmit</button>
        </div>
      </section>
    </div>
  </main>;
}

function OwnerSidebar() { return <aside className="flex w-[205px] shrink-0 flex-col border-r border-[#edf0f6] px-[14px] pb-[15px] pt-[18px] max-[760px]:hidden">
  <DarLogo surface="light" alt="DAR Find Your Perfect Stay" width={610} height={260} className="ml-[7px] h-auto w-[104px] object-contain object-left" />
  <nav className="mt-[28px] space-y-[4px]">{nav.map(([label,icon],index)=><Link href={label === "Bookings" ? "/owner/bookings/request-decision" : "/owner/properties"} key={label} className={`owner-button-text flex h-[42px] items-center gap-[14px] rounded-[7px] px-[11px] transition-colors ${index===1?"bg-[#f5f0ff] text-[var(--brand)]":"text-[#505a7e] hover:bg-[#faf8ff] hover:text-[var(--brand)]"}`}><OwnerNavIcon name={icon} />{label}</Link>)}</nav>
  <div className="mt-auto space-y-[12px]"><div className="flex h-[48px] items-center gap-[10px] rounded-[6px] border border-[#e3e7ef] px-[9px]"><Image src="/publish-avatar-ahmed-reference.svg" alt="" width={28} height={28} className="size-[28px] rounded-full"/><span className="owner-body flex-1"><b className="owner-label block">Ahmed Hassan</b><small className="owner-helper">Host</small></span><Icon name="chevron" className="size-[12px]"/></div><div className="owner-body flex h-[44px] items-center gap-[9px] rounded-[6px] border border-[#e3e7ef] px-[10px] text-[#596381]"><span className="owner-body grid size-[16px] place-items-center rounded-full border border-current">?</span>Help Center</div></div>
</aside>; }

function OwnerNavIcon({ name }: { name: (typeof nav)[number][1] }) { return <svg aria-hidden="true" className="size-[20px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  {name === "dashboard" && <><path d="m4 11 8-7 8 7"/><path d="M6.5 9.5V20h11V9.5"/><path d="M10 20v-6h4v6"/></>}
  {name === "properties" && <><path d="m3.5 10.5 8.5-7 8.5 7"/><path d="M5.5 9v11h13V9"/><rect x="9" y="12" width="6" height="8" rx="1"/></>}
  {name === "bookings" && <><rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M7 14h3M7 17h3"/></>}
  {name === "calendar" && <><rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/></>}
  {name === "messages" && <path d="M4 5.5h16v11H9l-5 3v-14Z"/>}
  {name === "reviews" && <><path d="M4 5.5h16v11H9l-5 3v-14Z"/><path d="m12 8 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3 1-2Z"/></>}
  {name === "payouts" && <><rect x="3.5" y="6" width="17" height="13" rx="2"/><path d="M3.5 10h17M16 13h4v3h-4a1.5 1.5 0 0 1 0-3Z"/></>}
  {name === "analytics" && <><path d="M4 20v-5h4v5M10 20V9h4v11M16 20V4h4v16M3 20h18"/><path d="m5 11 5-5 4 3 5-6"/></>}
  {name === "settings" && <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3a2 2 0 1 1 0-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.08V3a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.37 9v.01A1.7 1.7 0 0 0 20.92 10H21a2 2 0 1 1 0 4h-.08A1.7 1.7 0 0 0 19.4 15Z"/></>}
</svg>; }

function DesktopHeader() { return <header className="flex h-[58px] items-center justify-between border-b border-[#edf0f6] px-[24px] max-[760px]:hidden"><div className="owner-body flex items-center gap-[13px] text-[#68718e]"><Link href="/owner/properties">Properties</Link><Icon name="chevron" className="size-[11px] -rotate-90"/><span>Property Details</span></div><div className="flex items-center gap-[22px]"><Link href="/owner/properties/1" className="owner-button-text flex h-[34px] items-center gap-[8px] rounded-[5px] border border-[#dce1eb] px-[13px]"><Icon name="message" className="size-[14px]"/>View property <Icon name="arrow-right" className="size-[13px] -rotate-45"/></Link><span className="owner-body relative"><Icon name="bell" className="size-[18px]"/><i className="absolute -right-[2px] -top-[3px] size-[6px] rounded-full bg-[#ef3945]"/></span><Image src="/publish-avatar-ahmed-reference.svg" alt="" width={28} height={28} className="size-[28px] rounded-full"/><b className="owner-label -ml-[15px]">Ahmed Hassan</b><Icon name="chevron" className="-ml-[17px] size-[11px]"/></div></header>; }
function MobileHeader() { return <header className="hidden h-[62px] items-center justify-between border-b border-[#edf0f6] px-[16px] max-[760px]:flex"><Icon name="menu" className="size-[20px]"/><DarLogo surface="light" alt="DAR" width={88} height={38} className="h-[35px] w-[88px] object-contain"/><Icon name="bell" className="size-[18px]"/></header>; }

function RejectedBanner() { return <section className="flex min-h-[108px] items-center rounded-[9px] border border-[#ffd4d6] bg-[#fff7f7] px-[20px] max-[760px]:relative max-[760px]:min-h-[132px] max-[760px]:items-start max-[760px]:px-[12px] max-[760px]:pb-[12px] max-[760px]:pt-[54px]"><span className="owner-badge grid size-[64px] shrink-0 place-items-center rounded-full bg-[#ffe1e2] max-[760px]:absolute max-[760px]:left-[12px] max-[760px]:top-[10px] max-[760px]:size-[38px]"><StatusIcon className="size-[34px] max-[760px]:size-[22px]"/></span><div className="ml-[18px] max-[760px]:ml-0"><h1 className="owner-page-title">Your property was not approved</h1><p className="owner-page-description mt-[6px]">We&apos;re sorry, but your property didn&apos;t meet our listing requirements.<br className="max-[760px]:hidden"/> Please review the reason(s) below and make the necessary changes.</p></div><span className="owner-badge ml-auto inline-flex items-center gap-[5px] rounded-[5px] bg-[#ffe6e7] px-[12px] py-[7px] max-[760px]:absolute max-[760px]:right-[10px] max-[760px]:top-[10px]"><RejectedBadgeIcon />Rejected</span></section>; }

function PropertySummary({ id }: { id:string }) { return <section className="mt-[15px] flex min-h-[142px] rounded-[9px] border border-[#e8ebf2] p-[14px] max-[760px]:mt-[10px] max-[760px]:min-h-0 max-[760px]:flex-wrap max-[760px]:p-[8px]"><div className="relative h-[118px] w-[220px] shrink-0 overflow-hidden rounded-[7px] max-[760px]:h-[88px] max-[760px]:w-[94px]"><Image src="/rejected-property-reference.png" alt="Modern Apartment in Zamalek" fill className="object-cover" sizes="220px"/></div><div className="ml-[18px] flex flex-1 flex-col max-[760px]:ml-[9px]"><h2 className="owner-section-title">Modern Apartment in Zamalek</h2><p className="owner-body mt-[8px] flex items-center gap-[7px]"><Icon name="location" className="size-[14px]"/>Zamalek, Cairo, Egypt</p><div className="owner-body mt-[19px] flex gap-[26px] text-[#4f587b] max-[760px]:mt-[12px] max-[760px]:gap-[11px]"><span className="owner-body flex items-center gap-[7px]"><BedroomsIcon />2 <span className="owner-body max-[760px]:hidden">Bedrooms</span><span className="owner-body hidden max-[760px]:inline">Beds</span></span><span className="owner-body flex items-center gap-[7px]"><Icon name="bath" className="size-[16px]"/>2 <span className="owner-body max-[760px]:hidden">Bathrooms</span><span className="owner-body hidden max-[760px]:inline">Baths</span></span><span className="owner-body flex items-center gap-[7px]"><Icon name="user" className="size-[16px]"/>4 Guests</span></div><p className="owner-body mt-auto flex items-center gap-[8px] max-[760px]:hidden"><Icon name="calendar" className="size-[15px]"/>Submitted on 10 May 2024, 11:24 AM</p></div><div className="owner-body mt-auto text-[#596382] max-[760px]:mt-[8px] max-[760px]:w-full"><p className="owner-body hidden items-center gap-[8px] max-[760px]:flex"><Icon name="calendar" className="size-[14px]"/>Submitted on 10 May 2024, 11:24 AM</p><p className="owner-body mt-[8px] flex items-center gap-[6px]"><Icon name="id-link" className="size-[13px]"/>Property ID</p><p className="owner-body mt-[3px] flex items-center gap-[8px]">DAR-25052024-4837 <button aria-label="Copy property ID" className="owner-button-text" onClick={()=>navigator.clipboard.writeText(`DAR-25052024-${id.padStart(4,"0")}`)}><Icon name="copy" className="size-[14px]"/></button></p></div></section>; }

const reasons = [
  ["image","Unclear or low-quality photos","Some photos are too dark or blurry. Please upload clear, well-lit photos that show all areas.","Update photos","/owner/properties/1/edit?tab=photos"],
  ["list-check","Missing amenities information","Please add more details about the available amenities (e.g., Wi-Fi, AC, Kitchen, etc.).","Update amenities","/owner/properties/1/edit?tab=amenities"],
  ["document-text","Incomplete description","Your property description is too short. Please add more details about the space and nearby attractions.","Edit description","/owner/properties/1/edit?tab=basic"],
] as const;
function Reasons({ id }: { id:string }) { return <section className="mt-[2px] rounded-[9px] border border-[#e8ebf2] px-[14px] py-[17px] max-[760px]:mt-[10px] max-[760px]:px-[8px] max-[760px]:py-[10px]"><h2 className="owner-section-title">Reason(s) for rejection</h2><p className="owner-body mt-[5px]">Please address the following issues to improve your chances of approval.</p><div className="mt-[15px] space-y-[10px]">{reasons.map(([icon,title,note,action,href])=><article key={title} className="flex min-h-[49px] items-center border-l-[3px] border-[#ff7e86] pl-[10px] max-[760px]:relative max-[760px]:min-h-[65px] max-[760px]:rounded-[6px] max-[760px]:border-l-0 max-[760px]:bg-[#fff5f5] max-[760px]:p-[9px]"><span className="owner-badge grid size-[38px] shrink-0 place-items-center rounded-full bg-[#fff0f1] max-[760px]:size-[32px]"><Icon name={icon} className="size-[18px]" strokeWidth="1.8"/></span><div className="ml-[12px] flex-1"><h3 className="owner-card-title">{title}</h3><p className="owner-body mt-[5px] max-[760px]:pr-1">{note}</p><Link href={href.replace("/1/",`/${id}/`)} className="owner-body mt-[5px] hidden max-[760px]:inline-flex">{action}<Icon name="chevron" className="ml-1 size-[11px] -rotate-90"/></Link></div><Link href={href.replace("/1/",`/${id}/`)} className="owner-button-text grid h-[34px] w-[174px] place-items-center rounded-[5px] border border-[#9d7cff] px-[14px] max-[760px]:hidden">{action}</Link></article>)}</div></section>; }

function Tips() { const tips=["Use high-quality, bright photos","Provide accurate and complete information","Highlight what makes your property unique","Ensure all house rules and policies are clear"]; return <section className="relative mt-[15px] min-h-[130px] overflow-hidden rounded-[9px] bg-[#f8f6ff] px-[24px] py-[21px] max-[760px]:mt-[10px] max-[760px]:min-h-[116px] max-[760px]:px-[12px] max-[760px]:py-[10px]"><h2 className="owner-section-title flex items-center gap-[12px]"><Icon name="bulb" className="size-[22px] text-[#6b3cf0]" strokeWidth="1.8"/>Tips for a successful listing</h2><div className="ml-[36px] mt-[12px] space-y-[8px] max-[760px]:ml-0 max-[760px]:mt-[9px] max-[760px]:space-y-[5px]">{tips.map(t=><p key={t} className="owner-body flex items-center gap-[9px]"><Icon name="check-circle" className="size-[12px] shrink-0 text-[#6b3cf0]" strokeWidth="1.8"/>{t}</p>)}</div><Image src="/rejected-tips-reference.png" alt="" width={142} height={130} className="absolute bottom-0 right-[12px] h-[125px] w-[138px] object-cover max-[760px]:right-0 max-[760px]:h-[92px] max-[760px]:w-[100px]"/></section>; }

function StatusIcon({className}:{className:string}) { return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l3 3v8M6 3v18h7M14 3v4h4"/><circle cx="17" cy="17" r="4"/><path d="m14.2 19.8 5.6-5.6"/></svg>; }
function RejectedBadgeIcon() { return <svg aria-hidden="true" className="size-[13px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/></svg>; }
function BedroomsIcon() { return <svg aria-hidden="true" className="size-[16px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 18v-7.5M20.5 18v-5.5a2 2 0 0 0-2-2h-8a2.5 2.5 0 0 0-2.5 2.5V15"/><path d="M3.5 15h17M6 10.5V8h4v2.5M5 18v2M19 18v2"/></svg>; }
