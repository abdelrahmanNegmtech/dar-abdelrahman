import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/host-landing/icons";
import { OwnerProfileLink } from "@/components/owners/owner-profile-link";
import { DarLogo } from "@/components/brand/dar-logo";

const ahmedHassan = {
  name: "Ahmed Hassan",
  slug: "ahmed-hassan",
} as const;

const navItems = ["Overview", "My Bookings", "Saved Stays", "Messages", "Payments", "Reviews", "Profile", "Support", "Settings"];

const stats = [
  ["calendar", "Upcoming bookings", "2", "Next check-in in 3 days", "bg-[#f1edff]", "text-[#5b2be0]"],
  ["heart", "Saved stays", "14", "Places you saved", "bg-[#fff0f3]", "text-[#ef476f]"],
  ["wallet", "Total spent", "EGP 18,950", "All time bookings", "bg-[#fff5df]", "text-[#f59f00]"],
  ["star", "Reward points", "1,240", "DAR Rewards", "bg-[#f1edff]", "text-[#5b2be0]"],
  ["message", "Messages", "3 unread", "New messages", "bg-[#eaf6ff]", "text-[#0984e3]"],
] as const;

const bookingRows = [
  ["property-studio-reference.png", "Luxury Studio in Madinaty", "B6, Madinaty", "May 20 - 25, 2026", "(5 nights)", "EGP 6,370", "pay-vodafone-reference.png", "Vodafone Cash", "Verified", "Confirmed", "View"],
  ["property-hotel-reference.png", "Premium Hotel Room", "Cairo East", "Jun 02 - 05, 2026", "(3 nights)", "EGP 4,800", "pay-card-reference.png", "VISA •••• 4242", "Pending", "Pending owner approval", "View"],
  ["property-serviced-reference.png", "Cozy Studio with Balcony", "Noor City", "Apr 28 - May 01, 2026", "(3 nights)", "EGP 3,200", "pay-fawry-reference.png", "fawry", "Paid", "Completed", "Review"],
] as const;

const savedStays = [
  ["property-studio-reference.png", "Modern Furnished Apartment", "New Capital", "4.8 (18)", "EGP 1,600"],
  ["property-serviced-reference.png", "Serviced Apartment near B12", "Madinaty", "4.9 (27)", "EGP 1,800"],
  ["property-hotel-reference.png", "Premium Hotel Room", "Cairo East", "4.7 (41)", "EGP 1,450"],
] as const;

const recommendations = [
  ["property-furnished-reference.png", "Match 90%", "Luxury Apartment", "Madinaty", "EGP 1,700", "4.9 (23)"],
  ["dar-host-hero-bg-final.png", "Match 88%", "Skyline Studio", "New Capital", "EGP 1,250", "4.8 (19)"],
  ["property-hotel-reference.png", "Match 86%", "Cozy Loft", "Noor City", "EGP 1,050", "4.7 (16)"],
] as const;

