import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Globe2,
  Grid2X2,
  Heart,
  House,
  Languages,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  UserRound,
  Zap,
} from "lucide-react";
import { DarLogo } from "@/components/brand/dar-logo";
import { MarketplaceFooter } from "@/features/public-marketplace/components/MarketplaceFooter";

const ownerStats = [
  { icon: Star, value: "4.8", label: "Rating" },
  { icon: MessageSquare, value: "126", label: "Reviews" },
  { icon: CalendarDays, value: "3", label: "Years on DAR" },
  { icon: Zap, value: "97%", label: "Response rate" },
  { icon: Clock3, value: "18 min", label: "Responds within" },
] as const;

const reviews = [
  { name: "Omar Nabil", date: "May 5, 2024", text: "Amazing stay! The apartment was spotless and exactly as shown.", image: "/omar-khaled-profile-reference.png" },
  { name: "Lina Sameh", date: "May 2, 2024", text: "Great location in New Capital. The place had everything I needed.", image: "/dashboard-avatar-sara.png" },
  { name: "Sara Ali", date: "May 1, 2024", text: "Very comfortable studio with a nice balcony view.", image: "/publish-avatar-ahmed-reference.png" },
] as const;

const listings = [
  { title: "Luxury Studio in Madinaty", location: "Madinaty · B6", price: "EGP 1,200", image: "/property-studio-reference.png", href: "/properties/modern-apartment-madinty", tags: ["Wi-Fi", "AC", "Kitchen"] },
  { title: "Modern Furnished Apartment", location: "New Capital · R7", price: "EGP 1,600", image: "/property-furnished-reference.png", href: "/properties/new-capital-terrace-suite", tags: ["Wi-Fi", "AC", "Pool Access"] },
  { title: "Cozy Studio with Balcony", location: "Noor City", price: "EGP 1,100", image: "/property-serviced-reference.png", href: "/properties/madina-nour-open-plan-apartment", tags: ["Wi-Fi", "AC", "Balcony"] },
  { title: "Serviced Apartment near B12", location: "Madinaty", price: "EGP 1,800", image: "/property-hotel-reference.png", href: "/properties/madina-nour-duplex-residence", tags: ["Wi-Fi", "AC", "Gym Access"] },
] as const;

const faqs = [
  ["Does Ahmed manage all listings personally?", "Yes. Ahmed oversees every listing and coordinates directly with the local hosting team."],
  ["How quickly does he reply?", "Ahmed's average response time is 18 minutes."],
  ["Are listings reviewed by DAR?", "Yes. Active listings are reviewed against DAR hosting and verification standards."],
  ["Can I request long stays?", "Yes. Use the contact action to discuss availability and long-stay requirements."],
] as const;

const panel = "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]";
const interactive = "transition duration-200 hover:border-[var(--brand)] hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:translate-y-px";
const primary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--brand)] px-5 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:translate-y-px";
const secondary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--brand)] bg-white px-5 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:translate-y-px";

export function OwnerProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <PublicHeader />
      <main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--foreground-muted)]">
          <Link href="/" className="rounded hover:text-[var(--brand)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]">Home</Link>
          <span className="mx-1.5">/</span><span>Owners</span><span className="mx-1.5">/</span><span className="font-medium text-[var(--foreground)]">Ahmed Hassan</span>
        </nav>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
          <div className="min-w-0 space-y-4">
            <ProfileHero />
            <div className="grid gap-4 lg:grid-cols-2">
              <About />
              <Performance />
            </div>
            <GuestReviews />
            <Listings />
            <div className="grid gap-4 lg:grid-cols-2">
              <Coverage />
              <HostingStandards />
            </div>
            <SimilarHosts />
          </div>
          <ProfileAside />
        </div>
      </main>
      <MarketplaceFooter />
    </div>
  );
}

function PublicHeader() {
  return <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8"><Link href="/" aria-label="DAR home" className="rounded focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"><DarLogo size="compact" /></Link><nav aria-label="Public navigation" className="ml-auto hidden items-center gap-7 text-sm font-medium md:flex"><Link className="hover:text-[var(--brand)]" href="/search">Stays</Link><Link className="hover:text-[var(--brand)]" href="/hotels">Hotels</Link><Link className="hover:text-[var(--brand)]" href="/become-a-host">Become a host</Link><Link className="hover:text-[var(--brand)]" href="/about">About us</Link><Link className="hover:text-[var(--brand)]" href="/help">Help</Link></nav><Link href="/favorites" aria-label="Saved stays" className="ml-auto rounded-full p-2 hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] md:ml-4"><Heart className="size-5" strokeWidth={1.8}/></Link><span className="hidden items-center gap-2 text-sm sm:flex"><Globe2 className="size-4"/>English / EGP</span><Link href="/login" aria-label="Sign in" className="rounded-full p-2 hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"><UserRound className="size-5"/></Link></div></header>;
}

