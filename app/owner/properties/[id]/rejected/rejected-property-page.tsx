"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/host-landing/icons";
import {
  getPropertyRejectionReasons,
  OwnerPropertyDraft,
  OwnerPropertyRejectionReason,
  patchOwnerPropertyDraft,
  resolveDraftAsset,
  useOwnerPropertyDraft,
} from "@/lib/owner-property-draft";

export default function RejectedPropertyPage({ id }: { id: string }) {
  const router = useRouter();
  const draft = useOwnerPropertyDraft();
  const rejectionReasons = getPropertyRejectionReasons(draft);
  const reasonsRef = useRef<HTMLElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{tone:"success"|"error";text:string}|null>(null);
  async function resubmit() {
    if (submitting) return;
    const currentReasons = getPropertyRejectionReasons(draft);
    if (currentReasons.length) {
      setFeedback({tone:"error",text:"Please resolve all rejection reasons before resubmitting."});
      reasonsRef.current?.focus();
      return;
    }
    setSubmitting(true); setFeedback(null);
    await new Promise<void>(resolve=>window.requestAnimationFrame(()=>resolve()));
    const saved = patchOwnerPropertyDraft({status:"pending_review",hasUnsubmittedChanges:false});
    if (!saved) { setFeedback({tone:"error",text:"Your property could not be resubmitted. Please try again."}); setSubmitting(false); return; }
    setFeedback({tone:"success",text:"Your property was resubmitted for review."});
    window.setTimeout(()=>router.push("/owner/properties"),700);
  }
  function discard() {
    if (draft.hasUnsubmittedChanges && !window.confirm("Discard your unsaved property changes and return to My Properties?")) return;
    router.push("/owner/properties");
  }

  return <div className="min-h-screen bg-[#fbfcff] pb-[74px] text-[#10183b]">
        <div className="owner-dashboard-content">
          <div className="owner-body hidden items-center gap-3 pb-3 text-[var(--brand)] max-[760px]:flex"><Link href="/owner/properties" className="inline-flex items-center gap-2"><Icon name="arrow-left" className="size-[14px]"/>Properties</Link><Icon name="chevron" className="size-[11px] -rotate-90"/><span className="owner-body">Property Details</span></div>
          <RejectedBanner />
          <PropertySummary id={id} draft={draft} />
          <Reasons id={id} reasons={rejectionReasons} sectionRef={reasonsRef} />
          <Tips />
          {feedback ? <p role={feedback.tone==="error"?"alert":"status"} className={`owner-body mt-3 rounded-[7px] border px-4 py-3 ${feedback.tone==="error"?"border-danger/30 bg-danger/10 text-danger":"border-success/30 bg-success/10 text-success"}`}>{feedback.text}</p> : null}
        </div>
        <div className="mx-8 mb-8 mt-3 flex min-h-[62px] items-center justify-end gap-[16px] rounded-lg border border-[#e7eaf2] bg-white px-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] max-[760px]:mx-3 max-[760px]:mb-5 max-[760px]:h-auto max-[760px]:flex-col max-[760px]:gap-[10px] max-[760px]:border-0 max-[760px]:px-0">
          <button type="button" disabled={submitting} onClick={discard} className="owner-button-text grid h-[38px] w-[142px] place-items-center rounded-[5px] border border-[#d8deea] transition hover:shadow-[var(--shadow-card-hover)] active:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-50 max-[760px]:order-2 max-[760px]:h-[44px] max-[760px]:w-full max-[760px]:border-[#9b7cff] max-[760px]:text-[#5824e6]">Discard changes</button>
          <button type="button" disabled={submitting} aria-busy={submitting} onClick={()=>void resubmit()} className="owner-button-text h-[38px] w-[208px] rounded-[5px] bg-[#5824e6] text-white shadow-[0_7px_18px_rgba(88,36,230,.2)] transition hover:shadow-[var(--shadow-card-hover)] active:translate-y-px focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:cursor-wait disabled:opacity-60 max-[760px]:h-[44px] max-[760px]:w-full">{submitting?"Resubmitting…":"Make changes & resubmit"}</button>
        </div>
  </div>;
}


