"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Building2, Check, CheckCircle, ChevronDown, Clock3, Headphones, Hotel, Info, Landmark, LockKeyhole, UserRound } from "lucide-react";
import { Icon } from "@/components/host-landing/icons";
import { Card, OwnerShell } from "@/components/owner/owner-shell";
import { properties } from "@/lib/dar-data";

type Draft = {
  ownerType: string; name: string; display: string; nationality: string; phone: string; email: string;
  payout: string; accountHolder: string; instapayAlias: string; iban: string; vodafoneNumber: string;
  compliance: boolean[]; files: Record<string, string>; submitted: boolean;
};
const initial: Draft = { ownerType: "Broker / real estate agent", name: "Ahmed Hassan Saeed", display: "Ahmed Hassan", nationality: "Egyptian", phone: "+20 101 234 5678", email: "ahmed.hassan@example.com", payout: "InstaPay", accountHolder: "Ahmed Hassan Saeed", instapayAlias: "ahmed.hassan@instapay", iban: "EGxxxxxxxxxxxxxxxxxxxxxxxx", vodafoneNumber: "+20 101 234 5678", compliance: [true, true, true, true], files: { front: "national-id-front.jpg" }, submitted: false };

export default function VerificationPage() {
  const [draft, setDraft] = useState(initial);
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const saved = localStorage.getItem("dar-owner-verification");
      if (saved) setDraft({...initial,...JSON.parse(saved)});
    });
    return () => { active = false; };
  }, []);
  const progress = useMemo(() => Math.round(([draft.name, draft.email, draft.phone, draft.files.front, draft.files.back, draft.files.selfie].filter(Boolean).length / 6) * 100), [draft]);
  function save(message = "Verification draft saved.") { localStorage.setItem("dar-owner-verification", JSON.stringify(draft)); setToast(message); setTimeout(() => setToast(""), 2600); }
  function submit() {
    const missing = ["front", "back", "selfie"].filter((key) => !draft.files[key]);
    if (!draft.name || !draft.email) missing.push("details");
    setErrors(missing);
    if (missing.length) { setToast("Please complete the highlighted requirements."); return; }
    const next = { ...draft, submitted: true }; setDraft(next); localStorage.setItem("dar-owner-verification", JSON.stringify(next)); setToast("Verification submitted successfully.");
  }
  const actions = <><button onClick={() => save()} className="owner-button-text h-10 rounded-md border border-[#cbd2df] px-7">Save draft</button><button onClick={submit} className="owner-button-text h-10 rounded-md bg-[#5522d9] px-7 text-white">Submit verification</button></>;
  return <OwnerShell active="Verification" actions={actions} wide fluid>
    <div className="owner-dashboard-content">
      <h1 className="owner-page-title">Owner verification</h1><p className="owner-page-description text-[#59637d]">Verify your identity and ownership permissions before your listings go live.</p>
      <Card className="mt-6 grid grid-cols-4 divide-x divide-[#e4e7ee] px-6 py-5 max-[1050px]:grid-cols-2 max-[1050px]:gap-y-6 max-[560px]:grid-cols-1 max-[560px]:divide-x-0">
        <Stat label="Status"><b className={`owner-number-md ${draft.submitted ? "text-[#e18a00]" : "text-[#e18a00]"}`}>{draft.submitted ? "Verification pending" : "Verification pending"}</b><p className="owner-helper mt-1 text-[#68718a]">Some documents are missing.</p></Stat>
        <Stat label="Progress"><b className="owner-number-md">{progress}% <span className="owner-helper">complete</span></b><div className="mt-3 h-1.5 rounded bg-[#e8e9ee]"><div className="h-full rounded bg-[#5522d9]" style={{ width: `${progress}%` }} /></div></Stat>
        <Stat label="Estimated review time"><b className="owner-number-sm flex items-center gap-2"><Icon name="clock" className="size-4" />24 - 48 hours</b><p className="owner-helper mt-2">We&apos;ll notify you once reviewed.</p></Stat>
        <Stat label="Required before publishing"><div className="owner-helper space-y-2"><p className="flex gap-2"><Icon name="user-plain" className="size-4" />Identity verification</p><p className="flex gap-2"><Icon name="document-text" className="size-4" />Ownership / authorization</p><p className="flex gap-2"><Icon name="card" className="size-4" />Payout method</p></div></Stat>
      </Card>
      <div className="mt-5 grid grid-cols-[minmax(0,1.28fr)_minmax(0,1.05fr)_minmax(280px,.55fr)] gap-[18px] max-[1250px]:grid-cols-2 max-[760px]:grid-cols-1">
        <div className="space-y-4">
          <Card className="p-5"><Title n="1" text="Owner type" sub="Select the type of account that best describes you."/><OwnerTypeOptions value={draft.ownerType} onChange={(ownerType)=>setDraft({...draft,ownerType})}/></Card>
          <Card className="p-5"><Title n="3" text="Identity verification" sub="Upload identity documents and complete selfie verification."/><IdentityVerification files={draft.files} errors={errors} onFile={(key,name)=>setDraft({...draft,files:{...draft.files,[key]:name}})}/></Card>
          <Card className="p-5">
            <Title n="4" text="Ownership / authorization documents" sub="Provide documents that prove your right to list these properties."/>
            <div className="mt-4 grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
              <div className="owner-helper space-y-3">
                {["Authorization letter from owner","Utility bill / Address proof","Agency agreement","Property ownership contract"].map((document,i)=>{
                  const status=i===0?"Missing":i===3?"Optional":"Uploaded";
                  const badgeClass=status==="Missing"?"bg-[#fdebed] text-[#d84955]":status==="Uploaded"?"bg-[#e9f7ee] text-[#168446]":"bg-[#eef0f4] text-[#4f586d]";
                  return <p key={document} className="flex items-center gap-2">
                    <Icon name={i===0?"clock":"check-circle"} className={`size-4 shrink-0 ${i===0?"text-[#e18a00]":"text-[#159447]"}`}/>
                    <span className="min-w-0">{document}</span>
                    <span className={`owner-badge ml-auto shrink-0 rounded-full px-2 py-[2px] ${badgeClass}`}>{status}</span>
                  </p>;
                })}
              </div>
              <label
                className="grid min-h-28 cursor-pointer place-items-center rounded border border-dashed border-[#cbd2df] text-center outline-none focus-within:ring-2 focus-within:ring-[#6c4cf5] focus-within:ring-offset-2"
                onDragOver={event=>event.preventDefault()}
                onDrop={event=>{event.preventDefault();const file=event.dataTransfer.files?.[0];if(file)setDraft({...draft,files:{...draft.files,authorization:file.name}})}}
              >
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={event=>{const file=event.target.files?.[0];if(file)setDraft({...draft,files:{...draft.files,authorization:file.name}})}}/>
                <span className="owner-helper">
                  <Icon name="cloud-upload" className="mx-auto mb-1 size-8 text-[#6c4cf5]"/>
                  <span className="block">Drag & drop files here</span>
                  <span className="block">or <span className="text-[#6c4cf5]">click to upload</span></span>
                  <span className="owner-helper mt-2 block text-[#778096]">PDF, JPG, PNG up to 10MB</span>
                </span>
              </label>
            </div>
            <a download href="/authorization-template.txt" className="owner-button-text mt-4 flex h-9 w-fit min-w-[240px] items-center justify-start gap-2 rounded border border-[#8a64ef] bg-white px-4 text-[#6c4cf5]"><Icon name="download" className="size-4 text-[#6c4cf5]"/>Download authorization template</a>
          </Card>
          <Card className="p-5"><Title n="6" text="Compliance and policies" sub="Please read and confirm the following."/><div className="owner-helper mt-4 space-y-3">{["I confirm I have permission to list these properties.","I agree to the DAR Owner Terms and Conditions.","I agree to keep prices, availability and property details accurate.","I understand false documents may lead to account suspension."].map((x,i)=><label key={x} className="flex gap-2"><input type="checkbox" checked={draft.compliance[i]} onChange={()=>{const c=[...draft.compliance];c[i]=!c[i];setDraft({...draft,compliance:c})}} className="accent-[#6c4cf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c4cf5] focus-visible:ring-offset-1"/>{i===1?<>I agree to the DAR Owner <Link href="/owner/help-center" className="text-[#6c4cf5] transition-colors hover:text-[#5522d9] hover:underline">Terms and Conditions</Link>.</>:x}</label>)}</div></Card>
        </div>
        <div className="space-y-4">
          <Card className="p-5"><Title n="2" text="Personal / company details"/><div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 max-[560px]:grid-cols-1"><Field label="Full legal name" value={draft.name} onChange={name=>setDraft({...draft,name})}/><Field label="Display name" value={draft.display} onChange={display=>setDraft({...draft,display})}/><Field label="Nationality" value={draft.nationality} onChange={nationality=>setDraft({...draft,nationality})}/><Field label="Date of birth" value="May 15, 1990"/><Field label="Phone number" value={draft.phone} onChange={phone=>setDraft({...draft,phone})}/><Field label="Email address" value={draft.email} onChange={email=>setDraft({...draft,email})}/><Field label="Business name (optional)" value="Hassan Real Estate Solutions"/><Field label="Tax ID / Commercial registration" value="123-456-789"/><Field label="City" value="Cairo"/><Field label="Country" value="Egypt"/></div></Card>
          <Card className="p-5"><Title n="5" text="Payout method" sub="Choose how you want to receive your payouts."/><PayoutMethodSection draft={draft} setDraft={setDraft}/></Card>
          <Card className="p-5"><Title n="7" text="Verification timeline" sub="Track your verification progress."/><VerificationTimeline/></Card>
        </div>
        <aside className="space-y-[14px] max-[1250px]:col-span-2 max-[760px]:col-span-1">
          <OwnerTrustScore/>
          <MissingRequirements/>
          <Card className="p-5"><b className="owner-card-title">Linked properties</b>{properties.map(p=><Link href={`/owner/properties/${p.id}`} key={p.id} className="mt-4 flex gap-3"><Image src={p.image} alt="" width={44} height={44} className="size-11 rounded object-cover" quality={90}/><span className="owner-helper"><b className="owner-label block">{p.name}</b>{p.location}<small className="owner-badge block">{p.status}</small></span></Link>)}<Link href="/owner/properties" className="owner-button-text mt-4 block text-center text-[#5522d9]">View all properties</Link></Card>
          <Card className="border-[#eee5cf] bg-[#fffaf0] p-5">
            <div className="flex items-center gap-2">
              <Info aria-hidden="true" size={14} strokeWidth={1.8} className="shrink-0 text-[#d58b0a]"/>
              <b className="owner-card-title">Admin notes</b>
            </div>
            <div className="mt-3 grid grid-cols-[14px_minmax(0,1fr)] items-start gap-2">
              <ChevronDown aria-hidden="true" size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#d58b0a]"/>
              <div>
                <p className="owner-helper">Please upload a signed authorization letter from the property owner to continue.</p>
                <p className="owner-helper mt-2 text-[#667086]">DAR Verification Team<br/>May 16, 2024 - 10:24 AM</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <b className="owner-card-title">Need help?</b>
            <p className="owner-helper mt-3">Our verification team is here to help you<br/>complete the process.</p>
            <Link href="/owner/help-center" className="owner-button-text mt-4 flex h-9 w-full items-center justify-center gap-2 rounded border border-[#8a64ef] bg-white text-[#6c4cf5] transition-colors hover:bg-[#f7f3ff] hover:text-[#6c4cf5]">
              <Headphones aria-hidden="true" size={15} strokeWidth={1.8} className="shrink-0 text-[#6c4cf5]"/>
              Contact verification team
            </Link>
          </Card>
          <Card className="p-5"><div className="flex gap-3"><Icon name="shield" className="size-6 text-[#5522d9]"/><span><b className="owner-card-title">Your security is our priority</b><p className="owner-helper mt-2">Your documents are reviewed by DAR admin only.</p></span></div></Card>
        </aside>
      </div>
      <div className="mt-2 flex justify-center gap-4 rounded-lg bg-[#071426] p-4 text-white"><button onClick={()=>save()} className="owner-button-text h-10 w-52 rounded border border-white/40">Save draft</button><button onClick={submit} className="owner-button-text h-10 w-56 rounded bg-[#5522d9]">Submit verification</button><Link href="/owner/help-center" className="owner-button-text grid h-10 w-52 place-items-center rounded border border-white/40">Contact support</Link></div>
    </div>
    {toast?<div className="owner-body fixed bottom-5 right-5 z-50 rounded-lg bg-[#10233c] px-5 py-3 text-white shadow-xl">{toast}{draft.submitted?<Link href="/owner/properties/1/publish" className="owner-button-text ml-4 underline">Return to publishing</Link>:null}</div>:null}
  </OwnerShell>;
}

