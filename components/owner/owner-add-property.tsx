"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/host-landing/icons";
import { Select } from "@/features/design-system";
import {
  deleteDraftAsset, getCompletionScore, getDraftErrors, getMissingItems,
  OwnerPropertyDraft, patchOwnerPropertyDraft, resolveDraftAsset, storeDraftAsset,
  useOwnerPropertyDraft, writeOwnerPropertyDraft,
} from "@/lib/owner-property-draft";

const steps = ["Basic details", "Location", "Photos", "Pricing", "Rules", "Documents", "Review"];
const amenities = ["Wi-Fi", "Air conditioning", "Kitchen", "Washing machine", "Smart TV", "Workspace", "Parking", "Pool", "Gym", "Balcony", "Security", "Cleaning service"];
const amenityIcons: Record<string, string> = { "Wi-Fi":"wifi", "Air conditioning":"snowflake", Kitchen:"kitchen", "Washing machine":"washing", "Smart TV":"tv", Workspace:"briefcase", Parking:"car", Pool:"pool", Gym:"dumbbell", Balcony:"building", Security:"shield", "Cleaning service":"check" };
const tips = ["Use real, bright photos", "Add clear rules and check-in info", "Keep prices competitive", "Respond quickly to guests"];
const cardFrame = "rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]";
const formCardFrame = "rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]";
const inputClass = "owner-input-text h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-xs outline-none transition hover:border-[var(--border-strong)] focus-visible:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/20 disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:opacity-60";

type DraftKey = keyof OwnerPropertyDraft;