function RejectedBanner() { return <section className="flex min-h-[108px] items-center rounded-[9px] border border-[#ffd4d6] bg-[#fff7f7] px-[20px] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] max-[760px]:relative max-[760px]:min-h-[132px] max-[760px]:items-start max-[760px]:px-[12px] max-[760px]:pb-[12px] max-[760px]:pt-[54px]"><span className="owner-badge grid size-[64px] shrink-0 place-items-center rounded-full bg-[#ffe1e2] max-[760px]:absolute max-[760px]:left-[12px] max-[760px]:top-[10px] max-[760px]:size-[38px]"><StatusIcon className="size-[34px] max-[760px]:size-[22px]"/></span><div className="ml-[18px] max-[760px]:ml-0"><h1 className="owner-page-title">Your property was not approved</h1><p className="owner-page-description mt-[6px]">We&apos;re sorry, but your property didn&apos;t meet our listing requirements.<br className="max-[760px]:hidden"/> Please review the reason(s) below and make the necessary changes.</p></div><span className="owner-badge ml-auto inline-flex items-center gap-[5px] rounded-[5px] bg-[#ffe6e7] px-[12px] py-[7px] max-[760px]:absolute max-[760px]:right-[10px] max-[760px]:top-[10px]"><RejectedBadgeIcon />Rejected</span></section>; }