function Stat({label,children}:{label:string;children:React.ReactNode}){return <div className="px-5 first:pl-0"><p className="owner-helper mb-2">{label}</p>{children}</div>}
function Title({n,text,sub}:{n:string;text:string;sub?:string}){return <><b className="owner-card-title">{n}. {text}</b>{sub?<p className="owner-helper text-[#626c84]">{sub}</p>:null}</>}
function Field({label,value,onChange}:{label:string;value:string;onChange?:(v:string)=>void}){return <label className="owner-label">{label}<input value={value} onChange={e=>onChange?.(e.target.value)} className="owner-input-text mt-1 h-9 w-full rounded border border-[#d9dee8] px-3 outline-none focus:border-[#7b4cff]"/></label>}
function OwnerTrustScore() {
  const arc = "M 18 86 A 72 72 0 0 1 162 86";
  return <Card className="p-5">
    <b className="owner-card-title">Owner trust score</b>
    <div className="relative mx-auto mt-2 h-[92px] w-[180px]" role="img" aria-label="Owner trust score: 72 out of 100">
      <svg aria-hidden="true" viewBox="0 0 180 100" className="absolute inset-0 size-full overflow-visible">
        <path d={arc} pathLength="100" fill="none" stroke="#eceef2" strokeWidth="12" strokeLinecap="butt"/>
        <path d={arc} pathLength="100" fill="none" stroke="#5522d9" strokeWidth="12" strokeLinecap="butt" strokeDasharray="62 40"/>
        <path d={arc} pathLength="100" fill="none" stroke="#ffffff" strokeWidth="13" strokeDasharray="2 100" strokeDashoffset="-62"/>
        <path d={arc} pathLength="100" fill="none" stroke="#e9a008" strokeWidth="12" strokeLinecap="butt" strokeDasharray="10 92" strokeDashoffset="-64"/>
        <path d={arc} pathLength="100" fill="none" stroke="#ffffff" strokeWidth="13" strokeDasharray="2 100" strokeDashoffset="-74"/>
      </svg>
      <span className="absolute inset-x-0 top-[47px] text-center">
        <span className="owner-number-lg">72</span><span className="owner-helper ml-1 text-[#68718a]">/100</span>
      </span>
    </div>
    <p className="owner-label -mt-1 text-center text-[#d58100]">Pending verification</p>
    <p className="owner-helper mt-1 text-center text-[#68718a]">Complete verification to increase your score.</p>
  </Card>;
}
function MissingRequirements() {
  const requirements = ["Upload authorization letter","Confirm payout method","Complete selfie verification","All other documents uploaded"];
  return <Card className="p-5">
    <b className="owner-card-title">Missing requirements</b>
    <div className="owner-helper mt-4 space-y-2.5">
      {requirements.map((requirement,index)=><p key={requirement} className="grid grid-cols-[14px_minmax(0,1fr)_14px] items-center gap-2">
        <Check aria-hidden="true" size={14} strokeWidth={2} className="text-[#159447]"/>
        <span className="min-w-0">{requirement}</span>
        {index<3?<Clock3 aria-hidden="true" size={14} strokeWidth={1.8} className="justify-self-end text-[#ef3447]"/>:<span aria-hidden="true"/>}
      </p>)}
    </div>
  </Card>;
}
function PayoutMethodSection({draft,setDraft}:{draft:Draft;setDraft:(draft:Draft)=>void}) {
  const methods = ["Bank transfer","InstaPay","Vodafone Cash"] as const;
  return <>
    <div className="mt-4 overflow-x-auto pb-1 max-[560px]:overflow-visible">
    <div className="grid min-w-[420px] grid-cols-3 gap-4 max-[560px]:min-w-0 max-[560px]:grid-cols-1">
      {methods.map(method=>{
        const selected=draft.payout===method;
        return <button type="button" key={method} aria-label={method} aria-pressed={selected} onClick={()=>setDraft({...draft,payout:method})} className={`owner-button-text relative flex h-[60px] min-w-0 items-center justify-center gap-3 whitespace-nowrap rounded-md border px-3 outline-none focus-visible:ring-2 focus-visible:ring-[#6c4cf5] focus-visible:ring-offset-2 ${selected?"border-[#7b4cff] bg-[#faf8ff]":"border-[#e0e4ec] bg-white"}`}>
          {method==="Bank transfer"?<><Landmark aria-hidden="true" size={22} strokeWidth={1.8} className="shrink-0 text-[#11183b]"/><span className="whitespace-nowrap">{method}</span></>:null}
          {method==="InstaPay"?<Image src="/brands/instapay.svg" alt="InstaPay" width={130} height={36} className="h-8 w-[118px] max-w-[calc(100%-28px)] object-contain" quality={90}/>:null}
          {method==="Vodafone Cash"?<><Image src="/brands/vodafone.svg" alt="" width={24} height={24} className="size-6 shrink-0 object-contain" quality={90}/><span className="whitespace-nowrap">{method}</span></>:null}
          {selected?<span className="absolute right-2 top-2 grid size-[18px] place-items-center rounded-full bg-[#5b2be0] text-white"><Check aria-hidden="true" size={11} strokeWidth={2.4}/></span>:null}
        </button>;
      })}
    </div>
    </div>
    <div className={`mt-4 grid gap-4 max-[560px]:grid-cols-1 ${draft.payout==="Bank transfer"?"grid-cols-1":"grid-cols-2"}`}>
      <PayoutInput label="Account holder name" value={draft.accountHolder} onChange={accountHolder=>setDraft({...draft,accountHolder})}/>
      {draft.payout==="InstaPay"?<PayoutInput label="InstaPay alias" value={draft.instapayAlias} onChange={instapayAlias=>setDraft({...draft,instapayAlias})} verified/>:null}
      {draft.payout==="Vodafone Cash"?<PayoutInput label="Vodafone mobile number" value={draft.vodafoneNumber} onChange={vodafoneNumber=>setDraft({...draft,vodafoneNumber})}/>:null}
    </div>
    {draft.payout!=="Vodafone Cash"?<div className="mt-4"><PayoutInput label="IBAN or account number (optional)" value={draft.iban} onChange={iban=>setDraft({...draft,iban})}/></div>:null}
    <div className="owner-body mt-4 flex h-9 w-full items-center gap-2 rounded-md bg-[#fff5df] px-3 text-[#17213d]"><Clock3 aria-hidden="true" size={18} strokeWidth={1.8} className="shrink-0 text-[#e79516]"/><span>Payout verification status: <span className="text-[#d98100]">Pending</span></span></div>
  </>;
}
function PayoutInput({label,value,onChange,verified=false}:{label:string;value:string;onChange:(value:string)=>void;verified?:boolean}) {
  return <label className="owner-label min-w-0">{label}<span className="relative mt-1 block"><input value={value} onChange={event=>onChange(event.target.value)} className={`owner-input-text h-9 w-full rounded border border-[#d9dee8] px-3 outline-none focus:border-[#7b4cff] ${verified?"pr-9":""}`}/>{verified?<CheckCircle aria-label="Verified" size={18} strokeWidth={1.8} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#20a55a]"/>:null}</span></label>;
}
function VerificationTimeline() {
  const steps = [
    { label:<><span className="block">Account</span><span className="block">created</span></>, helper:"May 10", state:"complete" },
    { label:<><span className="block">Phone / email</span><span className="block">verified</span></>, helper:"May 11", state:"complete" },
    { label:<><span className="block">Identity</span><span className="block">documents</span></>, helper:"In review", state:"active" },
    { label:<><span className="block">Ownership</span><span className="block">authorization</span></>, helper:"Pending", state:"pending" },
    { label:<><span className="block">Payout</span><span className="block">method</span></>, helper:"Pending", state:"pending" },
    { label:<><span className="block">DAR final</span><span className="block">review</span></>, helper:"Pending", state:"pending" },
  ] as const;
  return <div className="relative mt-6">
    <span aria-hidden="true" className="absolute left-[8.333%] top-[13px] h-px w-[33.334%] bg-[#5b2be0] max-[560px]:hidden"/>
    <span aria-hidden="true" className="absolute left-[41.667%] right-[8.333%] top-[13px] border-t border-dashed border-[#cfd4de] max-[560px]:hidden"/>
    <span aria-hidden="true" className="absolute bottom-[24px] left-[13px] top-[13px] hidden border-l border-dashed border-[#cfd4de] max-[560px]:block"/>
    <span aria-hidden="true" className="absolute left-[13px] top-[13px] hidden h-[40%] w-px bg-[#5b2be0] max-[560px]:block"/>
    <ol className="relative z-10 grid grid-cols-6 max-[560px]:flex max-[560px]:flex-col max-[560px]:gap-5">
      {steps.map((step,index)=><li key={index} className="min-w-0 text-center max-[560px]:grid max-[560px]:grid-cols-[28px_1fr] max-[560px]:items-start max-[560px]:gap-3 max-[560px]:text-left">
        <span className="flex h-7 items-center justify-center">
          {step.state==="active"?<span className="grid size-7 place-items-center rounded-full bg-[#e9e2ff] ring-2 ring-[#c7b5ff] shadow-[0_0_0_4px_rgba(108,76,245,.08)]"><span className="grid size-[14px] place-items-center rounded-full bg-[#6c4cf5]"><span className="size-1 rounded-full bg-white"/></span></span>:<span className={`grid size-6 place-items-center rounded-full ${step.state==="complete"?"bg-[#5b2be0] text-white":"bg-[#d8dce5] text-white/80"}`}><Check aria-hidden="true" size={12} strokeWidth={2.2}/></span>}
        </span>
        <span className="mt-2 block max-[560px]:mt-0">
          <span className="owner-badge block leading-[15px] text-[#17213d]">{step.label}</span>
          <span className={`owner-helper mt-1 block ${step.state==="active"?"text-[#5b2be0]":"text-[#6d7589]"}`}>{step.helper}</span>
        </span>
      </li>)}
    </ol>
  </div>;
}
const ownerTypes = [
  { title: "Individual owner", description: <>I own and manage<br/>my properties.</>, icon: UserRound },
  { title: "Broker / real estate agent", description: <>I represent property<br/>owners and list for them.</>, icon: BriefcaseBusiness },
  { title: "Agency / company", description: <>My company manages<br/>multiple properties.</>, icon: Building2 },
  { title: "Hotel / serviced apartment operator", description: <>I operate hotels or<br/>serviced apartments.</>, icon: Hotel },
] as const;

function OwnerTypeOptions({value,onChange}:{value:string;onChange:(value:string)=>void}) {
  return <div className="mt-4 grid grid-cols-4 gap-3 max-[1250px]:grid-cols-2 max-[460px]:grid-cols-1">
    {ownerTypes.map(({title,description,icon:OwnerTypeIcon}) => {
      const selected = value === title;
      return <button
        type="button"
        key={title}
        aria-pressed={selected}
        onClick={()=>onChange(title)}
        className={`relative flex min-h-[132px] flex-col items-center justify-start rounded-md border px-2 pb-3 pt-4 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#6c4cf5] focus-visible:ring-offset-2 ${selected?"border-[#7b4cff] bg-[#faf8ff]":"border-[#e0e4ec] bg-white"}`}
      >
        {selected?<span className="absolute right-2 top-2 grid size-[16px] place-items-center rounded-full bg-[#5b2be0] text-white"><Check aria-hidden="true" size={10} strokeWidth={2.4}/></span>:null}
        <OwnerTypeIcon aria-hidden="true" size={22} strokeWidth={1.7} className={`mb-3 shrink-0 ${selected?"text-[#5b2be0]":"text-[#11183b]"}`}/>
        <span className="owner-label leading-[18px]">{title}</span>
        <span className="owner-helper mt-2 text-[#59637d]">{description}</span>
      </button>
    })}
  </div>
}

function IdentityVerification({files,errors,onFile}:{files:Record<string,string>;errors:string[];onFile:(key:string,name:string)=>void}) {
  const [previews,setPreviews]=useState<Record<string,string>>({});
  function selectFile(key:string,file?:File) {
    if (!file) return;
    setPreviews(current => {
      if (current[key]?.startsWith("blob:")) URL.revokeObjectURL(current[key]);
      return {...current,[key]:URL.createObjectURL(file)};
    });
    onFile(key,file.name);
  }
  const cards = [
    {
      key:"front", title:"National ID / Passport front", image:previews.front || "/id-front-placeholder.svg",
      status:"Uploaded", statusColor:"text-[#159447]", detail:"ID Number: 2980S151234567", icon:"check",
    },
    {
      key:"back", title:"National ID / Passport back", image:previews.back || "/id-back-placeholder.svg",
      status:"Needs review", statusColor:"text-[#d98100]", detail:"Uploaded on May 16, 2024", icon:"clock",
    },
  ];
  return <>
    <div className="mt-4 grid grid-cols-3 gap-3 max-[1100px]:grid-cols-1">
      {cards.map(card=><label key={card.key} className={`relative flex min-h-[174px] cursor-pointer flex-col items-center rounded-md border px-3 pb-3 pt-3 text-center outline-none focus-within:ring-2 focus-within:ring-[#6c4cf5] focus-within:ring-offset-2 ${errors.includes(card.key)?"border-red-400 bg-red-50":"border-[#dfe3eb]"}`}>
        <input type="file" accept="image/*" className="sr-only" onChange={event=>selectFile(card.key,event.target.files?.[0])}/>
        <b className="owner-label max-w-[150px] pr-3 leading-[18px]">{card.title}</b>
        {card.icon==="check"?<CheckCircle aria-hidden="true" size={18} strokeWidth={1.8} className="absolute right-2 top-2 text-[#159447]"/>:<Clock3 aria-hidden="true" size={18} strokeWidth={1.8} className="absolute right-2 top-2 text-[#e79516]"/>}
        <Image src={card.image} alt={`${card.title} preview`} width={150} height={82} unoptimized={card.image.startsWith("blob:")} className="mt-3 h-[82px] w-full max-w-[150px] rounded object-cover" quality={90}/>
        <span className={`owner-badge mt-2 ${card.statusColor}`}>{card.status}</span>
        <span className="owner-helper mt-1 text-[#56617b]">{card.detail}</span>
      </label>)}
      <div className={`relative flex min-h-[174px] flex-col items-center rounded-md border px-3 pb-3 pt-3 text-center ${errors.includes("selfie")?"border-red-400 bg-red-50":"border-[#dfe3eb]"}`}>
        <b className="owner-label leading-[18px]">Selfie verification</b>
        {files.selfie?<CheckCircle aria-hidden="true" size={18} strokeWidth={1.8} className="absolute right-2 top-2 text-[#159447]"/>:<Clock3 aria-hidden="true" size={18} strokeWidth={1.8} className="absolute right-2 top-2 text-[#e79516]"/>}
        <Image src={previews.selfie || "/owner-selfie-ahmed-reference.png"} alt="Owner selfie preview" width={88} height={88} unoptimized={Boolean(previews.selfie)} className="mt-3 size-[88px] rounded-[11px] object-cover object-center" quality={90}/>
        <label className="owner-button-text mt-2 grid h-[29px] w-full cursor-pointer place-items-center rounded border border-[#8b63ef] text-[#5522d9] outline-none focus-within:ring-2 focus-within:ring-[#6c4cf5] focus-within:ring-offset-1">
          <input type="file" accept="image/*" capture="user" className="sr-only" onChange={event=>selectFile("selfie",event.target.files?.[0])}/>
          Take / Upload selfie
        </label>
        <span className={`owner-badge mt-1 ${files.selfie?"text-[#159447]":"text-red-500"}`}>{files.selfie?"Uploaded":"Missing"}</span>
      </div>
    </div>
    <div className="mt-4">
      <b className="owner-label">Extracted details (OCR)</b>
      <div className="mt-2 grid grid-cols-3 gap-5 rounded-md border border-[#dfe3eb] px-4 py-3 max-[560px]:grid-cols-1 max-[560px]:gap-3">
        {[["Name","Ahmed Hassan Saeed"],["ID Number","2980S151234567"],["Expiry date","Aug 14, 2030"]].map(([label,value])=><div key={label} className="min-w-0"><span className="owner-helper block text-[#59637d]">{label}</span><span className="owner-body mt-1 block break-words">{value}</span></div>)}
      </div>
      <p className="owner-helper mt-2 flex items-center gap-2 text-[#59637d]"><LockKeyhole aria-hidden="true" size={14} strokeWidth={1.8}/>Your documents are encrypted and used only for verification purposes.</p>
    </div>
  </>;
}