function ProfileHero() {
  return <section className={`${panel} relative min-h-[330px] overflow-hidden`}><Image src="/owner-profile-hero-sharp.png" alt="Elegant furnished apartment managed by Ahmed Hassan" fill priority className="object-cover" sizes="(max-width: 1280px) 100vw, 1050px"/><div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"/><div className="relative m-4 max-w-[540px] rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card-strong)] sm:m-6 sm:p-6"><div className="flex items-start gap-4"><Image src="/owner-selfie-ahmed-reference.png" alt="Ahmed Hassan" width={96} height={96} className="size-20 rounded-full border-4 border-white object-cover shadow-[var(--shadow-sm)] sm:size-24"/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold sm:text-3xl">Ahmed Hassan</h1><ShieldCheck className="size-5 text-[var(--brand)]"/><span className="text-xs font-semibold text-[var(--brand)]">Verified Owner</span></div><p className="mt-1 font-semibold">Owner &amp; Broker in Cairo</p><p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Helping guests find trusted furnished stays in Madinaty, New Capital and Cairo East.</p></div></div><div className="mt-5 grid grid-cols-2 gap-y-5 border-y border-[var(--border)] py-4 sm:grid-cols-5">{ownerStats.map(({icon:Icon,value,label})=><div key={label} className="text-center sm:border-r sm:border-[var(--border)] sm:last:border-0"><Icon className="mx-auto size-5 text-[var(--brand)]"/><strong className="mt-1 block text-lg">{value}</strong><span className="text-[11px] text-[var(--foreground-muted)]">{label}</span></div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Link href="/contact?subject=Contact%20Ahmed%20Hassan" className={primary}><MessageSquare className="size-4"/>Contact owner</Link><Link href="#listings" className={secondary}><Grid2X2 className="size-4"/>View listings</Link></div></div></section>;
}

function About() {
  return <section className={`${panel} p-5`}><h2 className="text-lg font-semibold">About Ahmed</h2><p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">I&apos;m a property owner and broker based in Cairo, specializing in premium furnished studios and apartments across Madinaty, New Capital and Cairo East.</p><div className="mt-4 flex flex-wrap gap-2">{["Verified ID","Verified phone","Payment compliant","High response rate","Local expert"].map(x=><span key={x} className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-xs"><CheckCircle2 className="size-3.5 text-[var(--success)]"/>{x}</span>)}</div></section>;
}

function Performance() {
  const data=[["97%","Response rate"],["18 min","Avg. response time"],["94%","Booking acceptance"],["1.2%","Cancellation rate"],["4.8 / 5","Average guest rating"]];
  return <section className={`${panel} p-5`}><h2 className="text-lg font-semibold">Performance overview</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{data.map(([value,label])=><div key={label} className="rounded-[var(--radius-md)] border border-[var(--border-strong)] p-3"><strong>{value}</strong><span className="mt-1 block text-xs text-[var(--foreground-muted)]">{label}</span><span className="mt-3 block h-1 rounded-full bg-[var(--muted)]"><i className="block h-full w-4/5 rounded-full bg-[var(--brand)]"/></span></div>)}</div></section>;
}