export default function OwnerAddProperty() {
  const router = useRouter();
  const draft = useOwnerPropertyDraft();
  const [errors, setErrors] = useState<Partial<Record<DraftKey, string>>>({});
  const [feedback, setFeedback] = useState<{kind:"success"|"error"; text:string}|null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const completion = getCompletionScore(draft);
  const missingItems = getMissingItems(draft);

  function update<K extends DraftKey>(key: K, value: OwnerPropertyDraft[K]) {
    patchOwnerPropertyDraft({ [key]: value } as Pick<OwnerPropertyDraft, K>);
    setErrors((current) => ({...current, [key]: undefined}));
  }
  async function save() {
    if (saving) return; setSaving(true); setFeedback(null);
    const ok = writeOwnerPropertyDraft({...draft, status:"draft"});
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    setFeedback({kind:ok?"success":"error", text:ok?"Draft saved locally.":"Draft could not be saved. Check browser storage permissions."}); setSaving(false);
  }
  async function submit() {
    if (submitting) return;
    const nextErrors = getDraftErrors(draft); setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0] as DraftKey | undefined;
    if (first) {
      setFeedback({kind:"error", text:"Complete the highlighted requirements before submitting."});
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus()); return;
    }
    setSubmitting(true); setFeedback(null);
    const ok = writeOwnerPropertyDraft({...draft, status:"pending_review"});
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    if (!ok) { setFeedback({kind:"error", text:"Submission could not be saved locally."}); setSubmitting(false); return; }
    router.push("/owner/properties/publish");
  }

  return <div className="owner-add-property min-h-screen bg-[var(--background)] pb-36 text-[var(--foreground)] lg:pb-[72px]">
    <div className="owner-dashboard-content">
      <Header saving={saving} submitting={submitting} onSave={save} onPreview={()=>setPreviewOpen(true)} onSubmit={submit}/>
      <Steps />
      {feedback ? <div role={feedback.kind === "error" ? "alert" : "status"} className={`owner-body mt-3 rounded-lg border px-4 py-3 ${feedback.kind === "success" ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"}`}>{feedback.text}</div> : null}
      <div className="add-property-workspace mt-4 grid min-w-0 grid-cols-1 gap-4 min-[1500px]:grid-cols-[minmax(0,1fr)_300px]">
        <div className="add-property-sections min-w-0 space-y-3">
          <div className="grid min-w-0 grid-cols-1 gap-3 min-[1400px]:grid-cols-[minmax(0,1.18fr)_minmax(0,1fr)]"><div className="space-y-3"><BasicDetails draft={draft} errors={errors} update={update}/><Capacity draft={draft} errors={errors} update={update}/></div><Location draft={draft} errors={errors} update={update}/></div>
          <div className="add-property-photo-row grid min-w-0 grid-cols-1 gap-3 min-[1400px]:grid-cols-[minmax(0,1fr)_430px]"><Photos draft={draft} error={errors.photos} update={update} inputRef={photoInput}/><Amenities draft={draft} update={update}/></div>
          <div className="grid min-w-0 grid-cols-1 gap-3 min-[1400px]:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)]"><Pricing draft={draft} errors={errors} update={update}/><Rules draft={draft} errors={errors} update={update}/></div>
          <Documents draft={draft} error={errors.documents} update={update}/>
        </div>
        <RightRail draft={draft} completion={completion} missing={missingItems} onPreview={()=>setPreviewOpen(true)}/>
      </div>
    </div>
    <Bottom saving={saving} submitting={submitting} onSave={save} onPreview={()=>setPreviewOpen(true)} onSubmit={submit}/>
    {previewOpen ? <PreviewDialog draft={draft} completion={completion} onClose={()=>setPreviewOpen(false)}/> : null}
    <style jsx global>{`
      @media (min-width: 1500px) {
        .owner-add-property aside {
          position: sticky;
          top: 88px;
          display: block;
        }
        .owner-add-property aside > section + section {
          margin-top: 12px;
        }
      }
      .owner-add-property aside > section:first-child > div:nth-child(2) {
        height: 124px;
      }
      .owner-add-property aside > section:first-child > div:nth-child(2)::after {
        content: "Cover photo";
        position: absolute;
        left: 8px;
        bottom: 8px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.78);
        color: #fff;
        padding: 3px 9px;
        font-size: 0.6875rem;
        font-weight: 600;
        line-height: 1.25;
        z-index: 2;
      }
      .owner-add-property aside > section:first-child::after {
        content: "☆  No reviews yet";
        display: block;
        margin-top: 8px;
        color: var(--foreground-muted);
        font-size: 0.75rem;
        line-height: 1.4;
      }
      .owner-add-property aside > section:nth-child(3) > div > div {
        min-height: 36px;
      }
      .owner-add-property aside > section:nth-child(3) svg {
        color: var(--warning);
      }
      .owner-add-property aside > section:nth-child(4) > div {
        position: relative;
      }
      .owner-add-property aside > section:nth-child(4) > div::before {
        content: "";
        position: absolute;
        top: 9px;
        bottom: 10px;
        left: 5px;
        width: 1px;
        background: var(--border);
      }
      .owner-add-property aside > section:nth-child(4) > div > div {
        position: relative;
      }
      .owner-add-property aside > section:nth-child(4) > div > div > span:first-child {
        position: relative;
        z-index: 1;
        background: var(--surface);
      }
      .owner-add-property > div.fixed {
        min-height: 64px;
        padding-left: 20px;
        padding-right: 20px;
      }
      .owner-add-property > div.fixed > div {
        align-items: center;
      }
      @media (min-width: 768px) {
        .owner-add-property .add-property-photo-row > section:first-child > div:nth-child(2) > div:last-child {
          display: flex;
          min-width: 0;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: thin;
        }
        .owner-add-property .add-property-photo-row > section:first-child > div:nth-child(2) > div:last-child > div {
          width: 76px;
          min-width: 76px;
          height: 118px;
          flex: 0 0 76px;
          box-shadow: var(--shadow-sm);
        }
      }
    `}</style>
  </div>;
}

type Update = <K extends DraftKey>(key: K, value: OwnerPropertyDraft[K]) => void;
type FormProps = {draft:OwnerPropertyDraft; errors:Partial<Record<DraftKey,string>>; update:Update};

