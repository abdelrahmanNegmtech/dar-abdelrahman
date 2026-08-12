import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/host-landing/icons";
import { DarLogo } from "@/components/brand/dar-logo";
import { getCurrentProfile } from "@/lib/supabase/auth";

const sidebarItems = [
  ["Overview", "home", "/dashboard", ""],
  ["My Properties", "building", "/add-property", "active"],
  ["Booking Requests", "receipt", "/owner/bookings/request-decision", "14"],
  ["Calendar", "calendar", "/owner/properties/1/calendar-management", ""],
  ["Messages", "message", "/owner/help-center", "3"],
  ["Payments", "card", "/owner/payouts", ""],
  ["Reviews", "star", "/owner/properties", ""],
  ["Verification", "shield", "/owner/verification", ""],
  ["Settings", "dashboard", "/owner/help-center", ""],
] as const;

const steps = ["Basic details", "Location", "Photos", "Pricing", "Rules", "Documents", "Review"];
const photoAssets = [
  "add-property-thumb-living.png",
  "add-property-thumb-bedroom.png",
  "add-property-thumb-kitchen.png",
  "add-property-thumb-bathroom.png",
  "add-property-thumb-balcony.png",
  "add-property-thumb-building.png",
];
const amenities = ["Wi-Fi", "Air conditioning", "Kitchen", "Washing machine", "Smart TV", "Workspace", "Parking", "Pool", "Gym", "Balcony", "Security", "Cleaning service"];
const amenityIcons: Record<string, string> = {
  "Wi-Fi": "wifi",
  "Air conditioning": "snowflake",
  Kitchen: "kitchen",
  "Washing machine": "washing",
  "Smart TV": "tv",
  Workspace: "briefcase",
  Parking: "car",
  Pool: "pool",
  Gym: "dumbbell",
  Balcony: "building",
  Security: "shield",
  "Cleaning service": "check",
};
const missingItems = ["Add ownership document", "Add cancellation policy", "Confirm address pin"];
const tips = ["Use real, bright photos", "Add clear rules and check-in info", "Keep prices competitive", "Respond quickly to guests"];

const cardFrame = "rounded-lg border border-[#dfe5ef] bg-white shadow-[0_6px_18px_rgba(8,18,43,0.025)]";
const formCardFrame = "rounded-xl border border-[#dfe5ef] bg-white shadow-[0_8px_24px_rgba(8,18,43,0.025)]";

export default async function AddPropertyPage() {
  const profile = await getCurrentProfile();

  if (profile?.account_type === "owner") {
    redirect("/owner/properties/new/details");
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[var(--foreground)]">
      <div className="owner-dashboard-frame">
        <AddPropertySidebar />
        <section className="owner-dashboard-main pb-[72px]">
          <div className="owner-dashboard-content">
            <Header />
            <Steps />
            <div className="mt-4 grid grid-cols-[minmax(0,1fr)_320px] gap-4">
              <div className="min-w-0 space-y-3">
                <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-3">
                  <div className="space-y-3">
                    <BasicDetails />
                    <CapacityRooms />
                  </div>
                  <LocationCard />
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_460px] gap-3">
                  <PhotosCard />
                  <AmenitiesCard />
                </div>
                <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-3">
                  <PricingCard />
                  <HouseRulesCard />
                </div>
                <DocumentsCard />
              </div>
              <RightRail />
            </div>
          </div>
          <BottomBar />
        </section>
      </div>
    </main>
  );
}