function GuestReviews() {
  return <section className={`${panel} p-5`}><h2 className="text-lg font-semibold">Guest reviews</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{reviews.map(review=><article key={review.name} className="rounded-[var(--radius-md)] border border-[var(--border)] p-4"><div className="flex items-center gap-3"><Image src={review.image} alt="" width={42} height={42} className="size-10 rounded-full object-cover"/><div><h3 className="text-sm font-semibold">{review.name}</h3><p className="text-xs text-[var(--foreground-muted)]">{review.date}</p></div><span aria-label="5 out of 5 stars" className="ml-auto flex text-[var(--warning)]">{Array.from({length:5}).map((_,i)=><Star key={i} className="size-3 fill-current"/>)}</span></div><p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">{review.text}</p></article>)}</div></section>;
}

function Listings() {
  return <section id="listings" className={`${panel} scroll-mt-24 p-5`}><h2 className="text-lg font-semibold">Listings by Ahmed</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{listings.map(item=><Link key={item.title} href={item.href} className={`${panel} ${interactive} group overflow-hidden`}><div className="relative aspect-[4/3] overflow-hidden"><Image src={item.image} alt={item.title} fill className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes="(max-width: 640px) 100vw, 300px"/></div><div className="p-3"><h3 className="truncate text-sm font-semibold">{item.title}</h3><p className="mt-1 text-xs text-[var(--foreground-muted)]">{item.location}</p><div className="mt-2 flex flex-wrap gap-1">{item.tags.map(tag=><span key={tag} className="rounded bg-[var(--muted)] px-2 py-1 text-[10px]">{tag}</span>)}</div><div className="mt-3 flex items-center justify-between gap-2"><strong className="text-sm">{item.price}<span className="font-normal text-[var(--foreground-muted)]"> / night</span></strong><span className="rounded bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-white">View details</span></div></div></Link>)}</div></section>;
}

function Coverage() {
  return <section className={`${panel} p-5`}><h2 className="text-lg font-semibold">Coverage areas</h2><div className="mt-4 flex flex-wrap gap-2">{["Madinaty","New Capital","Cairo East","New Cairo","Noor City"].map(x=><span key={x} className="inline-flex items-center gap-1.5 rounded bg-[var(--brand-soft)] px-3 py-2 text-xs"><MapPin className="size-3.5 text-[var(--brand)]"/>{x}</span>)}</div></section>;
}

function HostingStandards() {
  return <section className={`${panel} p-5`}><h2 className="text-lg font-semibold">Hosting standards</h2><div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">{["Verified listings only","Real photos reviewed by DAR","Secure payments inside DAR","Fast communication"].map(x=><span key={x} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-[var(--success)]"/>{x}</span>)}</div></section>;
}

function SimilarHosts() {
  return <section className={`${panel} p-5`}><h2 className="text-lg font-semibold">Similar hosts you might like</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{[["Mohamed Tarek","Local property host"],["Nour El Deen","Verified hospitality partner"],["Yasmine Khaled","Cairo stay specialist"]].map(([name,note],i)=><article key={name} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"><UserRound className="size-5"/></span><div><h3 className="text-sm font-semibold">{name}</h3><p className="mt-1 text-xs text-[var(--foreground-muted)]">{i===0?"4.9 · ":"4.8 · "}{note}</p></div></article>)}</div></section>;
}

function ProfileAside() {
  return <aside className="space-y-4 xl:sticky xl:top-20"><section className={`${panel} p-5`}><h2 className="text-lg font-semibold">Contact owner</h2><div className="mt-4 grid gap-3"><Link href="/contact?subject=Message%20Ahmed%20Hassan" className={primary}>Send message</Link><Link href="/contact?subject=Request%20a%20call%20from%20Ahmed%20Hassan" className={secondary}>Request a call</Link></div><p className="mt-3 text-xs leading-5 text-[var(--foreground-muted)]">For safety, phone details are shared only after booking confirmation.</p></section><Trust/><Confidence/><Questions/><Safety/></aside>;
}

function Trust() {
  return <section className={`${panel} p-5`}><h2 className="text-lg font-semibold">Trust &amp; verification</h2><ul className="mt-4 space-y-3 text-sm">{["Identity verified","Phone verified","Email verified","Owner documents approved","Active since 2023"].map(x=><li key={x} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[var(--success)]"/>{x}</li>)}</ul></section>;
}

function Confidence() {
  return <section className={`${panel} p-5`}><h2 className="text-lg font-semibold">Booking confidence</h2><dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">{[["97%","Response rate"],["94%","Acceptance rate"],["1.2%","Cancellation rate"],["4.8","Average guest rating"]].map(([value,label])=><span className="contents" key={label}><dt className="font-bold">{value}</dt><dd className="text-[var(--foreground-muted)]">{label}</dd></span>)}</dl></section>;
}

function Questions() {
  return <section className={`${panel} p-5`}><h2 className="text-lg font-semibold">Common questions</h2><div className="mt-4 space-y-2">{faqs.map(([question,answer])=><details key={question} className="group rounded-[var(--radius-md)] border border-[var(--border-strong)] open:border-[var(--brand)]"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[var(--radius-md)] p-3 text-sm font-medium outline-none hover:bg-[var(--brand-soft)] focus-visible:shadow-[var(--shadow-focus)]">{question}<ChevronDown className="size-4 shrink-0 transition group-open:rotate-180"/></summary><p className="px-3 pb-3 text-sm leading-6 text-[var(--foreground-muted)]">{answer}</p></details>)}</div></section>;
}

function Safety() {
  return <section className={`${panel} p-5`}><h2 className="text-lg font-semibold">Safety</h2><p className="mt-3 flex gap-3 text-sm leading-6 text-[var(--foreground-muted)]"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--brand)]"/>For your safety, keep payments and booking changes inside DAR.</p><div className="mt-4 flex gap-3 text-xs text-[var(--foreground-muted)]"><House className="size-4"/><Languages className="size-4"/><span>English, Arabic</span></div></section>;
}
