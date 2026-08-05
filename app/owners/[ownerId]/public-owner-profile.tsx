"use client";

import Image from "next/image";
import Link from "next/link";
import { DarLogo } from "@/components/brand/dar-logo";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { useState } from "react";
import { Icon } from "@/components/host-landing/icons";
import { Star, MessageSquare, CalendarDays, Zap, Clock3, Mail, LayoutGrid, House, UserRoundCheck, MapPin, Languages, BadgeCheck, Phone, ShieldCheck, MessageSquareCheck } from "lucide-react";
import { owners, properties } from "@/lib/dar-data";

const profileListings = [
  { ...properties[0], price: "EGP 1,200", rating: "4.8 (48)", tags: ["Wi-Fi","AC","Kitchen"] },
  { ...properties[1], price: "EGP 1,600", rating: "4.9 (63)", tags: ["Wi-Fi","AC","Pool Access"] },
  { id:"1", name:"Cozy Studio with Balcony", location:"Noor City", image:"/property-serviced-sharp.png", price:"EGP 1,100", rating:"4.7 (39)", tags:["Wi-Fi","AC","Balcony"] },
  { id:"3", name:"Serviced Apartment near B12", location:"Madinaty", image:"/property-hotel-sharp.png", price:"EGP 1,800", rating:"4.8 (52)", tags:["Wi-Fi","AC","Gym Access"] },
];