const cardFrame = "rounded-lg border border-[#e2e7f0] bg-white shadow-[0_8px_24px_rgba(8,18,43,0.03)]";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#08122b]">
      <div className="owner-dashboard-frame">
        <Sidebar />
        <div className="owner-dashboard-main owner-dashboard-content">
          <DashboardHeader />
          <StatsGrid />
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_300px] gap-4 max-[1180px]:grid-cols-1">
            <div className="min-w-0 space-y-4">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(245px,255px)] gap-4 max-[1450px]:grid-cols-[minmax(0,1fr)_240px] max-[1180px]:grid-cols-1">
                <UpcomingStay />
                <TimelineCard />
              </div>
              <BookingsTable />
              <div className="grid grid-cols-[minmax(0,1fr)_240px] gap-4 max-[1450px]:grid-cols-[minmax(0,1fr)_230px] max-[1180px]:grid-cols-1">
                <SavedStays />
                <ProfileCompletion />
              </div>
            </div>
            <aside className="space-y-4">
              <MessagesCard />
              <WalletCard />
              <AiRecommendations />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="flex w-[232px] shrink-0 flex-col bg-[#020b18] px-4 py-6 text-white">
      <DarLogo surface="dark" width={118} height={42} className="h-auto w-[118px] object-contain" priority />
      <div className="mt-6 rounded-lg border border-white/15 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg" />
          <div>
            <p className="text-sm font-bold">Ismail Negm</p>
            <p className="mt-1 text-xs text-white/75">Guest</p>
            <p className="mt-2 text-xs text-white/90">Cairo / Berlin</p>
          </div>
        </div>
      </div>
      <nav className="mt-5 space-y-2">
        {navItems.map((item, index) => (
          <Link
            href={item === "My Bookings" ? "/owner/bookings/request-decision" : index === 0 ? "/dashboard" : `/dashboard/${item.toLowerCase().replaceAll(" ", "-")}`}
            className={`relative flex h-11 items-center gap-3 rounded-md px-4 text-sm font-semibold ${index === 0 ? "bg-white/10 text-white before:absolute before:left-0 before:h-full before:w-1 before:rounded-r before:bg-[#7c3cff]" : "text-white/90 hover:bg-white/5"}`}
            key={item}
          >
            <Icon name={index === 0 ? "home" : index === 1 ? "calendar" : index === 2 ? "heart" : index === 3 ? "message" : index === 4 ? "card" : index === 5 ? "star" : index === 6 ? "user" : index === 7 ? "headset" : "dashboard"} className="size-5" />
            <span>{item}</span>
            {item === "Messages" ? <span className="ml-auto grid size-5 place-items-center rounded-full bg-[#6d35ee] text-xs">3</span> : null}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-lg border border-white/15 bg-white/[0.02] p-4">
        <Icon name="home" className="size-8 text-[#f5a524]" />
        <h3 className="mt-3 text-sm font-bold">List your property</h3>
        <p className="mt-2 text-xs leading-5 text-white/75">Earn more by sharing your space with travelers.</p>
        <Link href="/owner/properties/new/photos" className="mt-5 flex h-9 items-center justify-center rounded-md bg-[#5b2be0] text-sm font-bold text-white">Become a host</Link>
      </div>
    </aside>
  );
}

function DashboardHeader() {
  return (
    <header className="relative flex items-start justify-between gap-5 max-[1180px]:flex-wrap">
      <div>
        <h1 className="text-[26px] font-bold leading-8">Welcome back, Ismail.</h1>
        <p className="mt-1 text-sm text-[#52607a]">Manage your bookings, saved stays and travel details.</p>
      </div>
      <div className="flex items-center gap-5 max-[1180px]:w-full">
        <label className="flex h-10 w-[314px] items-center gap-3 rounded-lg border border-[#dfe4ee] bg-white px-4 text-sm text-[#52607a] max-[1180px]:flex-1">
          <Icon name="search" className="size-4" />
          <input className="min-w-0 flex-1 outline-none" placeholder="Search bookings or stays" />
        </label>
        <span className="relative"><Icon name="bell" className="size-5" /><span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#5b2be0]" /></span>
        <span className="flex items-center gap-2 text-sm"><Icon name="globe" className="size-5" /> English / EGP <Icon name="chevron" className="size-4" /></span>
        <Avatar />
        <Link href="#" className="absolute right-0 top-[49px] flex h-9 items-center gap-2 rounded-md bg-[#5b2be0] px-6 text-sm font-bold text-white shadow-[0_10px_22px_rgba(91,43,224,0.25)]"><Icon name="star" className="size-4" />Find a new stay</Link>
      </div>
    </header>
  );
}

function StatsGrid() {
  return (
    <div className="mt-6 grid grid-cols-5 gap-3 max-[1180px]:grid-cols-2">
      {stats.map(([icon, label, value, note, bg, color]) => (
        <section className={`flex h-[92px] items-center gap-4 p-4 ${cardFrame}`} key={label}>
          <span className={`grid size-[52px] place-items-center rounded-lg ${bg} ${color}`}>
            <Icon name={icon} className="size-7" />
          </span>
          <div>
            <p className="text-xs text-[#52607a]">{label}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-[#52607a]">{note}</p>
          </div>
        </section>
      ))}
    </div>
  );
}

function UpcomingStay() {
  return (
    <section className={`relative min-h-[358px] overflow-visible px-4 pb-6 pt-4 ${cardFrame}`}>
      <h2 className="text-base font-bold leading-5">Upcoming stay</h2>
      <div className="absolute right-4 top-[24px] rounded-lg bg-[#f1edff] px-4 py-2.5 text-center text-[#5b2be0]"><p className="text-xs">Check-in in</p><b className="text-3xl leading-8">3</b><p className="text-xs">days</p></div>
      <div className="mt-3 grid grid-cols-[minmax(220px,255px)_minmax(0,1fr)] gap-5 max-[1450px]:grid-cols-[220px_minmax(0,1fr)]">
        <Image src="/property-studio-reference.png" alt="" width={255} height={181} className="h-[181px] w-full rounded-md object-cover object-center" />
        <div className="min-w-0">
          <h3 className="pr-[96px] text-[18px] font-bold leading-6">Luxury Studio in Madinaty</h3>
          <p className="mt-1.5 text-sm text-[#52607a]"><Icon name="star" className="inline size-[13px] fill-[#f7a20b] text-[#f7a20b]"/> 4.9 (32 reviews)</p>
          <p className="mt-1.5 text-sm text-[#52607a]">B6, Madinaty, Cairo, Egypt</p>
          <div className="mt-2 grid grid-cols-3 rounded-md border border-[#e2e7f0]">
            {["Check-in|May 20, 2026", "Check-out|May 25, 2026", "Guests|2 guests"].map((item) => {
              const [label, value] = item.split("|");
              return <div className="min-w-0 border-r border-[#e2e7f0] p-1.5 last:border-r-0" key={label}><p className="text-[11px] text-[#52607a]">{label}</p><p className="mt-0.5 text-xs font-semibold">{value}</p></div>;
            })}
          </div>
          <div className="mt-2 grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-2 text-xs">
            <div>
              <p className="text-xs text-[#52607a]">Status</p>
              <OwnerProfileLink
                owner={ahmedHassan}
                className="mt-1 inline-flex rounded bg-[#dff7e8] px-2 py-1 text-xs font-semibold text-[#11813a] hover:underline"
              >
                Owner confirmed
              </OwnerProfileLink>
            </div>
            <div><p className="text-xs text-[#52607a]">Payment</p><span className="mt-1 inline-flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-semibold"><Image src="/pay-vodafone-reference.png" alt="" width={18} height={18} className="shrink-0" />Vodafone Cash <small className="shrink-0 rounded bg-[#dff7e8] px-2 py-1 text-[#11813a]">Verified</small></span></div>
          </div>
        </div>
      </div>
      <div className="mt-[18px] flex w-full items-center gap-3">
        <button className="flex h-10 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-[#5b2be0] px-5 text-sm font-bold leading-none text-white">View details</button>
        <button className="flex h-10 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-[#8b62ff] px-5 text-sm font-bold leading-none text-[#5b2be0]">Message owner</button>
        <button className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#8b62ff] px-5 text-sm font-bold leading-none text-[#5b2be0]"><Icon name="navigation" className="size-4 shrink-0" />Get directions</button>
      </div>
    </section>
  );
}

function TimelineCard() {
  const rows = [
    { label: "Booking confirmed", date: "May 10, 2026", state: "done" },
    { label: "Payment verified", date: "May 10, 2026", state: "done" },
    { label: "Owner sent check-in details", date: "May 17, 2026", state: "done", owner: ahmedHassan },
    { label: "Check-in upcoming", date: "May 20, 2026", state: "active" },
    { label: "Leave review after stay", date: "Due May 26, 2026", state: "todo" },
  ];

  return (
    <section className={`h-[298px] p-4 ${cardFrame}`}>
      <h2 className="text-sm font-bold leading-5">Booking timeline</h2>
      <div className="mt-5 space-y-5">
        {rows.map(({ label, date, state, owner }) => (
          <div className="flex items-center gap-3 text-xs" key={label}>
            <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] ${state === "done" ? "bg-[#5b2be0] text-white" : state === "active" ? "border-2 border-[#f7a20b] bg-white text-[#f7a20b]" : "border border-[#b8c0cf] text-[#52607a]"}`}> 
              {state === "done" ? <Icon name="check" className="size-[12px]"/> : state === "active" ? "4" : "5"}
            </span>
            {owner ? (
              <OwnerProfileLink owner={owner} className="flex-1 font-semibold leading-4 hover:text-[#5b2be0] hover:underline">
                {label}
              </OwnerProfileLink>
            ) : (
              <b className="flex-1 font-semibold leading-4">{label}</b>
            )}
            <span className="whitespace-nowrap text-[11px] text-[#52607a]">{date}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MessagesCard() {
  return (
    <section className={`min-h-[235px] p-4 ${cardFrame}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold leading-5">Messages</h2>
        <a className="text-xs font-bold text-[#5b2be0]" href="#">View all</a>
      </div>
      <div className="mt-4 space-y-3.5">
        {[
          { name: "Ahmed Hassan (Owner)", msg: "Check-in details are ready.", time: "10:30 AM", img: "dashboard-avatar-sara.png", owner: ahmedHassan },
          { name: "DAR Support", msg: "Your Vodafone Cash payment has been verified.", time: "Yesterday", img: "dashboard-avatar-support.png" },
          { name: "Nile Stay Group", msg: "Please confirm your arrival time.", time: "2 days ago", img: "property-furnished-reference.png" },
        ].map(({ name, msg, time, img, owner }) => (
          <div className="flex min-h-[40px] items-center gap-3" key={name}>
            {owner ? (
              <OwnerProfileLink owner={owner} className="shrink-0 rounded-full hover:opacity-90 hover:ring-2 hover:ring-[#6d35ee]/30">
                <Image src={`/${img}`} alt={owner.name} width={38} height={38} className="size-[38px] rounded-full object-cover" />
              </OwnerProfileLink>
            ) : (
              <Image src={`/${img}`} alt="" width={38} height={38} className="size-[38px] shrink-0 rounded-full object-cover" />
            )}
            <div className="min-w-0 flex-1">
              {owner ? (
                <OwnerProfileLink owner={owner} className="inline-block text-sm font-bold leading-[15px] hover:text-[#5b2be0] hover:underline">
                  {name}
                </OwnerProfileLink>
              ) : (
                <p className="text-sm font-bold leading-[15px]">{name}</p>
              )}
              <p className="mt-0.5 text-xs leading-[15px] text-[#52607a]">{msg}</p>
            </div>
            <div className="w-[58px] text-right text-[11px] leading-4 text-[#52607a]">
              {time}
              <span className="ml-auto mt-2.5 block size-2 rounded-full bg-[#5b2be0]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WalletCard() {
  return (
    <section className={`min-h-[300px] px-4 py-3 ${cardFrame}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold leading-5">Payments & wallet</h2>
        <a className="text-xs font-bold text-[#5b2be0]" href="#">View all</a>
      </div>
      <div className="mt-2.5 grid grid-cols-2 rounded-md border border-[#e2e7f0]">
        <div className="p-2.5"><p className="text-xs text-[#52607a]">Wallet balance</p><b className="whitespace-nowrap text-[17px] leading-6">EGP 1,250</b><p className="text-xs text-[#52607a]">DAR Rewards</p></div>
        <div className="border-l border-[#e2e7f0] p-2.5"><p className="text-xs text-[#52607a]">Total spent</p><b className="whitespace-nowrap text-[17px] leading-6">EGP 18,950</b><p className="text-xs text-[#52607a]">All time</p></div>
      </div>
      <h3 className="mt-3 text-sm font-bold">Recent payments</h3>
      {[
        ["pay-vodafone-reference.png", "Luxury Studio in Madinaty", "EGP 6,370", "Verified"],
        ["pay-card-reference.png", "Premium Hotel Room", "EGP 4,800", "Pending"],
      ].map(([logo, stay, amount, status]) => (
        <div className="mt-2 flex items-center gap-3 text-xs" key={stay}>
          <Image src={`/${logo}`} alt="" width={28} height={20} className="w-7 object-contain" />
          <div className="min-w-0 flex-1">
            <p className="font-medium leading-4">{stay}</p>
            <small className="text-[#52607a]">May 10, 2026</small>
          </div>
          <div className="text-right">
            <b className="text-sm leading-4">{amount}</b>
            <p className={status === "Verified" ? "text-[#11813a]" : "text-[#f59f00]"}>{status}</p>
          </div>
        </div>
      ))}
      <p className="mt-2.5 text-sm font-bold">Refund status</p>
      <p className="text-xs text-[#52607a]">No active refunds</p>
      <div className="mt-2.5 flex w-full min-w-0 items-center justify-center gap-2">
        <button className="flex h-[22px] w-[104px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-[4px] border border-[#8b62ff] px-1 text-[#5b2be0]" style={{ fontSize: 9, fontWeight: 600, lineHeight: 1 }}>
          <Icon name="download" className="size-2.5 shrink-0" />
          Download invoice
        </button>
        <button className="flex h-[22px] w-[104px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-[4px] border border-[#8b62ff] px-1 text-[#5b2be0]" style={{ fontSize: 9, fontWeight: 600, lineHeight: 1 }}>
          Payment history
          <Icon name="arrow-right" className="size-2.5 shrink-0" />
        </button>
      </div>
    </section>
  );
}

function BookingsTable() {
  return (
    <section className={`p-4 ${cardFrame}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold leading-5">My bookings</h2>
        <a href="#" className="text-xs font-bold text-[#5b2be0]">View all bookings</a>
      </div>
      <table className="mt-4 w-full text-left text-xs">
        <thead className="text-[11px] text-[#52607a]">
          <tr><th className="pb-3 font-medium">Property</th><th className="font-medium">Dates</th><th className="font-medium">Total</th><th className="font-medium">Payment method</th><th className="font-medium">Status</th><th className="font-medium">Actions</th></tr>
        </thead>
        <tbody>
          {bookingRows.map(([img, title, city, dates, nights, total, logo, payment, payStatus, status, action]) => (
            <tr className="border-t border-[#e2e7f0]" key={title}>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <Image src={`/${img}`} alt="" width={54} height={40} className="h-10 w-[54px] rounded object-cover" />
                  <div><b className="text-xs">{title}</b><p className="mt-1 text-[11px] text-[#52607a]">{city}</p></div>
                </div>
              </td>
              <td>{dates}<p className="mt-1 text-[11px] text-[#52607a]">{nights}</p></td>
              <td>{total}</td>
              <td>
                <span className="flex items-center gap-2"><Image src={`/${logo}`} alt="" width={24} height={16} className="w-6 object-contain" /><b>{payment}</b></span>
                <p className={payStatus === "Verified" || payStatus === "Paid" ? "mt-1 text-[#11813a]" : "mt-1 text-[#f59f00]"}>{payStatus}</p>
              </td>
              <td><span className={`rounded px-2 py-1 text-xs ${status === "Confirmed" || status === "Completed" ? "bg-[#dff7e8] text-[#11813a]" : "bg-[#fff0d6] text-[#d98200]"}`}>{status}</span></td>
              <td><button className="h-8 w-[52px] rounded border border-[#8b62ff] text-xs font-bold text-[#5b2be0]">{action}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function SavedStays() {
  return (
    <section className={`p-4 ${cardFrame}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold leading-5">Saved stays</h2>
        <a href="#" className="text-xs font-bold text-[#5b2be0]">View all</a>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {savedStays.map(([img, title, city, rating, price]) => (
          <article className="overflow-hidden rounded-md border border-[#e2e7f0]" key={title}>
            <div className="relative h-[104px]">
              <Image src={`/${img}`} alt="" fill sizes="180px" className="object-cover" />
              <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-[#ef476f] text-white"><Icon name="heart" className="size-[13px]"/></span>
            </div>
            <div className="p-3 text-xs">
              <b>{title}</b>
              <p className="mt-1 text-[11px] text-[#52607a]">{city} <span className="inline-flex items-center gap-1 text-[#f7a20b]"><Icon name="star" className="size-[12px] fill-current"/>{rating}</span></p>
              <p className="mt-3 font-bold">{price}<span className="font-medium text-[#52607a]"> / night</span><button className="float-right h-7 rounded border border-[#8b62ff] px-2 text-[11px] text-[#5b2be0]">View details</button></p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProfileCompletion() {
  return (
    <section className={`h-[240px] p-4 ${cardFrame}`}>
      <h2 className="text-base font-bold leading-5">Profile completion</h2>
      <div className="mt-5 flex items-center gap-5">
        <div className="grid size-[82px] shrink-0 place-items-center rounded-full text-center [background:conic-gradient(#5b2be0_0_80%,#e9e4ff_80%_100%)]">
          <div className="grid size-[68px] place-items-center rounded-full bg-white">
            <div><b className="block text-xl leading-5">80%</b><span className="block text-[10px] text-[#52607a]">Complete</span></div>
          </div>
        </div>
        <ul className="space-y-2 text-xs leading-[15px] text-[#52607a]">
          <li className="flex items-start gap-2"><span className="grid size-4 shrink-0 place-items-center rounded-full border border-[#20b45b] text-[#20b45b]"><Icon name="check" className="size-[10px]"/></span><span>Phone number verified</span></li>
          <li className="flex items-start gap-2"><span className="grid size-4 shrink-0 place-items-center rounded-full border border-[#20b45b] text-[#20b45b]"><Icon name="check" className="size-[10px]"/></span><span>Email verified</span></li>
          <li className="flex items-start gap-2 text-[#f59f00]"><span className="grid size-4 shrink-0 place-items-center rounded-full border border-[#f59f00] text-[10px] leading-none">!</span><span>ID not uploaded</span></li>
          <li className="flex items-start gap-2 text-[#f59f00]"><span className="grid size-4 shrink-0 place-items-center rounded-full border border-[#f59f00] text-[10px] leading-none">!</span><span>Preferences missing</span></li>
        </ul>
      </div>
      <button className="mt-5 h-9 w-full rounded-md border border-[#8b62ff] text-sm font-bold text-[#5b2be0]">Complete profile</button>
    </section>
  );
}

function AiRecommendations() {
  return (
    <section className={`min-h-[240px] px-4 py-[15px] ${cardFrame}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold leading-5">AI recommendations for you</h2>
        <a className="text-xs font-bold text-[#5b2be0]" href="#">View all</a>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {recommendations.map(([img, badge, title, city, price, rating]) => (
          <article className="overflow-hidden rounded-md border border-[#e2e7f0] text-[10px]" key={title}>
            <div className="relative h-[82px]">
              <Image src={`/${img}`} alt="" fill sizes="82px" className="object-cover" />
              <span className="absolute left-1.5 top-1.5 rounded bg-[#5b2be0] px-2 py-1 text-[9px] font-bold leading-none text-white">{badge}</span>
            </div>
            <div className="p-2 leading-[14px]">
              <b className="block text-[11px] leading-[14px]">{title}</b>
              <p className="text-[#52607a]">{city}</p>
              <p className="mt-1 font-bold">{price} <span className="font-medium text-[#52607a]">/ night</span></p>
              <p className="inline-flex items-center gap-1 text-[#f7a20b]"><Icon name="star" className="size-[12px] fill-current"/>{rating}</p>
            </div>
          </article>
        ))}
      </div>
      <button className="mt-3 h-9 w-full rounded-md border border-[#8b62ff] text-sm font-bold text-[#5b2be0]">Explore more matches</button>
    </section>
  );
}

function Avatar({ size = "md" }: { size?: "md" | "lg" }) {
  const cls = size === "lg" ? "size-12" : "size-10";
  return <Image src="/dashboard-avatar-omar.png" alt="" width={48} height={48} className={`${cls} shrink-0 rounded-full object-cover`} />;
}