function PropertySummary({ id,draft }: { id:string;draft:OwnerPropertyDraft }) { const cover=useDraftCover(draft);const [copyState,setCopyState]=useState<"idle"|"success"|"error">("idle");const propertyId=`DAR-${id}`;const submitted=draft.updatedAt?new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short"}).format(new Date(draft.updatedAt)):"Not submitted yet";async function copy(){try{await navigator.clipboard.writeText(propertyId);setCopyState("success")}catch{setCopyState("error")}window.setTimeout(()=>setCopyState("idle"),1600)}return <section className="mt-[15px] flex min-h-[142px] rounded-[9px] border border-[#e8ebf2] p-[14px] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] max-[760px]:mt-[10px] max-[760px]:min-h-0 max-[760px]:flex-wrap max-[760px]:p-[8px]"><div className="relative h-[118px] w-[220px] shrink-0 overflow-hidden rounded-[7px] max-[760px]:h-[88px] max-[760px]:w-[94px]"><Image src={cover} alt={draft.title||"Property"} fill unoptimized={cover.startsWith("blob:")} className="object-cover" sizes="220px"/></div><div className="ml-[18px] flex flex-1 flex-col max-[760px]:ml-[9px]"><h2 className="owner-section-title">{draft.title||"Untitled property"}</h2><p className="owner-body mt-[8px] flex items-center gap-[7px]"><Icon name="location" className="size-[14px]"/>{draft.address||[draft.neighborhood,draft.city].filter(Boolean).join(", ")||"Address incomplete"}</p><div className="owner-body mt-[19px] flex gap-[26px] text-[#4f587b] max-[760px]:mt-[12px] max-[760px]:gap-[11px]"><span className="owner-body flex items-center gap-[7px]"><BedroomsIcon />{draft.bedrooms||"0"} <span className="owner-body max-[760px]:hidden">Bedrooms</span><span className="owner-body hidden max-[760px]:inline">Beds</span></span><span className="owner-body flex items-center gap-[7px]"><Icon name="bath" className="size-[16px]"/>{draft.bathrooms||"0"} <span className="owner-body max-[760px]:hidden">Bathrooms</span><span className="owner-body hidden max-[760px]:inline">Baths</span></span><span className="owner-body flex items-center gap-[7px]"><Icon name="user" className="size-[16px]"/>{draft.guests||"0"} Guests</span></div><p className="owner-body mt-auto flex items-center gap-[8px] max-[760px]:hidden"><Icon name="calendar" className="size-[15px]"/>Submitted on {submitted}</p></div><div className="owner-body mt-auto text-[#596382] max-[760px]:mt-[8px] max-[760px]:w-full"><p className="owner-body hidden items-center gap-[8px] max-[760px]:flex"><Icon name="calendar" className="size-[14px]"/>Submitted on {submitted}</p><p className="owner-body mt-[8px] flex items-center gap-[6px]"><Icon name="id-link" className="size-[13px]"/>Property ID</p><p className="owner-body mt-[3px] flex items-center gap-[8px]">{propertyId} <button type="button" aria-label="Copy property ID" onClick={()=>void copy()} className="owner-button-text rounded transition hover:text-[var(--brand)] active:scale-95 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"><Icon name={copyState==="success"?"check":"copy"} className="size-[14px]"/></button>{copyState!=="idle"?<span role={copyState==="error"?"alert":"status"} className={copyState==="error"?"text-danger":"text-success"}>{copyState==="error"?"Copy failed":"Copied"}</span>:null}</p></div></section>; }

function reasonHref(id:string,reason:OwnerPropertyRejectionReason){if(reason.id==="documents")return "/owner/properties/new/details#documents";const params=new URLSearchParams({tab:reason.tab});if(reason.focus)params.set("focus",reason.focus);return `/owner/properties/${encodeURIComponent(id)}/edit?${params}`}
function Reasons({ id,reasons,sectionRef }: { id:string;reasons:OwnerPropertyRejectionReason[];sectionRef:React.RefObject<HTMLElement|null> }) { return <section ref={sectionRef} tabIndex={-1} className="mt-[2px] rounded-[9px] border border-[#e8ebf2] px-[14px] py-[17px] shadow-[var(--shadow-card)] outline-none transition-shadow hover:shadow-[var(--shadow-card-hover)] focus-visible:shadow-[var(--shadow-focus)] max-[760px]:mt-[10px] max-[760px]:px-[8px] max-[760px]:py-[10px]"><h2 className="owner-section-title">Reason(s) for rejection</h2><p className="owner-body mt-[5px]">Please address the following issues to improve your chances of approval.</p><div className="mt-[15px] space-y-[10px]">{reasons.length?reasons.map(reason=><article key={reason.id} className="flex min-h-[49px] items-center border-l-[3px] border-[#ff7e86] pl-[10px] transition-shadow hover:shadow-[var(--shadow-card-hover)] max-[760px]:relative max-[760px]:min-h-[65px] max-[760px]:rounded-[6px] max-[760px]:border-l-0 max-[760px]:bg-[#fff5f5] max-[760px]:p-[9px]"><span className="owner-badge grid size-[38px] shrink-0 place-items-center rounded-full bg-[#fff0f1] max-[760px]:size-[32px]"><Icon name={reason.icon} className="size-[18px]" strokeWidth="1.8"/></span><div className="ml-[12px] flex-1"><h3 className="owner-card-title">{reason.title}</h3><p className="owner-body mt-[5px] max-[760px]:pr-1">{reason.note}</p><Link href={reasonHref(id,reason)} className="owner-body mt-[5px] hidden rounded outline-none transition hover:text-[var(--brand)] active:translate-x-px focus-visible:shadow-[var(--shadow-focus)] max-[760px]:inline-flex">{reason.action}<Icon name="chevron" className="ml-1 size-[11px] -rotate-90"/></Link></div><Link href={reasonHref(id,reason)} className="owner-button-text grid h-[34px] w-[174px] place-items-center rounded-[5px] border border-[#9d7cff] px-[14px] transition hover:shadow-[var(--shadow-card-hover)] active:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] max-[760px]:hidden">{reason.action}</Link></article>):<p role="status" className="owner-body rounded-[6px] bg-success/10 px-3 py-2 text-success">All rejection reasons have been resolved. You can resubmit the property.</p>}</div></section>; }

function useDraftCover(draft:OwnerPropertyDraft){const cover=draft.photos.find(photo=>photo.id===draft.coverPhotoId)??draft.photos[0];const [src,setSrc]=useState(cover?.builtInUrl??"/property-studio-reference.png");useEffect(()=>{let active=true;let created="";if(cover)void resolveDraftAsset(cover).then(url=>{created=url;if(active)setSrc(url)});return()=>{active=false;if(created.startsWith("blob:"))URL.revokeObjectURL(created)}},[cover]);return src}

function Tips() { const tips=["Use high-quality, bright photos","Provide accurate and complete information","Highlight what makes your property unique","Ensure all house rules and policies are clear"]; return <section className="relative mt-[15px] min-h-[130px] overflow-hidden rounded-[9px] bg-[#f8f6ff] px-[24px] py-[21px] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] max-[760px]:mt-[10px] max-[760px]:min-h-[116px] max-[760px]:px-[12px] max-[760px]:py-[10px]"><h2 className="owner-section-title flex items-center gap-[12px]"><Icon name="bulb" className="size-[22px] text-[#6b3cf0]" strokeWidth="1.8"/>Tips for a successful listing</h2><div className="ml-[36px] mt-[12px] space-y-[8px] max-[760px]:ml-0 max-[760px]:mt-[9px] max-[760px]:space-y-[5px]">{tips.map(t=><p key={t} className="owner-body flex items-center gap-[9px]"><Icon name="check-circle" className="size-[12px] shrink-0 text-[#6b3cf0]" strokeWidth="1.8"/>{t}</p>)}</div><Image src="/rejected-tips-reference.png" alt="" width={142} height={130} className="absolute bottom-0 right-[12px] h-[125px] w-[138px] object-cover max-[760px]:right-0 max-[760px]:h-[92px] max-[760px]:w-[100px]"/></section>; }

function StatusIcon({className}:{className:string}) { return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l3 3v8M6 3v18h7M14 3v4h4"/><circle cx="17" cy="17" r="4"/><path d="m14.2 19.8 5.6-5.6"/></svg>; }
function RejectedBadgeIcon() { return <svg aria-hidden="true" className="size-[13px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/></svg>; }
function BedroomsIcon() { return <svg aria-hidden="true" className="size-[16px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 18v-7.5M20.5 18v-5.5a2 2 0 0 0-2-2h-8a2.5 2.5 0 0 0-2.5 2.5V15"/><path d="M3.5 15h17M6 10.5V8h4v2.5M5 18v2M19 18v2"/></svg>; }