export default function PublicOwnerProfile({ownerId}:{ownerId:string}){
  const owner=owners[ownerId as keyof typeof owners]??{...owners["ahmed-hassan"],id:ownerId,name:ownerId.split("-").map(x=>x[0]?.toUpperCase()+x.slice(1)).join(" ")};
  const [call,setCall]=useState(false);const [open,setOpen]=useState<number|null>(null);const [liked,setLiked]=useState<string[]>([]);const [toast,setToast]=useState("");
  const notify=(x:string)=>{setToast(x);setTimeout(()=>setToast(""),2200)};
  return <main className="min-h-screen bg-white text-[#111831]"><PublicNav/>
    <div className="mx-auto w-full max-w-[1600px] px-6 py-4 max-[700px]:px-3"><p className="owner-helper mb-4">Home / Owners / {owner.name}</p>
      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5 max-[1050px]:grid-cols-1">
        <div className="min-w-0">
          <section className="relative min-h-[330px] overflow-hidden rounded-xl bg-[#e8e1d6]">
            <Image src="/owner-profile-hero-sharp.png" alt="" fill priority className="object-cover object-center" sizes="(max-width: 1600px) 100vw, 1600px" quality={92}/>
            {/* Left Profile Card */}
            <div className="absolute bottom-6 left-7 w-[590px] rounded-xl border border-[#e1e5ed] bg-white p-6 shadow-lg max-[950px]:static max-[950px]:mx-0 max-[950px]:mt-auto max-[950px]:w-auto max-[950px]:shadow-md">
              {/* Avatar + info row */}
              <div className="flex gap-6">
                <ProfileAvatar src={owner.image} name={owner.name} size={112} priority className="border-[5px] border-white shadow-sm max-[600px]:!size-20"/>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="owner-page-title">{owner.name}</h1>
                    <Icon name="check-circle" className="size-5 shrink-0 fill-[#5522d9] text-white"/>
                    <span className="owner-badge text-[#5522d9]">Verified Owner</span>
                  </div>
                  <p className="owner-card-title mt-1">{owner.title}</p>
                  <p className="owner-body mt-1.5 leading-relaxed">{owner.bio}</p>
                </div>
              </div>
              {/* Statistics row with Lucide icons */}
              <div className="mt-5 grid grid-cols-5 divide-x divide-[#e1e5ed] max-[600px]:grid-cols-3">
                {[
                  { val: owner.rating, lbl: "Rating", IconComp: Star },
                  { val: owner.reviews, lbl: "Reviews", IconComp: MessageSquare },
                  { val: owner.years, lbl: "Years on DAR", IconComp: CalendarDays },
                  { val: owner.responseRate, lbl: "Response rate", IconComp: Zap },
                  { val: owner.responseTime, lbl: "Responds within", IconComp: Clock3 },
                ].map(({ val, lbl, IconComp }) => (
                  <div key={lbl} className="px-3 text-center first:pl-0 last:pr-0">
                    <IconComp className="mx-auto mb-1.5 size-[22px] text-[#672aec]" strokeWidth={1.8} />
                    <b className="owner-number-md block">{val}</b>
                    <span className="owner-helper text-[#6b7280]">{lbl}</span>
                  </div>
                ))}
              </div>
              {/* Buttons row with Lucide icons */}
              <div className="mt-5 flex gap-4">
                <button onClick={()=>notify("Conversation opened with Ahmed Hassan.")} className="owner-button-text inline-flex items-center justify-center gap-2 whitespace-nowrap h-11 flex-1 rounded-lg bg-[#6a22ed] text-white transition-colors hover:bg-[#5815d6]"><Mail className="size-4" strokeWidth={2} />Contact owner</button>
                <button onClick={()=>document.getElementById("owner-listings")?.scrollIntoView({behavior:"smooth"})} className="owner-button-text inline-flex items-center justify-center gap-2 whitespace-nowrap h-11 flex-1 rounded-lg border border-[#7b4cff] text-[#6a22ed] transition-colors hover:bg-[#f5f0ff]"><LayoutGrid className="size-4" strokeWidth={2} />View listings</button>
              </div>
            </div>
            {/* Right Statistics Card */}
            <div className="absolute bottom-6 right-7 w-[370px] rounded-xl border border-[#e1e5ed] bg-white p-6 shadow-lg max-[1350px]:hidden">
              <div className="grid grid-cols-2">
                <div className="border-r border-[#e1e5ed] pr-5">
                  <div className="flex items-start gap-3.5">
                    <House className="size-6 shrink-0 text-[#672aec]" strokeWidth={1.8} />
                    <div>
                      <span className="owner-helper text-[#6b7280]">Active listings</span>
                      <b className="owner-label block">12</b>
                    </div>
                  </div>
                </div>
                <div className="pl-5">
                  <div className="flex items-start gap-3.5">
                    <UserRoundCheck className="size-6 shrink-0 text-[#e59a00]" strokeWidth={1.8} />
                    <div>
                      <span className="owner-helper text-[#6b7280]">Completed stays</span>
                      <b className="owner-label block">480+</b>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2">
                <div className="border-r border-[#e1e5ed] pr-5">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="size-6 shrink-0 text-[#672aec]" strokeWidth={1.8} />
                    <div>
                      <span className="owner-helper text-[#6b7280]">Favorite areas</span>
                      <b className="owner-label block leading-tight">Madinaty, New Capital, Cairo East</b>
                    </div>
                  </div>
                </div>
                <div className="pl-5">
                  <div className="flex items-start gap-3.5">
                    <Languages className="size-6 shrink-0 text-[#e59a00]" strokeWidth={1.8} />
                    <div>
                      <span className="owner-helper text-[#6b7280]">Languages</span>
                      <b className="owner-label block">English, Arabic</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="mt-3 grid grid-cols-2 gap-3 max-[700px]:grid-cols-1"><Box title={`About ${owner.name.split(" ")[0]}`}><p className="owner-body">I&apos;m a property owner and broker based in Cairo, specializing in premium furnished studios and apartments across Madinaty, New Capital and Cairo East.</p><div className="mt-4 flex flex-wrap gap-2">{[
            { label: "Verified ID", IconComp: BadgeCheck, tone: "purple" },
            { label: "Verified phone", IconComp: Phone, tone: "green" },
            { label: "Payment compliant", IconComp: ShieldCheck, tone: "green" },
            { label: "High response rate", IconComp: MessageSquareCheck, tone: "purple" },
            { label: "Local expert", IconComp: MapPin, tone: "green" },
          ].map(({label, IconComp, tone})=><span key={label} className="owner-badge inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f4f6f8] py-1 pl-1 pr-2.5"><span className={`grid size-5 shrink-0 place-items-center rounded-full ${tone==="purple"?"bg-[#ede9fe] text-[#7c3aed]":"bg-[#eaf8ef] text-[#22c55e]"}`}><IconComp className="size-3" strokeWidth={1.9}/></span>{label}</span>)}</div></Box><Box title="Performance overview"><div className="grid grid-cols-3 gap-3">{[["97%","Response rate"],["18 min","Avg. response time"],["94%","Booking acceptance"],["1.2%","Cancellation rate"],["4.8 / 5","Average guest rating"]].map(([v,l])=><div key={l} className="rounded border p-3"><b className="owner-number-sm">{v}</b><p className="owner-helper">{l}</p><div className="mt-2 h-1 rounded bg-[#e9eaf0]"><div className="h-full w-4/5 rounded bg-[#6a22ed]"/></div></div>)}</div></Box></div>
          <Box title="Guest reviews" className="mt-3"><div className="grid grid-cols-3 gap-4 max-[700px]:grid-cols-1">{[["Omar Nabil","Amazing stay! The apartment was spotless and exactly as shown."],["Lina Sameh","Great location in New Capital. The place had everything I needed."],["Sara Ali","Very comfortable studio with a nice balcony view."]].map((r,i)=><div key={r[0]} className="rounded border border-[#e1e5ed] p-3"><div className="flex gap-3"><ProfileAvatar src={["/dashboard-avatar-omar.png","/dashboard-avatar-lina.png","/dashboard-avatar-sara.png"][i]} name={r[0]} size={44}/><span><b className="owner-label">{r[0]}</b><small className="owner-helper block">May {5-i*3}, 2024</small></span><span className="owner-label ml-auto text-[#e59a00]">★★★★★</span></div><p className="owner-body mt-3">{r[1]}</p></div>)}</div></Box>
          <Box title={`Listings by ${owner.name.split(" ")[0]}`} className="mt-3" id="owner-listings"><div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">{profileListings.map(p=><article key={p.name} className="overflow-hidden rounded border border-[#e1e5ed]"><div className="relative h-32"><Image src={p.image} alt={p.name} fill quality={90} sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, (max-width: 1050px) 33vw, (max-width: 1600px) 20vw, 300px" className="object-cover"/><button onClick={()=>setLiked(liked.includes(p.name)?liked.filter(x=>x!==p.name):[...liked,p.name])} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white"><Icon name="heart" className={`size-4 ${liked.includes(p.name)?"fill-red-500 text-red-500":""}`}/></button></div><div className="p-3"><b className="owner-card-title">{p.name}</b><p className="owner-helper">{p.location}</p><div className="my-2 flex gap-1">{p.tags.map(x=><span key={x} className="owner-badge rounded bg-[#f4f6f9] px-2">{x}</span>)}</div><div className="flex items-center justify-between"><b className="owner-label">{p.price} / night</b><Link href={`/owner/properties/${p.id}`} className="owner-button-text rounded bg-[#672aec] px-3 py-2 text-white">View details</Link></div></div></article>)}</div></Box>
          <div className="mt-3 grid grid-cols-2 gap-3"><Box title="Coverage areas"><div className="flex flex-wrap gap-2">{["Madinaty","New Capital","Cairo East","New Cairo","Noor City"].map(x=><span className="owner-badge rounded bg-[#f5f5fa] px-3 py-2" key={x}><Icon name="location" className="mr-1 inline size-4 text-[#6a22ed]"/>{x}</span>)}</div></Box><Box title="Hosting standards"><div className="grid grid-cols-4 gap-2">{["Verified listings only","Real photos reviewed by DAR","Secure payments inside DAR","Fast communication"].map(x=><p className="owner-helper" key={x}>{x}</p>)}</div></Box></div>
          <Box title="Similar hosts you might like" className="mt-3"><div className="grid grid-cols-3 gap-3">{["mohamed-tarek","nour-el-deen","yasmine-khaled"].map((id,i)=>{const name=id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");return <Link href={`/owners/${id}`} key={id} className="flex items-center gap-3 rounded border p-3"><ProfileAvatar src={["/dashboard-avatar-omar.png","/dashboard-avatar-support.png","/dashboard-avatar-sara.png"][i]} name={name} size={48}/><span><b className="owner-label block">{name}</b><span className="owner-helper">4.9 - Superhost</span></span></Link>})}</div></Box>
        </div>
        <aside className="space-y-3"><Box title="Contact owner"><button onClick={()=>notify("Conversation opened with Ahmed Hassan.")} className="owner-button-text h-11 w-full rounded bg-[#6a22ed] text-white">Send message</button><button onClick={()=>setCall(true)} className="owner-button-text mt-3 h-11 w-full rounded border border-[#7b4cff]">Request a call</button><p className="owner-helper mt-3">For safety, phone details are shared only after booking confirmation.</p></Box><Box title="Trust & verification">{["Identity verified","Phone verified","Email verified","Owner documents approved","Active since 2023"].map(x=><p key={x} className="owner-body mt-3 flex gap-2"><Icon name="check-circle" className="size-4 text-green-600"/>{x}</p>)}</Box><Box title="Booking confidence">{[["97%","Response rate"],["94%","Acceptance rate"],["1.2%","Cancellation rate"],["4.8","Average guest rating"]].map(x=><p key={x[1]} className="owner-body mt-3"><b className="owner-number-sm inline-block w-16">{x[0]}</b>{x[1]}</p>)}</Box><Box title="Common questions">{["Does Ahmed manage all listings personally?","How quickly does he reply?","Are listings reviewed by DAR?","Can I request long stays?"].map((q,i)=><button onClick={()=>setOpen(open===i?null:i)} key={q} className="owner-body mt-2 w-full rounded border p-3 text-left">{q}<Icon name="chevron" className="float-right size-4"/>{open===i?<span className="owner-helper mt-2 block">Yes. DAR verifies the owner and reviews listing information for safety and accuracy.</span>:null}</button>)}</Box><Box title="Safety"><p className="owner-body flex gap-3"><Icon name="shield" className="size-8 text-[#5522d9]"/>For your safety, keep payments and booking changes inside DAR.</p></Box></aside>
      </div>
    </div><PublicFooter/>{call?<CallModal close={()=>setCall(false)} submit={()=>{setCall(false);notify("Call request sent.")}}/>:null}{toast?<div className="owner-body fixed bottom-5 right-5 z-50 rounded bg-[#10233c] px-5 py-3 text-white">{toast}</div>:null}
  </main>
}
function PublicNav(){return <header className="border-b border-[#e1e5ed]"><div className="mx-auto flex h-16 w-full max-w-[1600px] items-center px-6 max-[700px]:px-3"><Link href="/"><DarLogo surface="light" width={610} height={260} className="h-11 w-32 object-contain object-left"/></Link><nav className="owner-label mx-auto flex gap-8 max-[750px]:hidden"><Link href="/landing-page">Stays</Link><Link href="/landing-page">Hotels</Link><Link href="/add-property">Become a host</Link><Link href="/landing-page">About us</Link><Link href="/owner/help-center">Help</Link></nav><div className="flex gap-5"><Icon name="heart" className="size-5"/><span className="owner-label max-[600px]:hidden">English / EGP</span><Icon name="user-plain" className="size-6"/></div></div></header>}
function Box({title,children,className="",id}:{title:string;children:React.ReactNode;className?:string;id?:string}){return <section id={id} className={`rounded-lg border border-[#dfe3eb] bg-white p-4 ${className}`}><h2 className="owner-section-title">{title}</h2><div className="mt-3">{children}</div></section>}
function PublicFooter(){return <footer className="mt-5 bg-[#061327] py-7 text-white"><div className="mx-auto grid w-full max-w-[1600px] grid-cols-5 gap-8 px-6 max-[700px]:px-3 max-[650px]:grid-cols-2"><div><DarLogo surface="dark" width={610} height={260} className="h-12 w-32 object-contain"/><p className="owner-body mt-3 text-white/70">Premium stays across Egypt.<br/>Trusted owners. Happy guests.</p></div>{[["Explore","Stays","Hotels","Areas"],["Host","Become a host","Host resources","Success stories"],["Support","Help center","Contact us","Safety center"],["Company","About us","Careers","Newsroom"]].map(c=><div key={c[0]}><b className="owner-card-title">{c[0]}</b>{c.slice(1).map(x=><p key={x} className="owner-body mt-2 text-white/75">{x}</p>)}</div>)}</div></footer>}
function CallModal({close,submit}:{close:()=>void;submit:()=>void}){return <div className="fixed inset-0 z-50 grid place-items-center bg-[#071126]/55 p-4"><section className="w-full max-w-md rounded-xl bg-white p-5"><div className="flex justify-between"><b className="owner-section-title">Request a call</b><button onClick={close}><Icon name="x" className="size-5"/></button></div><label className="owner-label mt-5 block">Phone number<input className="owner-input-text mt-1 h-10 w-full rounded border px-3" defaultValue="+20 101 234 5678"/></label><label className="owner-label mt-4 block">Preferred time<select className="owner-input-text mt-1 h-10 w-full rounded border px-3"><option>Tomorrow, 10:00 AM</option><option>Tomorrow, 4:00 PM</option></select></label><div className="mt-5 flex gap-3"><button onClick={close} className="owner-button-text h-10 flex-1 rounded border">Cancel</button><button onClick={submit} className="owner-button-text h-10 flex-1 rounded bg-[#672aec] text-white">Submit request</button></div></section></div>}