function Header({saving,submitting,onSave,onPreview,onSubmit}:{saving:boolean;submitting:boolean;onSave:()=>void;onPreview:()=>void;onSubmit:()=>void}) { return <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="owner-helper">Owner Dashboard <span className="mx-2.5">/</span> My Properties <span className="mx-2.5">/</span> <b className="text-[var(--foreground)]">Add Property</b></div><h1 className="owner-page-title mt-2.5">Add a new property</h1><p className="owner-page-description mt-1">Complete the details below. DAR will review the listing before it goes live.</p></div><Actions saving={saving} submitting={submitting} onSave={onSave} onPreview={onPreview} onSubmit={onSubmit}/></header>; }
function Actions({saving,submitting,onSave,onPreview,onSubmit}:{saving:boolean;submitting:boolean;onSave:()=>void;onPreview:()=>void;onSubmit:()=>void}) { return <div className="flex flex-wrap items-center gap-2 sm:gap-3"><Action icon="receipt" disabled={saving||submitting} onClick={onSave}>{saving?"Saving...":"Save draft"}</Action><Action icon="play" disabled={submitting} onClick={onPreview}>Preview</Action><Action icon="navigation" primary disabled={submitting} onClick={onSubmit}>{submitting?"Submitting...":"Submit for review"}</Action></div>; }
function Action({children,icon,primary,disabled,onClick}:{children:string;icon:string;primary?:boolean;disabled?:boolean;onClick:()=>void}) { return <button type="button" disabled={disabled} onClick={onClick} className={`owner-card-title flex h-9 items-center gap-2 whitespace-nowrap rounded-md px-3 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none sm:px-5 ${primary?"bg-[var(--brand)] !text-[#FFFFFF] active:bg-[var(--brand-strong)] disabled:!text-[#FFFFFF]":"border border-[var(--border)] bg-[var(--surface)] active:bg-[var(--surface-muted)]"}`}><Icon name={icon} className="size-4"/>{children}</button>; }
function Steps(){return <div className="mt-4 overflow-x-auto px-1 pb-2 sm:px-9"><div className="grid min-w-[700px] grid-cols-7">{steps.map((s,i)=><div className="relative text-center" key={s}>{i<6?<span className="absolute left-1/2 right-[-50%] top-2.5 h-px bg-[var(--border-strong)]"/>:null}<span className={`owner-button-text relative z-10 mx-auto grid size-5 place-items-center rounded-full border ${i===0?"border-[var(--brand)] bg-[var(--brand)] text-white":"border-[var(--border-strong)] bg-[var(--surface)]"}`}>{i+1}</span><p className={`owner-label mt-2 ${i===0?"text-[var(--brand)]":""}`}>{s}</p></div>)}</div></div>}
function Title({n,title}:{n:string;title:string}){return <div className="flex items-center gap-2"><span className="owner-button-text grid size-5 place-items-center rounded-full border border-[var(--brand)]/30 text-[var(--brand)]">{n}</span><h2 className="owner-card-title">{title}</h2></div>}

function Field({name,label,value,onChange,error,type="text",maxLength}:{name:DraftKey;label:string;value:string;onChange:(v:string)=>void;error?:string;type?:"text"|"number";maxLength?:number}) { const id=`owner-${String(name)}`; return <label className="block"><span className="owner-label mb-1 block">{label}</span><input data-field={name} id={id} value={value} onChange={(e)=>onChange(e.target.value)} type={type} min={type==="number"?0:undefined} maxLength={maxLength} aria-invalid={Boolean(error)} aria-describedby={error?`${id}-error`:undefined} className={`${inputClass} ${error?"border-danger focus-visible:border-danger focus-visible:ring-danger/20":""}`}/>{error?<span id={`${id}-error`} className="owner-badge mt-1 block text-danger">{error}</span>:null}</label>; }
function TextArea({name,label,value,onChange,error,maxLength}:{name:DraftKey;label:string;value:string;onChange:(v:string)=>void;error?:string;maxLength:number}) { const id=`owner-${String(name)}`; return <label className="block"><span className="owner-label mb-1 block">{label}</span><div className="relative"><textarea data-field={name} id={id} value={value} maxLength={maxLength} onChange={(e)=>onChange(e.target.value)} aria-invalid={Boolean(error)} className={`${inputClass} h-[110px] resize-none py-2.5 pr-14 ${error?"border-danger":""}`}/><span className="owner-badge absolute bottom-2 right-3">{value.length}/{maxLength}</span></div>{error?<span className="owner-badge mt-1 block text-danger">{error}</span>:null}</label>; }
function SelectField({name,label,value,onChange,error,options}:{name:DraftKey;label:string;value:string;onChange:(v:string)=>void;error?:string;options:string[]}) { return <div data-field={name} tabIndex={-1}><Select label={label} value={value} onChange={(e:ChangeEvent<HTMLSelectElement>)=>onChange(e.target.value)} error={error} options={options.map(v=>({label:v,value:v}))} className="h-8 rounded-md px-3 py-0 text-xs"/></div>; }
function Switch({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}){return <button type="button" role="switch" aria-checked={checked} onClick={()=>onChange(!checked)} className="owner-label mt-2.5 flex w-full items-center justify-between gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"><span>{label}</span><span className={`flex h-4 w-8 items-center rounded-full p-0.5 transition ${checked?"justify-end bg-[var(--brand)]":"justify-start bg-[var(--border-strong)]"}`}><i className="size-3 rounded-full bg-white"/></span></button>}

