"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ChartNoAxesColumnIncreasing, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, CircleCheckBig, Clock3, Info, Landmark, Search as SearchIcon, TriangleAlert, WalletCards } from "lucide-react";
import { Icon } from "@/components/host-landing/icons";
import { Card, OwnerShell } from "@/components/owner/owner-shell";
import { payouts, properties } from "@/lib/dar-data";

const money = (n:number) => `EGP ${n.toLocaleString()}`;
function generateDownload(name:string, content:string, type="text/plain"){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
const payoutSummaryCards = [
  { label:"Available to withdraw", value:"EGP 24,800", icon:WalletCards, size:26, iconClass:"text-[#6c4cf5]", wrapClass:"" },
  { label:"Upcoming payouts", value:"EGP 18,450", icon:CalendarDays, size:26, iconClass:"text-[#6c4cf5]", wrapClass:"" },
  { label:"Paid this month", value:"EGP 42,300", icon:CircleCheckBig, size:28, iconClass:"text-[#2d9b50]", wrapClass:"size-11 rounded-full bg-[#eef9f1]" },
  { label:"Pending verification", value:"EGP 6,900", icon:Clock3, size:28, iconClass:"text-[#efa125]", wrapClass:"size-11 rounded-full bg-[#fff7e9]" },
  { label:"Failed payout", value:"EGP 2,400", icon:TriangleAlert, size:28, iconClass:"text-[#f0645f]", wrapClass:"size-11 rounded-full bg-[#fff0ef]" },
  { label:"Total lifetime earnings", value:"EGP 286,700", icon:ChartNoAxesColumnIncreasing, size:27, iconClass:"text-[#6c4cf5]", wrapClass:"" },
] as const;

export default function PayoutsPage(){
  const [search,setSearch]=useState(""); const [status,setStatus]=useState("All"); const [method,setMethod]=useState("All methods"); const [property,setProperty]=useState("All properties"); const [date,setDate]=useState("May 01, 2026 - May 31, 2026");
  const [applied,setApplied]=useState({search:"",status:"All",method:"All methods",property:"All properties",date:"May 01, 2026 - May 31, 2026"}); const [selected,setSelected]=useState(payouts[0]);
  const [modal,setModal]=useState(false); const [payMethod,setPayMethod]=useState("InstaPay"); const [toast,setToast]=useState(""); const [holdReason,setHoldReason]=useState<typeof payouts[number] | null>(null);
  const shown=useMemo(()=>payouts.filter(p=>(!applied.search||JSON.stringify(p).toLowerCase().includes(applied.search.toLowerCase()))&&(applied.status==="All"||p.status===applied.status)&&(applied.method==="All methods"||p.method===applied.method)&&(applied.property==="All properties"||p.property===applied.property)),[applied]);
  const notify=(x:string)=>{setToast(x);setTimeout(()=>setToast(""),2300)};
  const exportCsv=()=>generateDownload("dar-payouts.csv",["Payout ID,Booking,Property,Net payout,Status",...shown.map(p=>`${p.id},${p.booking},"${p.property}",${p.net},${p.status}`)].join("\n"),"text/csv");
  const actions=<><button onClick={()=>generateDownload("dar-owner-statement.txt","DAR Owner Statement - May 2026")} className="owner-button-text flex h-10 items-center gap-2 rounded border border-[#ccd2dd] px-4"><Icon name="download" className="size-4"/>Download statement</button><button onClick={exportCsv} className="owner-button-text flex h-10 items-center gap-2 rounded border border-[#ccd2dd] px-4"><Icon name="upload" className="size-4"/>Export payouts</button><button onClick={()=>setModal(true)} className="owner-button-text h-10 rounded bg-[#5522d9] px-5 text-white">Update payout method</button></>;
  return <OwnerShell active="Payments" wide fluid><div className="owner-dashboard-content">
    <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
      <div><h1 className="owner-page-title">Owner payouts</h1><p className="owner-page-description text-[#5d667d]">Track upcoming payouts, payout history, failed transfers and downloadable statements.</p></div>
      <div className="flex flex-wrap justify-end gap-3 max-[760px]:justify-start">{actions}</div>
    </div>
    <div className="mt-5 grid grid-cols-6 gap-3 max-[1100px]:grid-cols-3 max-[600px]:grid-cols-2">
      {payoutSummaryCards.map(({label,value,icon:SummaryIcon,size,iconClass,wrapClass})=><Card key={label} className="p-4">
        <div className="flex min-h-[52px] items-center justify-between gap-3">
          <span className="min-w-0"><p className="owner-helper">{label}</p><b className="owner-number-sm mt-2 block whitespace-nowrap">{value}</b></span>
          <span className={`grid shrink-0 place-items-center ${wrapClass}`}>
            <SummaryIcon aria-hidden="true" size={size} strokeWidth={1.8} className={iconClass}/>
          </span>
        </div>
      </Card>)}
    </div>
    <Card className="mt-3 p-4">
      <div className="grid grid-cols-[minmax(300px,1.4fr)_minmax(150px,.6fr)_minmax(170px,.7fr)_minmax(240px,1fr)_minmax(180px,.8fr)] items-end gap-4 max-[1400px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label className="relative block">
          <SearchIcon aria-hidden="true" size={18} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8498]"/>
          <input value={search} onChange={e=>{const next=e.target.value;setSearch(next);setApplied(current=>({...current,search:next}))}} placeholder="Search payout ID, booking ID, guest, statement..." className="owner-input-text h-10 w-full rounded-md border border-[#dce1e9] pl-10 pr-3 outline-none focus:border-[#7b4cff]"/>
        </label>
        <Select label="Status" value={status} onChange={setStatus} options={["All","Upcoming","Paid","Processing","Failed","On hold"]}/>
        <Select label="Method" value={method} onChange={setMethod} options={["All methods","InstaPay","Bank transfer","Vodafone Cash","Paymob","Meeza"]}/>
        <label className="relative block">
          <input type="text" value={date} onChange={e=>setDate(e.target.value)} className="owner-input-text h-10 w-full rounded-md border border-[#dce1e9] px-3 pr-10 outline-none focus:border-[#7b4cff]"/>
          <CalendarDays aria-hidden="true" size={18} strokeWidth={1.8} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#59637d]"/>
        </label>
        <Select label="Property" value={property} onChange={setProperty} options={["All properties",...properties.map(p=>p.name)]}/>
      </div>
      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              ["All",""],
              ["Upcoming","bg-[#f29b18]"],
              ["Paid","bg-[#2fa84f]"],
              ["Processing","bg-[#6c3ee8]"],
              ["Failed","bg-[#ef3e3e]"],
              ["On hold","bg-[#9da3ae]"],
            ].map(([chip,dot])=><button key={chip} onClick={()=>{setStatus(chip);setApplied(current=>({...current,status:chip}))}} className={`owner-button-text flex h-9 items-center gap-2 whitespace-nowrap rounded-[10px] border px-3 transition-colors ${status===chip?"border-[#6d3bea] bg-[#faf8ff] text-[#5522d9]":"border-[#dce1e9] bg-white text-[#17213d]"}`}>{dot?<span className={`size-2 shrink-0 rounded-full ${dot}`}/>:null}{chip}</button>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["All","InstaPay","Bank transfer","Vodafone Cash","Paymob","Meeza"].map(chip=>{
              const value=chip==="All"?"All methods":chip;
              const selectedMethod=method===value;
              return <button key={chip} onClick={()=>{setMethod(value);setApplied(current=>({...current,method:value}))}} className={`owner-button-text h-9 whitespace-nowrap rounded-[10px] border px-3 transition-colors ${selectedMethod?"border-[#6d3bea] bg-[#faf8ff] text-[#5522d9]":"border-[#dce1e9] bg-white text-[#17213d]"}`}>{chip}</button>;
            })}
          </div>
          <button onClick={()=>setApplied({search,status,method,property,date})} className="owner-button-text ml-auto h-9 whitespace-nowrap rounded-[8px] bg-[#5522d9] px-5 text-white transition-colors hover:bg-[#4518bd]">Apply filters</button>
          <button onClick={()=>{setSearch("");setStatus("All");setMethod("All methods");setDate("");setProperty("All properties");setApplied({search:"",status:"All",method:"All methods",property:"All properties",date:""})}} className="owner-button-text h-9 whitespace-nowrap rounded-[8px] border border-[#dce1e9] bg-white px-4 text-[#5522d9] transition-colors hover:bg-[#f7f3ff]">Clear all</button>
        </div>
      </div>
    </Card>
    <div className="mt-5 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-5 max-[1849px]:grid-cols-1">
      <div className="min-w-0 space-y-3">
        <PayoutHistoryTable
          rows={shown}
          selected={selected}
          onSelect={setSelected}
          activeStatus={applied.status}
          onStatusChange={x=>{setStatus(x);setApplied({...applied,status:x})}}
          onDownload={p=>generateDownload(`${p.id}-receipt.txt`,`DAR payout receipt\nPayout: ${p.id}\nBooking: ${p.booking}\nNet payout: ${money(p.net)}`)}
          onRetry={()=>setModal(true)}
          onHoldReason={setHoldReason}
        />
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-4 max-[1199px]:grid-cols-2 max-[700px]:grid-cols-1">
          <PayoutMethod payMethod={payMethod} setPayMethod={setPayMethod} onEdit={()=>setModal(true)}/>
          <Card className="p-4">
            <div className="flex items-baseline gap-1.5"><b className="owner-card-title">Earnings summary</b><span className="owner-helper text-[#6f788c]">(Last 6 months)</span></div>
            <div className="owner-helper mt-4 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#5522d9]"/>Gross earnings</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#2fa84f]"/>Net payouts</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#e6a334]"/>DAR commission</span>
            </div>
            <div className="mt-4 flex h-32 items-end justify-around border-b border-[#dfe3eb]">{[88,88,76,64,64,51].map((h,i)=><div key={i} className="flex items-end gap-0.5"><span className="w-2.5 bg-[#5522d9]" style={{height:h}}/><span className="w-2.5 bg-[#2fa84f]" style={{height:h*.65}}/><span className="w-2.5 bg-[#e6a334]" style={{height:h*.36}}/></div>)}</div>
            <div className="owner-helper mt-2 flex justify-around">{["Jan","Feb","Mar","Apr","May","Jun"].map(x=><span key={x}>{x}</span>)}</div>
          </Card>
          <Card className="p-4">
            <div className="flex justify-between gap-3"><b className="owner-card-title">Upcoming payouts</b><button className="owner-button-text whitespace-nowrap text-[#5522d9]">View all</button></div>
            {payouts.slice(0,3).map((p,i)=><button key={p.id} onClick={()=>setSelected(p)} className="mt-4 grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 text-left">
              <Image src={properties.find(x=>x.id===p.propertyId)?.image||properties[0].image} alt="" width={44} height={44} className="size-11 rounded object-cover" quality={90}/>
              <span className="owner-helper min-w-0"><b className="owner-label block">{p.property}</b>{p.id}</span>
              <span className="owner-helper text-right"><b className="owner-label block whitespace-nowrap">{money(p.net)}</b>{["Tomorrow","May 29","Jun 02"][i]}</span>
            </button>)}
          </Card>
          <Card className="p-4">
            <b className="owner-card-title">Failed & on-hold payouts</b>
            <div className="mt-4 flex gap-3 rounded border border-red-200 bg-red-50 p-3"><TriangleAlert aria-hidden="true" size={22} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#ef5c55]"/><div><b className="owner-label">Failed payout</b><p className="owner-helper">Bank rejected destination details.</p><button onClick={()=>setModal(true)} className="owner-button-text mt-2 rounded border border-[#8e6bf0] px-3 py-1">Fix payout method</button></div></div>
            <div className="mt-3 flex gap-3 rounded border border-[#f1ce86] bg-[#fffaf0] p-3"><Clock3 aria-hidden="true" size={22} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#eea126]"/><div><b className="owner-label">On hold payout</b><p className="owner-helper">Waiting guest dispute resolution.</p><button onClick={()=>notify("Support case opened.")} className="owner-button-text mt-2 rounded border border-[#8e6bf0] px-3 py-1">View case</button></div></div>
          </Card>
        </div>
        <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-4 max-[1199px]:grid-cols-2 max-[700px]:grid-cols-1">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3"><b className="owner-card-title">Statements & receipts</b><button onClick={()=>generateDownload("dar-owner-statements.txt","DAR owner statements and receipts")} className="owner-button-text whitespace-nowrap text-[#5522d9]">Download all</button></div>
            {[
              ["May 2026 Owner Statement","PDF · Generated on May 26, 2026","245 KB"],
              ["April 2026 Owner Statement","PDF · Generated on Apr 26, 2026","230 KB"],
              ["Payout Receipt PAYOUT-8018","PDF · May 19, 2026","98 KB"],
              ["Payout Receipt PAYOUT-7992","PDF · May 13, 2026","95 KB"],
            ].map(([name,meta,size])=><button key={name} onClick={()=>generateDownload(`${name}.txt`,name)} className="mt-3 grid w-full grid-cols-[24px_minmax(0,1fr)_auto_18px] items-center gap-3 border-b border-[#edf0f4] pb-3 text-left last:border-0 last:pb-0"><Icon name="receipt" className="size-5 text-red-500"/><span className="min-w-0"><b className="owner-label block">{name}</b><small className="owner-helper text-[#6f788c]">{meta}</small></span><span className="owner-helper whitespace-nowrap">{size}</span><Icon name="download" className="size-4"/></button>)}
          </Card>
          <Card className="p-4">
            <b className="owner-card-title">Important information</b>
            <div className="mt-4 flex gap-3 rounded border border-[#e6e8ef] bg-[#f8f8fb] p-3"><Info aria-hidden="true" size={22} strokeWidth={1.8} className="shrink-0 text-[#4c86ec]"/><div><b className="owner-label">Tax note</b><p className="owner-helper mt-1">Taxes are the owner&apos;s responsibility unless otherwise agreed.</p></div></div>
            <div className="mt-3 flex gap-3 rounded border border-[#e6e8ef] bg-[#f8f8fb] p-3"><SearchIcon aria-hidden="true" size={22} strokeWidth={1.8} className="shrink-0 text-[#4d5771]"/><div><b className="owner-label">Need help with a payout?</b><p className="owner-helper mt-1">Open a payout ticket and our team will assist you.</p><Link href="/owner/help-center" className="owner-button-text mt-2 inline-block text-[#5522d9]">Open payout ticket →</Link></div></div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3"><b className="owner-card-title">Recent activity</b><button className="owner-button-text text-[#5522d9]">View all</button></div>
            {[
              ["Payout method updated","InstaPay · May 25, 2026 · 11:15 AM"],
              ["Statement downloaded","May 24, 2026 · 09:30 AM"],
              ["Payout sent: PAYOUT-7982","EGP 3,640 · May 20, 2026 · 02:10 PM"],
            ].map(([title,meta],i)=><p key={title} className="owner-body mt-4 flex gap-3"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${i===1?"bg-[#5522d9]":"bg-[#2fa84f]"}`}/><span><b className="owner-label block">{title}</b><small className="owner-helper text-[#6f788c]">{meta}</small></span></p>)}
          </Card>
        </div>
      </div>
      <Selected p={selected} close={()=>setSelected(payouts[0])} modal={()=>setModal(true)} download={()=>generateDownload(`${selected.id}-receipt.txt`,`Receipt ${selected.id}`)}/>
    </div>
  </div>{modal?<MethodModal value={payMethod} setValue={setPayMethod} close={()=>setModal(false)} save={()=>{setModal(false);notify("Payout method updated.")}}/>:null}{holdReason?<HoldReasonDialog payout={holdReason} close={()=>setHoldReason(null)}/>:null}{toast?<div className="owner-body fixed bottom-5 left-5 z-50 rounded bg-[#10283a] px-5 py-3 text-white">{toast}</div>:null}</OwnerShell>
}
type Payout = typeof payouts[number];

function PayoutHistoryTable({
  rows,selected,onSelect,activeStatus,onStatusChange,onDownload,onRetry,onHoldReason,
}:{
  rows:Payout[];
  selected:Payout;
  onSelect:(p:Payout)=>void;
  activeStatus:string;
  onStatusChange:(status:string)=>void;
  onDownload:(p:Payout)=>void;
  onRetry:()=>void;
  onHoldReason:(p:Payout)=>void;
}){
  const actionLabel:Record<string,string>={
    "PAYOUT-8041":"View receipt",
    "PAYOUT-8018":"Download",
    "PAYOUT-7992":"View",
    "PAYOUT-7950":"Retry",
    "PAYOUT-7904":"View hold reason",
  };
  const runAction=(p:Payout)=>{
    if(p.id==="PAYOUT-8041"||p.id==="PAYOUT-8018") onDownload(p);
    else if(p.id==="PAYOUT-7950") onRetry();
    else if(p.id==="PAYOUT-7904") onHoldReason(p);
    else onSelect(p);
  };
  return <Card className="min-w-0 max-w-full">
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
      <b className="owner-card-title">Payout history</b>
      <div className="flex flex-wrap justify-end gap-2">
        {["All","Upcoming","Paid","Processing","Failed","On hold"].map(x=><button key={x} onClick={()=>onStatusChange(x)} className={`owner-badge whitespace-nowrap rounded px-3 py-1 ${activeStatus===x?"bg-[#5522d9] text-white":"border border-[#dce1e9]"}`}>{x}</button>)}
      </div>
    </div>
    <div className="max-[1499px]:overflow-x-auto">
      <table className="w-full table-fixed border-separate border-spacing-0 max-[1499px]:min-w-[1180px]">
        <colgroup>
          <col className="w-[9.5%]"/><col className="w-[10.5%]"/><col className="w-[10.5%]"/>
          <col className="w-[9%]"/><col className="w-[8%]"/><col className="w-[8%]"/>
          <col className="w-[8%]"/><col className="w-[10.5%]"/><col className="w-[7%]"/>
          <col className="w-[8%]"/><col className="w-[11%]"/>
        </colgroup>
        <thead className="bg-[#f5f6f9]">
          <tr>{["Payout ID","Booking","Property","Check-out date","Gross booking","DAR commission","Net payout","Method","Status","Date","Actions"].map(h=><th key={h} className="owner-helper h-12 border-y border-[#e1e5ed] px-2 text-left font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>{rows.map(p=>{
          const isSelected=selected.id===p.id;
          return <tr key={p.id} onClick={()=>onSelect(p)} className={`cursor-pointer transition-colors hover:bg-[#faf9ff] ${isSelected?"bg-[#f8f5ff]":"bg-white"}`}>
            <td className={`owner-body h-[52px] border-b border-[#e8eaf0] px-2 whitespace-nowrap ${isSelected?"border-l-2 border-l-[#6d3bea]":"border-l-2 border-l-transparent"}`}>{p.id}</td>
            <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap"><Link href="/owner/bookings/request-decision" onClick={event=>event.stopPropagation()} className="text-[#5522d9]">{p.booking}</Link></td>
            <td className="owner-body border-b border-[#e8eaf0] px-2"><Link href={`/owner/properties/${p.propertyId}`} onClick={event=>event.stopPropagation()}>{p.property}</Link></td>
            <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">{p.checkout}</td>
            <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">{money(p.gross)}</td>
            <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">{money(p.commission)}</td>
            <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">{money(p.net)}</td>
            <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap"><PaymentMethod method={p.method}/></td>
            <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap"><Badge status={p.status}/></td>
            <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap">{p.date}</td>
            <td className="owner-body border-b border-[#e8eaf0] px-2 whitespace-nowrap"><button onClick={event=>{event.stopPropagation();runAction(p)}} className="owner-button-text text-[#5522d9] hover:underline">{actionLabel[p.id]??"View"}</button></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    <div className="relative flex min-h-[58px] items-center px-4">
      <span className="owner-helper">Showing 1 to {rows.length} of {rows.length} payouts</span>
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
        <button disabled aria-label="Previous page" className="grid size-8 place-items-center rounded-md border border-[#dce1e9] text-[#9aa2b1] disabled:cursor-not-allowed disabled:opacity-55"><ChevronLeft size={16} strokeWidth={1.8}/></button>
        <button aria-current="page" className="owner-button-text grid size-8 place-items-center rounded-md border border-[#d8d1ef] bg-[#faf8ff] text-[#31224f]">1</button>
        <button disabled aria-label="Next page" className="grid size-8 place-items-center rounded-md border border-[#dce1e9] text-[#9aa2b1] disabled:cursor-not-allowed disabled:opacity-55"><ChevronRight size={16} strokeWidth={1.8}/></button>
      </div>
    </div>
  </Card>;
}

function PaymentMethod({method}:{method:string}){
  if(method==="InstaPay") return <Image src="/brands/instapay.svg" alt="InstaPay" width={82} height={22} className="h-[20px] w-[82px] object-contain object-left" quality={90}/>;
  if(method==="Bank transfer") return <span className="inline-flex items-center gap-2"><Landmark aria-hidden="true" size={16} strokeWidth={1.8} className="shrink-0 text-[#17213d]"/>Bank transfer</span>;
  if(method==="Vodafone Cash") return <span className="inline-flex items-center gap-2"><Image src="/brands/vodafone.svg" alt="" width={18} height={18} className="size-[18px] shrink-0 object-contain" quality={90}/>Vodafone Cash</span>;
  return <span>{method}</span>;
}

function HoldReasonDialog({payout,close}:{payout:Payout;close:()=>void}){
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#071126]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="hold-reason-title">
    <Card className="w-full max-w-md p-5">
      <div className="flex items-center justify-between"><b id="hold-reason-title" className="owner-section-title">Payout on hold</b><button onClick={close} aria-label="Close hold reason"><Icon name="x" className="size-5"/></button></div>
      <p className="owner-body mt-4">Payout <b>{payout.id}</b> is on hold while the guest dispute is reviewed. The payout will resume automatically when the case is resolved.</p>
      <button onClick={close} className="owner-button-text mt-5 h-10 w-full rounded bg-[#5522d9] text-white">Close</button>
    </Card>
  </div>;
}

function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}){return <label className="owner-label block">{label}<span className="relative mt-1 block"><select value={value} onChange={e=>onChange(e.target.value)} className="owner-input-text h-10 w-full appearance-none rounded-md border border-[#dce1e9] bg-white px-3 pr-9 outline-none focus:border-[#7b4cff]">{options.map(x=><option key={x}>{x}</option>)}</select><ChevronDown aria-hidden="true" size={16} strokeWidth={1.8} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#59637d]"/></span></label>}
function Badge({status}:{status:string}){const c=status==="Paid"?"bg-green-100 text-green-700":status==="Upcoming"?"bg-orange-100 text-orange-700":status==="Failed"?"bg-red-100 text-red-600":"bg-purple-100 text-purple-700";return <span className={`owner-badge rounded px-2 py-1 ${c}`}>{status}</span>}
function PayoutMethod({payMethod,setPayMethod,onEdit}:{payMethod:string;setPayMethod:(x:string)=>void;onEdit:()=>void}){
  const destination=payMethod==="InstaPay"
    ? ["ahmed@instapay","+20 101 234 5678"]
    : payMethod==="Bank transfer"
      ? ["EGxxxxxxxxxxxxxxxxxxxx","Bank account"]
      : ["+20 101 234 5678","Vodafone Cash"];
  return <Card className="w-full p-5">
    <b className="owner-card-title">Payout method</b>
    <div className="mt-4 flex w-full">
      {["InstaPay","Bank transfer","Vodafone Cash"].map(x=><button key={x} onClick={()=>setPayMethod(x)} className={`owner-badge h-9 min-w-0 flex-1 whitespace-nowrap rounded-md px-1 text-center !text-[11px] !leading-4 ${payMethod===x?"bg-[#5522d9] text-white":"border border-[#e1e5ed] bg-white text-[#17213d]"}`}>{x}</button>)}
    </div>
    <div className="owner-body mt-4 space-y-3">
      <div className="flex items-start justify-between gap-4"><span>Account holder name</span><b className="shrink-0 text-right">Ahmed Hassan</b></div>
      <div className="flex items-start justify-between gap-4"><span>Destination ID / mobile</span><b className="text-right"><span className="block">{destination[0]}</span><span className="block">{destination[1]}</span></b></div>
      <div className="flex items-center justify-between gap-4"><span>Verification status</span><b className="inline-flex items-center gap-1.5 text-green-600">Verified<CheckCircle aria-hidden="true" size={16} strokeWidth={1.8}/></b></div>
    </div>
    <button onClick={onEdit} className="owner-button-text mt-4 h-10 w-full rounded-md bg-[#5522d9] text-white transition-colors hover:bg-[#4518bd]">Update payout details</button>
    <p className="owner-helper mt-2.5 flex items-start gap-2 text-[#6f788c]"><Info aria-hidden="true" size={14} strokeWidth={1.8} className="mt-0.5 shrink-0"/>Changes may require verification before next payout.</p>
  </Card>
}
function Selected({p,close,modal,download}:{p:typeof payouts[number];close:()=>void;modal:()=>void;download:()=>void}){return <Card className="self-start p-4"><div className="flex justify-between"><b className="owner-card-title">Selected payout</b><button onClick={close}><Icon name="x" className="size-5"/></button></div><div className="mt-5 flex justify-between"><b className="owner-section-title">{p.id}</b><Badge status={p.status}/></div><div className="mt-4 flex gap-3"><Image src={properties.find(x=>x.id===p.propertyId)?.image||properties[0].image} alt="" width={90} height={70} className="h-[70px] w-[90px] rounded object-cover" quality={90}/><span className="owner-helper"><Link href={`/owner/properties/${p.propertyId}`} className="owner-card-title block">{p.property}</Link>Madinaty - Building B6</span></div><div className="owner-body mt-5 space-y-3">{[["Booking reference",p.booking],["Guest",p.guest],["Check-in","May 20, 2026"],["Check-out","May 25, 2026"],["Nights","5"],["Gross booking",money(p.gross)],["DAR commission",`- ${money(p.commission)}`],["Net payout",money(p.net)],["Payout method",p.method],["Status",p.status]].map(([a,b])=><p key={a}>{a}<b className="float-right">{b}</b></p>)}</div><hr className="my-5 border-[#e1e5ed]"/><b className="owner-card-title">Payout timeline</b>{["Booking confirmed","Guest payment verified","Stay completed","Payout scheduled","Payout sent"].map((x,i)=><p key={x} className="owner-body mt-4 flex gap-3"><span className={`mt-1 grid size-4 place-items-center rounded-full ${i<3?"bg-green-500 text-white":"border border-[#7b4cff]"}`}>{i<3?<Icon name="check" className="size-3"/>:""}</span>{x}</p>)}<div className="mt-5 space-y-2"><button onClick={download} className="owner-button-text h-9 w-full rounded bg-[#5522d9] text-white">Download receipt</button><button onClick={()=>generateDownload("payout-statement.txt",`Statement ${p.id}`)} className="owner-button-text h-9 w-full rounded border border-[#d3d8e2]">Download payout statement</button><div className="grid grid-cols-2 gap-2"><Link href="/owner/help-center" className="owner-button-text grid h-9 place-items-center rounded border border-[#d3d8e2]">Contact support</Link><button onClick={modal} className="owner-button-text rounded border border-[#d3d8e2]">Change payout method</button></div></div></Card>}
function MethodModal({value,setValue,close,save}:{value:string;setValue:(x:string)=>void;close:()=>void;save:()=>void}){return <div className="fixed inset-0 z-50 grid place-items-center bg-[#071126]/55 p-4"><Card className="w-full max-w-md p-5"><div className="flex justify-between"><b className="owner-section-title">Update payout method</b><button onClick={close}><Icon name="x" className="size-5"/></button></div><div className="mt-5 space-y-2">{["InstaPay","Bank transfer","Vodafone Cash"].map(x=><button key={x} onClick={()=>setValue(x)} className={`owner-button-text h-11 w-full rounded border ${value===x?"border-[#6d3bea] bg-[#faf8ff]":"border-[#dce1e9]"}`}>{x}</button>)}</div><label className="owner-label mt-4 block">Destination<input defaultValue="ahmed@instapay" className="owner-input-text mt-1 h-10 w-full rounded border border-[#dce1e9] px-3"/></label><div className="mt-5 flex gap-3"><button onClick={close} className="owner-button-text h-10 flex-1 rounded border">Cancel</button><button onClick={save} className="owner-button-text h-10 flex-1 rounded bg-[#5522d9] text-white">Save method</button></div></Card></div>}