function AddPropertySidebar() {
  return (
    <aside className="flex w-[230px] shrink-0 flex-col bg-[#020b18] px-3.5 py-7 text-white">
      <DarLogo surface="dark" width={120} height={43} className="ml-4 h-auto w-[120px] object-contain" priority />
      <div className="mt-7 rounded-xl border border-white/12 bg-white/[0.035] p-3.5">
        <div className="flex items-center gap-3">
          <Image src="/dashboard-avatar-omar.png" alt="" width={46} height={46} className="size-[46px] rounded-full object-cover" />
          <div>
            <p className="owner-card-title">Ahmed Hassan</p>
            <p className="mt-1 flex items-center gap-1 owner-label text-[#f6d15f]">Verified Owner <span className="grid size-3 place-items-center rounded-full bg-[#f5a524] text-[var(--foreground)]"><Icon name="check" className="size-[8px]"/></span></p>
          </div>
        </div>
      </div>
      <nav className="mt-5 space-y-2">
        {sidebarItems.map(([label, icon, href, state]) => (
          <Link href={href} key={label} className={`flex h-10 items-center gap-3 rounded-lg px-3 owner-button-text ${state === "active" ? "bg-[var(--brand)]/70 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.07)]" : "text-white/90 hover:bg-white/5"}`}>
            <Icon name={icon} className="size-5" />
            <span>{label}</span>
            {state && state !== "active" ? <span className={`ml-auto grid size-5 place-items-center rounded-full owner-button-text ${state === "14" ? "bg-[#f5a524] text-white" : "bg-[#7c3cff] text-white"}`}>{state}</span> : null}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-lg border border-white/12 bg-white/[0.03] p-4">
        <Icon name="star" className="size-7 text-[#f5a524]" />
        <h3 className="mt-3 owner-card-title">Grow your earnings</h3>
        <p className="mt-2 owner-helper text-white/75">List more properties and reach thousands of verified guests.</p>
        <Link href="/owner/properties/new/photos" className="mt-4 flex h-9 items-center justify-center rounded-md bg-[#6d35ee] owner-card-title text-white">Add new property</Link>
      </div>
      <Link href="#" className="mt-5 flex h-10 items-center justify-between border-t border-white/10 pt-5 owner-button-text text-white/90"><span className="flex items-center gap-3"><Icon name="headset" className="size-5" />Support center</span><Icon name="chevron" className="size-4 -rotate-90" /></Link>
      <Link href="/" className="mt-5 flex h-9 items-center gap-3 border-t border-white/10 pt-5 owner-button-text text-white/90"><Icon name="card" className="size-5" />Log out</Link>
    </aside>
  );
}

function Header() {
  return (
    <header className="flex items-start justify-between">
      <div>
        <div className="owner-helper text-[#68748a]">Owner Dashboard <span className="mx-2 text-[#a5afbf]">/</span> My Properties <span className="mx-2 text-[#a5afbf]">/</span> <span className="font-bold text-[var(--foreground)]">Add Property</span></div>
        <h1 className="mt-3 owner-page-title">Add a new property</h1>
        <p className="mt-1 owner-page-description text-[#52607a]">Complete the details below. DAR will review the listing before it goes live.</p>
      </div>
      <div className="flex items-center gap-3">
        <ActionButton icon="receipt">Save draft</ActionButton>
        <ActionButton icon="play">Preview</ActionButton>
        <ActionButton icon="navigation" primary>Submit for review</ActionButton>
      </div>
    </header>
  );
}

function ActionButton({ children, icon, primary = false }: { children: string; icon: string; primary?: boolean }) {
  return (
    <button className={`flex h-9 items-center gap-2 rounded-md px-5 owner-card-title ${primary ? "bg-[var(--brand)] text-white shadow-[0_10px_22px_rgba(91,43,224,0.18)]" : "border border-[#dbe2ee] bg-white text-[#26344f]"}`}>
      <Icon name={icon} className="size-4" />
      {children}
    </button>
  );
}

function Steps() {
  return (
    <div className="mt-4 px-9">
      <div className="grid grid-cols-7 items-start">
        {steps.map((label, index) => (
          <div className="relative text-center" key={label}>
            {index < steps.length - 1 ? <span className="absolute left-1/2 right-[-50%] top-2.5 h-px bg-[#bfc8d9]" /> : null}
            <span className={`relative z-10 mx-auto grid size-5 place-items-center rounded-full border owner-button-text ${index === 0 ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[#bfc8d9] bg-white text-[#52607a]"}`}>{index + 1}</span>
            <p className={`mt-1.5 owner-label ${index === 0 ? "text-[var(--brand)]" : "text-[#26344f]"}`}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BasicDetails() {
  return (
    <section className={`px-4 pb-4 pt-3.5 ${formCardFrame}`}>
      <CardTitle number="1" title="Basic details" />
      <div className="mt-3.5 grid grid-cols-[minmax(0,1fr)_124px_194px] gap-3">
        <Field label="Listing title *" placeholder="e.g. Modern Studio in Madinaty with Balcony" />
        <SelectLike label="Property type *" value="Studio" />
        <div>
          <p className="mb-1 owner-label text-[#52607a]">Category *</p>
          <div className="flex h-8 items-center overflow-hidden rounded-md border border-[#dbe2ee] bg-white owner-label">
            <span className="grid h-full flex-1 place-items-center bg-[#eee8ff] text-[var(--brand)]">Studios & Apartments</span>
            <span className="grid h-full w-14 place-items-center text-[#52607a]">Hotels</span>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_194px] gap-3">
        <div>
          <p className="mb-1 owner-label text-[#52607a]">Description *</p>
          <div className="relative h-[110px] rounded-md border border-[#dbe2ee] bg-white px-3 py-2.5 owner-badge text-[#8a95aa]">Describe your property, amenities, nearby places and what makes it special...<span className="absolute bottom-2 right-3 owner-badge text-[#52607a]">0/1000</span></div>
        </div>
        <div className="space-y-2">
          <SelectLike label="City *" value="Madinaty" />
          <SelectLike label="Neighborhood / Area *" value="B6" />
          <SelectLike label="Building / Compound" value="Madinaty Heights" />
        </div>
      </div>
    </section>
  );
}

function CapacityRooms() {
  return (
    <section className={`px-4 pb-4 pt-3.5 ${formCardFrame}`}>
      <CardTitle number="2" title="Capacity & rooms" />
      <div className="mt-3.5 grid grid-cols-4 gap-3">
        <SelectLike label="Guests max *" value="2" icon="users" />
        <SelectLike label="Bedrooms *" value="1" icon="bed" />
        <SelectLike label="Beds *" value="1" icon="bed" />
        <SelectLike label="Bathrooms *" value="1" icon="bath" />
      </div>
      <div className="mt-3 grid grid-cols-[124px_124px_1fr] items-end gap-3">
        <Field label="Size (m²) *" placeholder="45" />
        <Field label="Floor number" placeholder="3" />
        <Toggle label="Elevator available" checked />
      </div>
    </section>
  );
}

function LocationCard() {
  return (
    <section className={`flex h-full flex-col p-3 ${cardFrame}`}>
      <CardTitle number="3" title="Location" />
      <Field label="Full address *" placeholder="Madinaty B6, Building 64, Apartment 32, Cairo, Egypt" />
      <div className="relative mt-2 h-[190px] overflow-hidden rounded-lg bg-[#f4f1eb]">
        <div className="absolute inset-0 opacity-90 [background:linear-gradient(26deg,transparent_0_10%,#ded8cf_10.3%_11.2%,transparent_11.5%_31%,#ded8cf_31.3%_32.2%,transparent_32.5%_56%,#ded8cf_56.3%_57.2%,transparent_57.5%),linear-gradient(116deg,transparent_0_18%,#ded8cf_18.3%_19.2%,transparent_19.5%_43%,#ded8cf_43.3%_44.2%,transparent_44.5%_70%,#ded8cf_70.3%_71.2%,transparent_71.5%),linear-gradient(38deg,transparent_0_22%,#cdeaf7_22.4%_24.2%,transparent_24.6%_60%,#cdeaf7_60.4%_62.2%,transparent_62.6%),linear-gradient(155deg,transparent_0_38%,#e7e1d9_38.3%_39.1%,transparent_39.5%),#f4f1eb]" />
        <div className="absolute -left-8 top-1 h-10 w-28 rotate-[23deg] bg-[#dff1d8]/60 blur-[1px]" />
        <div className="absolute right-16 top-4 h-8 w-20 -rotate-[18deg] bg-[#dff1d8]/55 blur-[1px]" />
        <span className="absolute left-5 top-4 owner-badge text-[#9aaba4]">Rawand<br />Luxury</span>
        <span className="absolute left-[23%] top-[43%] text-[15px] text-[#78879a]">Madinaty</span>
        <span className="absolute left-[29%] top-[56%] text-[9px] text-[#a5a79e]">مدينة</span>
        <span className="absolute right-[25%] top-8 owner-badge text-[#9aaba4]">Business<br />District</span>
        <span className="absolute right-4 bottom-5 owner-badge text-[#9a9f9f]">Aroming</span>
        <div className="absolute left-[50%] top-[36%] h-9 w-7 -translate-x-1/2">
          <div className="grid size-7 rotate-45 place-items-center rounded-[50%_50%_50%_0] bg-[var(--brand)] shadow-[0_7px_14px_rgba(91,43,224,0.28)]">
            <Icon name="navigation" className="size-3.5 -rotate-45 text-white" />
          </div>
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-white/95 px-3 py-2 owner-badge shadow-[0_6px_16px_rgba(8,18,43,0.08)]"><p className="owner-label">Address confidence</p><p className="mt-1 flex items-center gap-1.5 text-[#11813a]"><span className="grid size-3.5 place-items-center rounded-full bg-[#21b35b] text-white"><Icon name="check" className="size-[9px]"/></span>92% High</p></div>
      </div>
      <p className="mt-3 owner-label text-[#52607a]">Nearby landmarks (optional)</p>
      <div className="mt-1.5 grid grid-cols-3 gap-3">
        <Field label="Mall" placeholder="Open Air Mall" />
        <Field label="Transport" placeholder="B6 Bus Station" />
        <Field label="Restaurants" placeholder="Madinaty Food Court" />
      </div>
      <label className="mt-2.5 flex items-center gap-2 owner-label text-[#26344f]"><span className="grid size-4 place-items-center rounded bg-[var(--brand)] owner-badge text-white"><Icon name="check" className="size-[10px]"/></span>Show approximate location publicly until booking is confirmed</label>
    </section>
  );
}

function PhotosCard() {
  const photoPositions = ["object-center", "object-center", "object-center", "object-center", "object-[58%_42%]", "object-[60%_50%]"];

  return (
    <section className={`min-w-0 overflow-hidden p-3 ${cardFrame}`}>
      <div className="flex items-center justify-between">
        <CardTitle number="4" title="Photos" />
        <div className="flex items-center gap-8 owner-badge text-[#52607a]"><span>Photo quality <b className="ml-2 text-[#11813a]">8/10 Good</b> <span className="ml-1 inline-grid size-3 place-items-center rounded-full border border-[#9b85ef] text-[9px] text-[#6d35ee]">i</span></span><div><p className="owner-label">AI enhance</p><p className="mt-1 owner-badge">Improve brightness & crop</p></div><span className="flex h-4 w-8 items-center justify-end rounded-full bg-[var(--brand)] p-0.5"><i className="size-3 rounded-full bg-white" /></span></div>
      </div>
      <div className="mt-2.5 grid min-w-0 grid-cols-[140px_90px_minmax(0,1fr)] gap-1.5">
        <div className="grid h-[124px] place-items-center rounded-lg border border-dashed border-[#b7c4dc] bg-[#fbfcff] text-center owner-badge text-[var(--brand)]">
          <div><Icon name="cloud-upload" className="mx-auto size-9 text-[#6d35ee]" /><p className="mt-2 text-[#26344f]">Drag & drop photos here</p><p className="mt-1 text-[var(--brand)]">or click to browse</p><p className="mt-2 text-[8px] text-[#8a95aa]">Up to 30 photos, JPG or PNG, max 10MB</p></div>
        </div>
        <div className="owner-badge">
          <p className="font-bold">Required photos</p>
          {["Cover photo", "Bedroom", "Bathroom", "Kitchen / Living area", "Exterior / Building"].map((item) => <p key={item} className="mt-2 flex items-center gap-2 text-[#26344f]"><span className="grid size-3.5 place-items-center rounded-full border border-[#20a957] text-[#20a957]"><Icon name="check" className="size-2.5" /></span>{item}</p>)}
        </div>
        <div className="grid min-w-0 grid-cols-6 gap-2 overflow-hidden">
          {photoAssets.map((img, index) => (
            <div className="relative h-[124px] min-w-0 overflow-hidden rounded-md bg-[#edf1f7]" key={img}>
              <Image src={`/${img}`} alt="" fill sizes="70px" className={`object-cover ${photoPositions[index]}`} />
              <span className="absolute left-1 top-1 text-white/80"><Icon name="grip" className="size-4" /></span>
              <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-white/95 text-[#26344f] shadow-sm"><Icon name="x" className="size-3" /></span>
              {index === 0 ? <span className="absolute bottom-1 left-1 rounded bg-[var(--brand)] px-2 py-1 owner-badge text-white shadow-sm">Cover</span> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AmenitiesCard() {
  return (
    <section className={`min-w-0 overflow-hidden p-3 ${cardFrame}`}>
      <CardTitle number="5" title="Amenities" />
      <div className="mt-3 grid min-w-0 grid-cols-[74px_116px_84px_138px] gap-x-2 gap-y-3">
        {amenities.map((item, index) => (
          <label className="flex h-8 min-w-0 items-center gap-1 rounded-md border border-[#dbe2ee] px-1.5 owner-badge text-[#26344f]" key={item}>
            <span className={`grid size-4 shrink-0 place-items-center rounded ${index === 2 ? "border border-[#b7c4dc] text-[#8a95aa]" : "bg-[var(--brand)] text-white"}`}>{index === 2 ? "" : <Icon name="check" className="size-3" />}</span>
            {amenityIcons[item] ? <Icon name={amenityIcons[item]} className={`size-2.5 shrink-0 ${index === 2 ? "text-[#8a95aa]" : "text-[#8a63f3]"}`} /> : null}
            <span className="min-w-0 whitespace-nowrap">{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function PricingCard() {
  return (
    <section className={`p-3 ${cardFrame}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-3">
        <div>
          <CardTitle number="6" title="Pricing & availability" />
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <Field label="Nightly price (EGP) *" placeholder="1,200" />
            <Field label="Weekend price (EGP)" placeholder="1,400" />
            <Field label="Cleaning fee (EGP)" placeholder="250" />
            <Field label="Minimum nights" placeholder="2" />
            <Field label="Maximum nights" placeholder="30" />
            <Field label="Monthly discount (%)" placeholder="10" />
          </div>
          <Toggle label="Instant booking" checked />
          <p className="mt-1 owner-helper text-[#52607a]">Accept bookings automatically.</p>
        </div>
        <CalendarPreview />
      </div>
    </section>
  );
}

function CalendarPreview() {
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return (
    <div className="border-l border-[#e1e7f0] pl-4">
      <div className="flex items-center justify-between">
        <p className="owner-label text-[#52607a]">Calendar preview</p>
        <div className="flex items-center gap-3 owner-badge text-[#52607a]"><span><i className="mr-1 inline-block size-2 bg-[#e9edf5]" />Available</span><span><i className="mr-1 inline-block size-2 bg-[var(--brand)]" />Booked</span><span><i className="mr-1 inline-block size-2 bg-[#f7b44a]" />Blocked</span></div>
      </div>
      <div className="mt-3 flex items-center justify-between owner-label"><Icon name="chevron" className="size-4 rotate-90" />May 2026<Icon name="chevron" className="size-4 -rotate-90" /></div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center owner-badge text-[#52607a]">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d}>{d}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-center owner-badge">
        {days.map((day) => <span className={`grid h-5 place-items-center rounded ${day === 10 || day === 11 ? "bg-[#fff0d6] text-[#d98200]" : day >= 20 && day <= 25 ? "bg-[#e9e1ff] text-[var(--brand)]" : "text-[#52607a]"}`} key={day}>{day}</span>)}
      </div>
    </div>
  );
}

function HouseRulesCard() {
  return (
    <section className={`p-3 ${cardFrame}`}>
      <CardTitle number="7" title="House rules" />
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <Field label="Check-in time" placeholder="After 2:00 PM" />
        <Field label="Check-out time" placeholder="Before 11:00 AM" />
      </div>
      <div className="mt-2.5 grid grid-cols-[170px_1fr] gap-3">
        <div className="space-y-2">
          <Toggle label="Smoking allowed" />
          <Toggle label="Parties allowed" />
          <Toggle label="Pets allowed" />
          <Toggle label="ID required" checked />
        </div>
        <div>
          <p className="mb-1 owner-label text-[#52607a]">Custom rules</p>
          <div className="relative h-[68px] rounded-md border border-[#dbe2ee] p-3 owner-badge text-[#26344f]">Keep noise down after 10 PM, respect neighbors and building rules.<span className="absolute bottom-1.5 right-3 owner-badge text-[#52607a]">0/300</span></div>
        </div>
      </div>
    </section>
  );
}

function DocumentsCard() {
  return (
    <section className={`p-3 ${cardFrame}`}>
      <div className="grid grid-cols-[1fr_330px] gap-4">
        <div>
          <CardTitle number="6" title="Documents & verification" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            <DocumentBox title="Owner ID (Required)" file="Ahmed ID.jpg" ok />
            <DocumentBox title="Ownership / Authorization (Required)" file="Contract.pdf" ok />
            <DocumentBox title="Utility bill (Optional)" file="Add document" />
            <DocumentBox title="Hotel license (Optional for hotels)" file="Add document" />
          </div>
        </div>
        <div className="border-l border-[#e1e7f0] pl-4">
          <p className="owner-card-title">Verification status</p>
          <div className="mt-4 flex items-center justify-between">
            <div><p className="owner-label text-[#52607a]">Overall status</p><span className="mt-2 inline-flex rounded-md bg-[#fff0d6] px-3 py-1 owner-label text-[#d98200]">Pending review</span></div>
            <Icon name="shield" className="size-12 text-[#f5a524]" />
          </div>
          <p className="mt-4 owner-helper text-[#52607a]">We&apos;ll notify you once we review your documents.</p>
        </div>
      </div>
    </section>
  );
}

function RightRail() {
  return (
    <aside className="space-y-3">
      <PreviewCard />
      <ScoreCard />
      <ListCard title="Missing items" items={missingItems} icon="receipt" />
      <TimelineRail />
      <ListCard title="Tips for a successful listing" items={tips} icon="star" />
    </aside>
  );
}

function PreviewCard() {
  return (
    <section className={`p-3 ${cardFrame}`}>
      <div className="flex items-center justify-between"><h2 className="owner-card-title">Listing preview</h2><a className="owner-button-text text-[var(--brand)]" href="#">Edit preview</a></div>
      <div className="relative mt-2.5 h-[132px] overflow-hidden rounded-lg">
        <Image src="/property-studio-reference.png" alt="" fill sizes="280px" className="object-cover" />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/80 px-3 py-1 owner-button-text text-white">Cover photo</span>
      </div>
      <h3 className="mt-2.5 owner-card-title">Modern Studio in Madinaty</h3>
      <p className="mt-1 owner-helper text-[#52607a]">Madinaty B6, Cairo, Egypt</p>
      <div className="mt-2.5 flex items-center justify-between">
        <p className="owner-card-title">EGP 1,200 <span className="font-medium text-[#52607a]">/ night</span></p>
        <span className="rounded-md bg-[#fff0d6] px-3 py-1 owner-button-text text-[#d98200]">Pending review</span>
      </div>
      <p className="mt-2 flex items-center gap-1 owner-helper text-[#52607a]"><Icon name="star" className="size-[12px]"/>No reviews yet</p>
    </section>
  );
}

function ScoreCard() {
  return (
    <section className={`p-3 ${cardFrame}`}>
      <div className="flex items-center justify-between"><h2 className="owner-card-title">Completion score</h2><a className="owner-badge text-[var(--brand)]" href="#">View all requirements</a></div>
      <p className="mt-1.5 owner-label">82% complete</p>
      <div className="mt-2.5 h-1.5 rounded-full bg-[#edf1f7]"><div className="h-1.5 w-[82%] rounded-full bg-[var(--brand)]" /></div>
    </section>
  );
}

function TimelineRail() {
  const items = [["Draft", "In progress", true], ["Submitted", "Pending", false], ["DAR review", "Up to 2 business days", false], ["Approved", "You'll be notified", false], ["Live", "Visible to guests", false]] as const;
  return (
    <section className={`p-3 ${cardFrame}`}>
      <h2 className="owner-card-title">Approval timeline</h2>
      <div className="mt-3 space-y-3">
        {items.map(([title, note, active]) => (
          <div className="flex gap-3" key={title}>
            <span className={`mt-1 size-3 shrink-0 rounded-full border ${active ? "border-[var(--brand)] bg-[var(--brand)]" : "border-[#b7c4dc] bg-white"}`} />
            <div><p className="owner-label">{title}</p><p className="owner-badge text-[#52607a]">{note}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ListCard({ title, items, icon }: { title: string; items: readonly string[]; icon: string }) {
  const isTipsCard = title === "Tips for a successful listing";
  const tipIcons = ["camera", "receipt", "tag", "target"] as const;

  return (
    <section className={`p-3 ${cardFrame}`}>
      <h2 className="owner-card-title">{title}</h2>
      <div className="mt-2.5 divide-y divide-[#edf1f7]">
        {items.map((item, index) => (
          <div className="flex h-8 items-center gap-3 owner-label text-[#26344f]" key={item}>
            <span className={isTipsCard ? "grid size-5 place-items-center text-[#6C3BFF]" : "grid size-6 place-items-center rounded-md bg-[#fff5df] text-[#f5a524]"}>
              <Icon name={isTipsCard ? tipIcons[index] ?? icon : icon} className="size-4" />
            </span>
            <span className="flex-1">{item}</span>
            {title === "Missing items" ? <Icon name="chevron" className="size-4 -rotate-90 text-[#52607a]" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function BottomBar() {
  return (
    <div className="fixed bottom-0 left-[230px] right-0 z-20 border-t border-[#dfe5ef] bg-white/95 px-8 py-3 backdrop-blur">
        <div className="flex w-full items-center justify-between px-7">
        <p className="flex items-center gap-2 owner-helper text-[#52607a]"><span className="grid size-5 place-items-center rounded-full border border-[#20b45b] text-[#20b45b]"><Icon name="check" className="size-[11px]"/></span>All changes are saved automatically</p>
        <div className="flex items-center gap-4"><ActionButton icon="receipt">Save draft</ActionButton><ActionButton icon="play">Preview listing</ActionButton><ActionButton icon="navigation" primary>Submit for review</ActionButton></div>
      </div>
    </div>
  );
}

function CardTitle({ number, title }: { number: string; title: string }) {
  return <div className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full border border-[#c9b8ff] owner-button-text text-[var(--brand)]">{number}</span><h2 className="owner-card-title">{title}</h2></div>;
}

function Field({ label, placeholder, hideLabel = false }: { label: string; placeholder: string; hideLabel?: boolean }) {
  return (
    <label className="block">
      {!hideLabel ? <p className="mb-1 owner-label text-[#52607a]">{label}</p> : null}
      <div className="flex h-8 items-center rounded-md border border-[#dbe2ee] bg-white px-3 owner-badge text-[#26344f]">{placeholder}</div>
    </label>
  );
}

function SelectLike({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <label className="block">
      <p className="mb-1 owner-label text-[#52607a]">{label}</p>
      <div className="flex h-8 items-center justify-between rounded-md border border-[#dbe2ee] bg-white px-3 owner-badge text-[#26344f]">
        <span className="flex items-center gap-2">{icon ? <Icon name={icon} className="size-3.5 text-[#52607a]" /> : null}{value}</span>
        <Icon name="chevron" className="size-3 text-[#52607a]" />
      </div>
    </label>
  );
}

function Toggle({ label, checked = false }: { label: string; checked?: boolean }) {
  return <div className="mt-2.5 flex items-center justify-between gap-2 owner-label text-[#52607a]"><span>{label}</span><span className={`flex h-4 w-8 items-center rounded-full p-0.5 ${checked ? "justify-end bg-[var(--brand)]" : "justify-start bg-[#c6cedb]"}`}><i className="size-3 rounded-full bg-white" /></span></div>;
}

function DocumentBox({ title, file, ok = false }: { title: string; file: string; ok?: boolean }) {
  return (
    <div className="grid grid-cols-[38px_1fr] gap-2 rounded-lg border border-[#dbe2ee] p-2">
      <span className="grid size-9 place-items-center rounded-md bg-[#f8fafc] text-[var(--brand)]"><Icon name="receipt" className="size-4" /></span>
      <div><p className="owner-badge">{title}</p><p className={`mt-1 owner-button-text ${ok ? "text-[#11813a]" : "text-[var(--brand)]"}`}>{ok ? file : "Upload"}</p></div>
    </div>
  );
}