function BasicDetails({draft,errors,update}:FormProps){return <section className={`px-4 pb-4 pt-3.5 ${formCardFrame}`}><Title n="1" title="Basic details"/><div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_124px_194px]"><Field name="title" label="Listing title *" value={draft.title} onChange={v=>update("title",v)} error={errors.title}/><SelectField name="propertyType" label="Property type *" value={draft.propertyType} onChange={v=>update("propertyType",v)} error={errors.propertyType} options={["Studio","Apartment","Villa","Hotel"]}/><div><span className="owner-label mb-1 block">Category *</span><div className="grid h-8 grid-cols-[minmax(0,1fr)_54px] overflow-hidden rounded-md border border-[var(--border)]">{["Studios & Apartments","Hotels"].map(v=><button type="button" key={v} aria-pressed={draft.category===v} onClick={()=>update("category",v)} className={`owner-label min-w-0 whitespace-nowrap px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)] ${draft.category===v?"bg-[var(--brand-soft)] text-[var(--brand)]":"bg-[var(--surface)]"}`}>{v}</button>)}</div></div></div><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_194px]"><TextArea name="description" label="Description *" value={draft.description} onChange={v=>update("description",v)} error={errors.description} maxLength={1000}/><div className="space-y-2"><SelectField name="city" label="City *" value={draft.city} onChange={v=>update("city",v)} error={errors.city} options={["Madinaty","Cairo","New Cairo","Giza"]}/><SelectField name="neighborhood" label="Neighborhood / Area *" value={draft.neighborhood} onChange={v=>update("neighborhood",v)} error={errors.neighborhood} options={["B6","B7","B8","Zamalek","Maadi"]}/><SelectField name="building" label="Building / Compound" value={draft.building} onChange={v=>update("building",v)} options={["Madinaty Heights","Eastown","Palm Hills","Other"]}/></div></div></section>}
function Capacity({draft,errors,update}:FormProps){const nums=["1","2","3","4","5","6","8","10"];return <section className={`px-4 pb-4 pt-3.5 ${formCardFrame}`}><Title n="2" title="Capacity & rooms"/><div className="mt-3.5 grid grid-cols-2 gap-3 md:grid-cols-4">{([['guests','Guests max *'],['bedrooms','Bedrooms *'],['beds','Beds *'],['bathrooms','Bathrooms *']] as [DraftKey,string][]).map(([k,l])=><SelectField key={k} name={k} label={l} value={String(draft[k])} onChange={v=>update(k,v as never)} error={errors[k]} options={nums}/>)}</div><div className="mt-3 grid grid-cols-2 items-end gap-3 md:grid-cols-[124px_124px_1fr]"><Field name="size" label="Size (m²) *" type="number" value={draft.size} onChange={v=>update("size",v)} error={errors.size}/><Field name="floor" label="Floor number" type="number" value={draft.floor} onChange={v=>update("floor",v)} error={errors.floor}/><Switch label="Elevator available" checked={draft.elevator} onChange={v=>update("elevator",v)}/></div></section>}
function Location({draft,errors,update}:FormProps){return <section className={`flex h-full flex-col p-3 ${cardFrame}`}><Title n="3" title="Location"/><Field name="address" label="Full address *" value={draft.address} onChange={v=>{update("address",v);update("addressConfirmed",false)}} error={errors.address}/><button type="button" data-field="addressConfirmed" onClick={()=>update("addressConfirmed",!draft.addressConfirmed)} className="relative mt-2 h-[190px] overflow-hidden rounded-lg bg-[#f4f1eb] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"><div className="absolute inset-0 [background:linear-gradient(26deg,transparent_0_30%,#ded8cf_31%_32%,transparent_33%_60%,#cdeaf7_61%_63%,transparent_64%),linear-gradient(116deg,transparent_0_43%,#ded8cf_44%_45%,transparent_46%),#f4f1eb]"/><span className="absolute left-[23%] top-[43%] text-[15px] text-[#78879a]">{draft.city}</span><span className="absolute left-1/2 top-[36%] grid size-7 rotate-45 place-items-center rounded-[50%_50%_50%_0] bg-[var(--brand)]"><Icon name="navigation" className="size-3 -rotate-45 text-white"/></span><span className="owner-badge absolute right-3 top-3 rounded-md bg-white/95 px-3 py-2 shadow-[var(--shadow-card)]"><b>Address confidence</b><span className={`mt-1 block ${draft.addressConfirmed?"text-success":"text-warning"}`}>{draft.addressConfirmed?"● 92% High":"○ Confirm pin"}</span></span></button><p className="owner-label mt-3">Nearby landmarks (optional)</p><div className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-3"><Field name="mall" label="Mall" value={draft.mall} onChange={v=>update("mall",v)}/><Field name="transport" label="Transport" value={draft.transport} onChange={v=>update("transport",v)}/><Field name="restaurants" label="Restaurants" value={draft.restaurants} onChange={v=>update("restaurants",v)}/></div><label className="owner-label mt-2.5 flex items-center gap-2"><input type="checkbox" checked={draft.approximateLocation} onChange={e=>update("approximateLocation",e.target.checked)} className="size-4 accent-[var(--brand)]"/>Show approximate location publicly until booking is confirmed</label></section>}

function Photos({draft,error,update,inputRef}:{draft:OwnerPropertyDraft;error?:string;update:Update;inputRef:React.RefObject<HTMLInputElement|null>}){const [urls,setUrls]=useState<Record<string,string>>({});useEffect(()=>{let active=true;const created:string[]=[];Promise.all(draft.photos.map(async p=>{const url=await resolveDraftAsset(p);if(url.startsWith("blob:"))created.push(url);return [p.id,url] as const})).then(items=>{if(active)setUrls(Object.fromEntries(items))});return()=>{active=false;created.forEach(URL.revokeObjectURL)}},[draft.photos]);async function add(files:FileList|File[]){const valid=Array.from(files).filter(f=>f.type.startsWith("image/")&&f.size<=10*1024*1024).slice(0,30-draft.photos.length);if(!valid.length)return;try{const assets=await Promise.all(valid.map(storeDraftAsset));update("photos",[...draft.photos,...assets]);if(!draft.coverPhotoId)update("coverPhotoId",assets[0].id)}catch{}}function drop(e:DragEvent){e.preventDefault();void add(e.dataTransfer.files)}function move(i:number,d:number){const next=[...draft.photos];const j=i+d;if(j<0||j>=next.length)return;[next[i],next[j]]=[next[j],next[i]];update("photos",next)}return <section className={`min-w-0 overflow-hidden p-3 ${cardFrame}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Title n="4" title="Photos"/><div className="owner-badge flex flex-wrap items-center gap-4"><span>Photo quality <b className="text-success">{Math.min(10,draft.photos.length+4)}/10 Good</b></span><Switch label="AI enhance" checked={draft.aiEnhance} onChange={v=>update("aiEnhance",v)}/></div></div><div className="mt-2.5 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[140px_90px_minmax(0,1fr)]"><button type="button" data-field="photos" onClick={()=>inputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={drop} className="grid h-[124px] place-items-center rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"><span><Icon name="cloud-upload" className="mx-auto size-9 text-[var(--brand)]"/><span className="owner-badge mt-2 block">Drag & drop photos here<br/><b className="text-[var(--brand)]">or click to browse</b></span></span></button><input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>e.target.files&&void add(e.target.files)}/><div className="owner-badge"><b>Required photos</b>{["Cover photo","Bedroom","Bathroom","Kitchen / Living area","Exterior / Building"].map((x,i)=><p className="mt-2 flex gap-2" key={x}><span className={i<draft.photos.length?"text-success":"text-[var(--foreground-subtle)]"}>○</span>{x}</p>)}</div><div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">{draft.photos.map((p,i)=><div key={p.id} className="group relative h-[124px] overflow-hidden rounded-md bg-[var(--surface-muted)]"><Image src={urls[p.id]??p.builtInUrl??"/property-studio-reference.png"} alt={p.name} fill unoptimized={Boolean(urls[p.id]?.startsWith("blob:"))} className="object-cover"/><div className="absolute inset-x-1 top-1 flex justify-between"><span className="flex gap-1"><button type="button" disabled={i===0} onClick={()=>move(i,-1)} aria-label={`Move ${p.name} left`} className="grid size-5 place-items-center rounded-full bg-white disabled:opacity-40">‹</button><button type="button" disabled={i===draft.photos.length-1} onClick={()=>move(i,1)} aria-label={`Move ${p.name} right`} className="grid size-5 place-items-center rounded-full bg-white disabled:opacity-40">›</button></span><button type="button" onClick={()=>{void deleteDraftAsset(p.id);const next=draft.photos.filter(x=>x.id!==p.id);update("photos",next);if(draft.coverPhotoId===p.id)update("coverPhotoId",next[0]?.id??"")}} aria-label={`Delete ${p.name}`} className="grid size-5 place-items-center rounded-full bg-white"><Icon name="x" className="size-3"/></button></div><button type="button" onClick={()=>update("coverPhotoId",p.id)} className={`owner-badge absolute bottom-1 left-1 rounded px-2 py-1 ${draft.coverPhotoId===p.id?"bg-[var(--brand)] text-white":"bg-white"}`}>{draft.coverPhotoId===p.id?"Cover":"Set cover"}</button></div>)}</div></div>{error?<p className="owner-badge mt-2 text-danger">{error}</p>:null}</section>}
function Amenities({draft,update}:{draft:OwnerPropertyDraft;update:Update}){return <section className={`min-w-0 p-3 ${cardFrame}`}><Title n="5" title="Amenities"/><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">{amenities.map(a=>{const checked=draft.amenities.includes(a);return <label key={a} className="owner-badge flex h-8 items-center gap-1 rounded-md border border-[var(--border)] px-1.5 transition hover:shadow-[var(--shadow-card)]"><input type="checkbox" checked={checked} onChange={()=>update("amenities",checked?draft.amenities.filter(x=>x!==a):[...draft.amenities,a])} className="size-4 accent-[var(--brand)]"/><Icon name={amenityIcons[a]} className="size-3 text-[var(--brand)]"/>{a}</label>})}</div></section>}
function Pricing({draft,errors,update}:FormProps){return <section className={`p-3 ${cardFrame}`}><div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]"><div><Title n="6" title="Pricing & availability"/><div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">{([['nightlyPrice','Nightly price (EGP) *'],['weekendPrice','Weekend price (EGP)'],['cleaningFee','Cleaning fee (EGP)'],['minimumNights','Minimum nights'],['maximumNights','Maximum nights'],['monthlyDiscount','Monthly discount (%)']] as [DraftKey,string][]).map(([k,l])=><Field key={k} name={k} label={l} type="number" value={String(draft[k])} onChange={v=>update(k,v as never)} error={errors[k]}/>)}</div><Switch label="Instant booking" checked={draft.instantBooking} onChange={v=>update("instantBooking",v)}/><p className="owner-helper mt-1">Accept bookings automatically.</p></div><Calendar/></div></section>}
function Calendar(){return <div className="border-t border-[var(--border)] pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0"><div className="owner-label flex justify-between"><span>Calendar preview</span><span>Available　<span className="text-[var(--brand)]">■ Booked</span></span></div><div className="owner-label mt-3 text-center">May 2026</div><div className="owner-badge mt-2 grid grid-cols-7 gap-1 text-center">{["Su","Mo","Tu","We","Th","Fr","Sa",...Array.from({length:35},(_,i)=>String(i+1))].map((d,i)=><span className={i>26&&i<33?"rounded bg-[var(--brand-soft)] text-[var(--brand)]":""} key={`${d}-${i}`}>{d}</span>)}</div></div>}
function Rules({draft,errors,update}:FormProps){return <section className={`p-3 ${cardFrame}`}><Title n="7" title="House rules"/><div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2"><SelectField name="checkIn" label="Check-in time" value={draft.checkIn} onChange={v=>update("checkIn",v)} options={["After 12:00 PM","After 2:00 PM","After 3:00 PM"]}/><SelectField name="checkOut" label="Check-out time" value={draft.checkOut} onChange={v=>update("checkOut",v)} options={["Before 10:00 AM","Before 11:00 AM","Before 12:00 PM"]}/></div><div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-[170px_1fr]"><div>{([['smoking','Smoking allowed'],['parties','Parties allowed'],['pets','Pets allowed'],['idRequired','ID required']] as [DraftKey,string][]).map(([k,l])=><Switch key={k} label={l} checked={Boolean(draft[k])} onChange={v=>update(k,v as never)}/>)}</div><TextArea name="customRules" label="Custom rules" value={draft.customRules} onChange={v=>update("customRules",v)} maxLength={300}/></div><div className="mt-2"><SelectField name="cancellationPolicy" label="Cancellation policy" value={draft.cancellationPolicy} onChange={v=>update("cancellationPolicy",v)} error={errors.cancellationPolicy} options={["Flexible","Moderate","Strict"]}/></div></section>}

const docConfig=[['ownerId','Owner ID (Required)'],['ownership','Ownership / Authorization (Required)'],['utility','Utility bill (Optional)'],['hotelLicense','Hotel license (Optional for hotels)']] as const;
function Documents({draft,error,update}:{draft:OwnerPropertyDraft;error?:string;update:Update}){async function upload(key:string,files:FileList|null){const file=files?.[0];if(!file||file.size>10*1024*1024||!(["application/pdf","image/jpeg","image/png"].includes(file.type)))return;const asset=await storeDraftAsset(file);update("documents",{...draft.documents,[key]:asset})}return <section className={`p-3 ${cardFrame}`}><div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_330px]"><div><Title n="6" title="Documents & verification"/><div data-field="documents" tabIndex={-1} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{docConfig.map(([key,title])=>{const file=draft.documents[key];return <label key={key} className="grid cursor-pointer grid-cols-[38px_1fr] gap-2 rounded-lg border border-[var(--border)] p-2 transition hover:shadow-[var(--shadow-card-hover)] focus-within:ring-2 focus-within:ring-[var(--brand)]"><span className="grid size-9 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--brand)]"><Icon name="receipt" className="size-4"/></span><span><span className="owner-badge block">{title}</span><span className={`owner-button-text mt-1 block ${file?"text-success":"text-[var(--brand)]"}`}>{file?.name??"Upload"}</span></span><input className="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>void upload(key,e.target.files)}/></label>})}</div>{error?<p className="owner-badge mt-2 text-danger">{error}</p>:null}</div><div className="border-t border-[var(--border)] pt-4 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0"><p className="owner-card-title">Verification status</p><div className="mt-4 flex justify-between"><div><p className="owner-label">Overall status</p><span className="owner-label mt-2 inline-flex rounded-md bg-warning/10 px-3 py-1 text-warning">{draft.status==="pending_review"?"Pending review":"Draft"}</span></div><Icon name="shield" className="size-12 text-warning"/></div></div></div></section>}

function useCover(draft:OwnerPropertyDraft){const cover=draft.photos.find(p=>p.id===draft.coverPhotoId)??draft.photos[0];const [src,setSrc]=useState(cover?.builtInUrl??"/property-studio-reference.png");useEffect(()=>{let active=true;let created="";if(cover)resolveDraftAsset(cover).then(url=>{created=url;if(active)setSrc(url)});return()=>{active=false;if(created.startsWith("blob:"))URL.revokeObjectURL(created)}},[cover]);return src}
function RightRail({draft,completion,missing,onPreview}:{draft:OwnerPropertyDraft;completion:number;missing:string[];onPreview:()=>void}){const cover=useCover(draft);return <aside className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 min-[1800px]:sticky min-[1800px]:top-6 min-[1800px]:block min-[1800px]:space-y-3"><section className={`p-3 ${cardFrame}`}><div className="flex justify-between"><h2 className="owner-card-title">Listing preview</h2><button type="button" onClick={onPreview} className="owner-button-text text-[var(--brand)]">Edit preview</button></div><div className="relative mt-2.5 h-[132px] overflow-hidden rounded-lg"><Image src={cover} alt="Property cover" fill unoptimized={cover.startsWith("blob:")} className="object-cover"/></div><h3 className="owner-card-title mt-2.5">{draft.title||"Untitled property"}</h3><p className="owner-helper mt-1">{[draft.neighborhood,draft.city].filter(Boolean).join(", ")}</p><div className="mt-2.5 flex justify-between"><p className="owner-card-title">EGP {Number(draft.nightlyPrice||0).toLocaleString()} / night</p><span className="owner-button-text rounded-md bg-warning/10 px-3 py-1 text-warning">{draft.status==="pending_review"?"Pending review":"Draft"}</span></div></section><section className={`p-3 ${cardFrame}`}><div className="flex justify-between"><h2 className="owner-card-title">Completion score</h2><button type="button" onClick={()=>document.querySelector<HTMLElement>('[data-field]')?.focus()} className="owner-badge text-[var(--brand)]">View all requirements</button></div><p className="owner-label mt-1.5">{completion}% complete</p><div className="mt-2.5 h-1.5 rounded-full bg-[var(--surface-muted)]"><div style={{width:`${completion}%`}} className="h-full rounded-full bg-[var(--brand)]"/></div></section><List title="Missing items" items={missing.length?missing:["All requirements complete"]}/><Timeline status={draft.status}/><List title="Tips for a successful listing" items={tips}/></aside>}
function List({title,items}:{title:string;items:string[]}){return <section className={`p-3 ${cardFrame}`}><h2 className="owner-card-title">{title}</h2><div className="mt-2.5 divide-y divide-[var(--border)]">{items.map(x=><div className="owner-label flex min-h-8 items-center gap-3" key={x}><Icon name={title==="Missing items"?"receipt":"star"} className="size-4 text-[var(--brand)]"/><span>{x}</span></div>)}</div></section>}
function Timeline({status}:{status:string}){const items=["Draft","Submitted","DAR review","Approved","Live"];return <section className={`p-3 ${cardFrame}`}><h2 className="owner-card-title">Approval timeline</h2><div className="mt-3 space-y-3">{items.map((x,i)=>{const active=status==="pending_review"?i<=1:i===0;return <div className="owner-label flex gap-3" key={x}><span className={`mt-1 size-3 rounded-full border ${active?"border-[var(--brand)] bg-[var(--brand)]":"border-[var(--border-strong)]"}`}/><span>{x}<small className="owner-helper block">{i===0?"In progress":i===1?"Pending":i===2?"Up to 2 business days":i===3?"You'll be notified":"Visible to guests"}</small></span></div>})}</div></section>}
function Bottom({saving,submitting,onSave,onPreview,onSubmit}:{saving:boolean;submitting:boolean;onSave:()=>void;onPreview:()=>void;onSubmit:()=>void}){return <div className="fixed bottom-16 left-0 right-0 z-20 border-t border-[var(--border)] bg-[var(--surface)]/95 px-3 py-3 backdrop-blur lg:bottom-0 lg:left-[var(--sidebar-width)]"><div className="mx-auto flex max-w-[var(--page-max-width)] justify-between"><p className="owner-helper hidden items-center gap-2 lg:flex">✓ All changes can be saved locally</p><Actions saving={saving} submitting={submitting} onSave={onSave} onPreview={onPreview} onSubmit={onSubmit}/></div></div>}
function PreviewDialog({draft,completion,onClose}:{draft:OwnerPropertyDraft;completion:number;onClose:()=>void}){const cover=useCover(draft);const dialogRef=useRef<HTMLDialogElement>(null);useEffect(()=>{const dialog=dialogRef.current;if(!dialog)return;dialog.showModal();const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();dialog.close();onClose()}};window.addEventListener("keydown",escape);return()=>{window.removeEventListener("keydown",escape);if(dialog.open)dialog.close()}},[onClose]);function close(){dialogRef.current?.close();onClose()}return <dialog ref={dialogRef} aria-labelledby="preview-title" onCancel={(e)=>{e.preventDefault();close()}} onClick={(e)=>{if(e.target===e.currentTarget)close()}} className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-auto rounded-xl bg-[var(--surface)] p-5 text-[var(--foreground)] shadow-[var(--shadow-floating)] backdrop:bg-black/40"><div className="flex justify-between"><h2 id="preview-title" className="owner-section-title">Listing preview</h2><button type="button" aria-label="Close preview" onClick={close} className="grid size-9 place-items-center rounded-full transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]"><Icon name="x" className="size-4"/></button></div><div className="relative mt-4 h-64 overflow-hidden rounded-lg"><Image src={cover} alt="Property cover" fill unoptimized={cover.startsWith("blob:")} className="object-cover"/></div><h3 className="owner-page-title mt-4">{draft.title||"Untitled property"}</h3><p className="owner-body mt-2">{draft.address}</p><p className="owner-section-title mt-3">EGP {Number(draft.nightlyPrice||0).toLocaleString()} / night</p><div className="owner-body mt-4 flex flex-wrap gap-3">{draft.amenities.map(x=><span className="rounded-full bg-[var(--brand-soft)] px-3 py-1" key={x}>{x}</span>)}</div><p className="owner-body mt-4">{draft.customRules}</p><p className="owner-label mt-4">{completion}% complete · {draft.status==="pending_review"?"Pending review":"Draft"}</p></dialog>}
