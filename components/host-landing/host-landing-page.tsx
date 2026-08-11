import Image from "next/image";
import { DarLogo } from "@/components/brand/dar-logo";
import { ButtonLink } from "@/components/ui";
import { Icon } from "./icons";

const trustItems = [
  ["shield", "Verified guests", "ID-verified travelers"],
  ["wallet", "Local payments", "Made for Egypt"],
  ["shield", "Admin approval", "Quality you can trust"],
  ["calendar", "Owner dashboard", "Manage with ease"],
] as const;

const audienceCards = [
  ["home", "Apartment owners", "List your studios or apartments and earn more from your space."],
  ["heart", "Brokers / agencies", "Manage multiple properties under your agency account with ease."],
  ["building", "Serviced apartment operators", "Grow your business and reach verified local and international guests."],
  ["hotel", "Hotels and guest houses", "Add hotel rooms or entire properties and boost your direct bookings."],
] as const;

const steps = [
  ["user", "Create owner account", "Sign up and verify your identity to get started."],
  ["home", "Add property details and photos", "Provide details, set your pricing and upload photos."],
  ["shield", "DAR reviews and approves", "Our team reviews your property for quality."],
  ["calendar", "Receive bookings and payouts", "Accept bookings, host guests and get paid securely."],
] as const;

const listings = [
  ["Studio in Madinaty", "Madinaty - DG", "4.9 (32)", "EGP 1,200", "/property-studio-reference.png"],
  ["Furnished apartment", "New Capital", "4.8 (18)", "EGP 1,700", "/property-furnished-reference.png"],
  ["Serviced apartment", "Nile Ritz, Madinaty", "4.9 (27)", "EGP 1,800", "/property-serviced-reference.png"],
  ["Hotel room", "Cairo East", "4.7 (41)", "EGP 1,450", "/property-hotel-reference.png"],
] as const;

const paymentMethods = [
  ["Vodafone Cash", "/pay-vodafone-reference.png", "h-8 w-8", "text-[#ec1b24]"],
  ["InstaPay", "/brands/instapay-official.png", "h-[18px] w-auto", "text-[#1d2538]"],
  ["Fawry", "/pay-fawry-reference.png", "h-9 w-8", "text-[#1d2538]"],
  ["Meeza", "/pay-meeza-reference.png", "h-8 w-8", "text-[#1d2538]"],
  ["Credit / Debit\nCard", "/pay-card-reference.png", "h-[22px] w-8", "text-[#1d2538]"],
  ["Bank Transfer", "/pay-bank-reference.png", "h-8 w-9", "text-[#1d2538]"],
] as const;

const pricing = [
  ["Starter", "Free to list", "Perfect for individual owners getting started.", "Start free"],
  ["Professional", "For agencies", "Manage multiple listings and grow your business.", "Get started"],
  ["Hotels", "Custom setup", "Tailored solutions for hotels and hotel rooms.", "Contact sales"],
] as const;

const faqs = [
  "Can brokers list properties?",
  "Do I need documents?",
  "When do I get paid?",
  "Can I block unavailable dates?",
  "How does approval work?",
];

export function HostLandingPage() {
  return (
    <main className="min-h-screen bg-white text-[#08122b]">
      <HeroSection />
      <Section className="pt-9">
        <h2 className="section-title">Who can list on DAR?</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {audienceCards.map(([icon, title, copy]) => (
            <article className="rounded-lg border border-[#e4e7ef] bg-white p-7 shadow-[0_12px_28px_rgba(8,18,43,0.03)]" key={title}>
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-[#f1edff] text-[#6d35ee]">
                <Icon name={icon} className="size-7" />
              </span>
              <h3 className="mt-5 text-base font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#52607a]">{copy}</p>
            </article>
          ))}
        </div>
      </Section>
      <HowItWorks />
      <DashboardShowcase />
      <Section className="grid !max-w-[1010px] justify-center gap-5 border-b border-[#e9ecf2] pb-6 lg:grid-cols-[560px_425px]">
        <PropertyTypes />
        <PaymentsSection />
      </Section>
      <Section className="grid !max-w-[1190px] justify-center gap-7 pt-5 lg:grid-cols-[390px_470px_290px]">
        <TrustSection />
        <PricingSection />
        <FaqSection />
      </Section>
      <CtaFooter />
    </main>
  );
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>{children}</section>;
}

function Logo() {
  return <DarLogo surface="dark" width={610} height={260} className="h-auto w-[112px] object-contain" priority />;
}

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden rounded-b-xl bg-[#030915] bg-cover bg-center text-white lg:rounded-b-[12px]"
      style={{ backgroundImage: "url('/dar-host-hero-bg-final.png')" }}
    >
      <div className="absolute inset-0 bg-[#020817]/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_42%,rgba(22,38,67,0)_0%,rgba(3,8,20,0.06)_52%,rgba(2,7,17,0.48)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#030817_0%,rgba(3,8,20,0.9)_26%,rgba(3,8,20,0.28)_45%,rgba(3,8,20,0)_66%,rgba(3,8,20,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,7,18,0.34)_0%,rgba(2,7,18,0)_36%,rgba(2,7,18,0.12)_68%,rgba(2,7,18,0.58)_100%)]" />
      <div className="relative mx-auto w-full px-5 pb-7 pt-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-6">
          <Logo />
          <nav className="hidden flex-1 items-center justify-center gap-12 text-sm font-semibold text-white/90 md:flex">
            <a href="#stays">Stays</a>
            <a href="#hotels">Hotels</a>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="hidden items-center gap-4 text-sm font-semibold lg:flex">
            <span className="inline-flex items-center gap-2 text-white/90">
              <Icon name="globe" className="size-5" /> English / EGP <Icon name="chevron" className="size-4" />
            </span>
            <ButtonLink href="/dashboard" variant="ghost" className="h-10 rounded-md px-6">Sign in</ButtonLink>
            <ButtonLink href="/dashboard" className="h-10 rounded-md px-6">Start hosting</ButtonLink>
          </div>
          <button aria-label="Open navigation" className="inline-flex size-11 items-center justify-center rounded-md border border-white/25 md:hidden">
            <Icon name="menu" className="size-6" />
          </button>
        </header>

        <div className="grid gap-10 py-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="max-w-[680px]">
            <div className="inline-flex items-center gap-2 rounded-md border border-[#6d5530] bg-[#1c1820]/80 px-3 py-2 text-sm font-semibold text-white/90">
              <Icon name="star" className="size-4 text-[#f7a20b]" /> For owners, brokers and hotels in Egypt
            </div>
            <h1 className="mt-6 max-w-[660px] text-5xl font-bold leading-[1.08] tracking-normal sm:text-6xl lg:text-[58px]">
              List your property with <span className="text-[#f7a20b]">DAR</span> and reach verified guests.
            </h1>
            <p className="mt-5 max-w-[520px] text-lg leading-8 text-white/88">
              Add studios, furnished apartments, serviced apartments or hotel rooms and manage bookings with local Egyptian payment methods.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/dashboard" className="w-full sm:w-auto">Start hosting</ButtonLink>
              <ButtonLink href="#how-it-works" variant="ghost" className="w-full sm:w-auto">
                <span className="inline-flex size-5 items-center justify-center rounded-full border border-white/80">
                  <Icon name="play" className="ml-0.5 size-3" />
                </span>
                See how it works
              </ButtonLink>
            </div>
          </div>
          <EarningsCard />
        </div>
        <div className="grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(([icon, title, copy]) => (
            <div className="flex items-center gap-4" key={title}>
              <Icon name={icon} className="size-7 text-[#7a4cff]" />
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="text-xs text-white/70">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EarningsCard() {
  return (
    <aside className="rounded-lg border border-white/22 bg-[#07101f]/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur">
      <h2 className="flex items-center gap-3 text-lg font-bold">
        <span className="inline-flex size-7 items-center justify-center rounded-md border border-[#6e4b22] text-[#f7a20b]"><Icon name="receipt" className="size-4" /></span>
        Estimate your earnings
      </h2>
      {["Property type", "City"].map((label, index) => (
        <label className="mt-4 block text-xs font-semibold text-white/85" key={label}>
          {label}
          <select className="mt-2 h-10 w-full rounded-md border border-white/25 bg-white px-3 text-sm text-[#08122b]">
            <option>{index === 0 ? "Furnished apartment" : "New Capital"}</option>
          </select>
        </label>
      ))}
      <Counter label="Average nightly price (EGP)" value="1,600" />
      <Counter label="Occupancy estimate" value="65%" />
      <div className="mt-4 border-t border-white/14 pt-4">
        <p className="text-base font-bold">Estimated monthly earnings</p>
        <p className="mt-2 text-3xl font-bold text-[#7e40ff]">EGP 24,000 - 38,000</p>
        <p className="mt-3 text-xs text-white/72">*Estimate based on your inputs and may vary.</p>
      </div>
    </aside>
  );
}

function Counter({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-white/85">{label}</p>
      <div className="mt-2 grid grid-cols-[36px_1fr_36px] overflow-hidden rounded-md border border-white/18 bg-[#0b1424]">
        <button aria-label={`Decrease ${label}`} className="grid h-9 place-items-center border-r border-white/15 text-white/80"><Icon name="minus" className="size-4" /></button>
        <span className="grid h-9 place-items-center text-sm font-semibold">{value}</span>
        <button aria-label={`Increase ${label}`} className="grid h-9 place-items-center border-l border-white/15 text-white/80"><Icon name="plus" className="size-4" /></button>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <Section className="pt-9" >
      <h2 id="how-it-works" className="section-title">How hosting works</h2>
      <div className="relative mt-2 grid gap-8 md:grid-cols-4 md:pt-8">
        <div className="absolute left-[13%] right-[13%] top-[88px] hidden h-0.5 bg-[linear-gradient(90deg,#7447ed_0%,#7447ed_67%,#f7a20b_67%)] md:block" />
        {steps.map(([icon, title, copy], index) => (
          <article className="relative text-center" key={title}>
            <div className="mx-auto grid size-[68px] place-items-center rounded-full border border-[#e2e6ef] bg-white text-[#08122b] shadow-[0_10px_28px_rgba(8,18,43,0.05)]">
              <Icon name={icon} className="size-9" />
            </div>
            <span className={`relative z-10 mx-auto mt-6 grid size-7 place-items-center rounded-full text-sm font-bold text-white ${index === 3 ? "bg-[#f7a20b]" : "bg-[#6132dc]"}`}>
              {index + 1}
            </span>
            <h3 className="mx-auto mt-6 max-w-[190px] text-base font-bold leading-5">{title}</h3>
            <p className="mx-auto mt-3 max-w-[190px] text-sm leading-6 text-[#52607a]">{copy}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function DashboardShowcase() {
  const menu = ["Overview", "Properties", "Bookings", "Calendar", "Messages", "Payments", "Reviews", "Settings"];
  return (
    <Section className="pt-8">
      <div className="grid gap-4 rounded-lg border border-[#e1e5ee] bg-white p-4 shadow-[0_18px_45px_rgba(8,18,43,0.06)] lg:grid-cols-[222px_150px_1fr]">
        <div className="px-1 py-5">
          <h2 className="max-w-[172px] text-[20px] font-bold leading-[1.12]">Owner dashboard made for you</h2>
          <p className="mt-4 max-w-[218px] text-[13px] leading-6 text-[#52607a]">Manage everything in one place with powerful tools built for property owners.</p>
          <ul className="mt-6 space-y-4 text-[13px] text-[#52607a]">
            {["Approve booking requests", "Manage calendar and prices", "Track earnings and payouts", "Message guests instantly"].map((item, index) => (
              <li className="flex items-center gap-3.5" key={item}>
                <Icon name={index === 0 ? "user" : index === 1 ? "calendar" : index === 2 ? "dashboard" : "message"} className="size-4 text-[#1b2844]" />
                {item}
              </li>
            ))}
          </ul>
          <ButtonLink href="/dashboard" variant="secondary" className="mt-6 h-9 px-5 text-xs">Explore dashboard</ButtonLink>
        </div>
        <aside className="flex min-h-[420px] flex-col rounded-lg bg-[#030a16] px-4 py-4 text-white">
          <DarLogo surface="dark" width={78} height={28} className="h-auto w-[78px] object-contain" priority />
          <div className="mt-7 flex items-center gap-3">
            <span className="size-8 rounded-full bg-[linear-gradient(135deg,#e1bd91,#8a6238)]" />
            <div>
              <p className="text-[12px] font-bold leading-4">Ahmed Hassan</p>
              <p className="text-[11px] font-semibold leading-4 text-[#44d66d]">Verified Owner</p>
            </div>
          </div>
          <nav className="mt-7 space-y-1.5">
            {menu.map((item, index) => (
              <a className={`flex h-8 items-center justify-between rounded-md px-3 text-[12px] font-semibold ${index === 0 ? "bg-[#142654] text-white" : "text-white/78"}`} href={item === "Bookings" ? "/owner/bookings/request-decision" : "#"} key={item}>
                <span className="flex items-center gap-3"><Icon name={index < 4 ? "home" : index === 4 ? "message" : index === 5 ? "wallet" : "star"} className="size-4" /> {item}</span>
                {item === "Messages" ? <span className="grid size-[18px] place-items-center rounded-full bg-[#6e3df1] text-[10px] leading-none">3</span> : null}
              </a>
            ))}
          </nav>
          <ButtonLink href="/add-property" className="mt-auto rounded-md px-3 py-3 text-center text-[11px] font-bold leading-4">Add new property <span className="block text-[10px] font-medium text-white/75">Grow your business</span></ButtonLink>
        </aside>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-4">
            {["Total earnings|EGP 48,750|+12%", "Active listings|8|Properties", "Pending requests|14|Bookings", "Occupancy rate|76%|This month"].map((stat) => {
              const [label, value, note] = stat.split("|");
              return <div className="rounded-lg border border-[#e6e9f1] p-4" key={label}><p className="text-xs text-[#6b7285]">{label}</p><p className="mt-2 text-lg font-bold leading-6">{value}</p><p className="mt-1 text-xs text-[#16a34a]">{note}</p></div>;
            })}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
            <ChartCard />
            <RequestsCard />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <MiniCard title="Upcoming check-ins" value="Sara Ali" detail="Luxury Studio in Madinaty" />
            <CalendarCard />
            <MessagesCard />
          </div>
        </div>
      </div>
    </Section>
  );
}

function ChartCard() {
  return (
    <div className="rounded-lg border border-[#e6e9f1] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Earnings overview</h3>
        <div className="flex gap-6 text-[10px] font-semibold text-[#8a91a6]">
          <span>Weekly</span>
          <span className="rounded bg-[#f1edff] px-2 py-0.5 text-[#6d35ee]">Monthly</span>
          <span>Yearly</span>
        </div>
      </div>
      <div className="mt-4 h-[132px] rounded-md bg-[linear-gradient(180deg,transparent_0_24%,#eef0f6_25%,transparent_26%_49%,#eef0f6_50%,transparent_51%_74%,#eef0f6_75%,transparent_76%),linear-gradient(90deg,transparent_0_12%,#eef0f6_13%,transparent_14%_31%,#eef0f6_32%,transparent_33%_50%,#eef0f6_51%,transparent_52%_70%,#eef0f6_71%,transparent_72%)]">
        <svg className="h-full w-full" viewBox="0 0 420 132" preserveAspectRatio="none">
          <defs>
            <linearGradient id="earningsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#7447ed" stopOpacity="0.38" />
              <stop offset="1" stopColor="#7447ed" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d="M8 101 L40 96 L72 82 L105 89 L138 76 L171 82 L204 60 L237 64 L270 43 L303 48 L336 28 L370 25 L412 10 L412 120 L8 120 Z" fill="url(#earningsFill)" />
          <path d="M8 101 L40 96 L72 82 L105 89 L138 76 L171 82 L204 60 L237 64 L270 43 L303 48 L336 28 L370 25 L412 10" fill="none" stroke="#7447ed" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </svg>
      </div>
    </div>
  );
}

function RequestsCard() {
  const requests = [
    { name: "Sara Ali", date: "May 30 - May 25", amount: "EGP 6,370", status: "Pending", avatar: "/dashboard-avatar-sara.png" },
    { name: "Omar Nabil", date: "Jun 02 - Jun 05", amount: "EGP 4,800", status: "Confirmed", avatar: "/dashboard-avatar-omar.png" },
    { name: "Lina Sameh", date: "Jun 10 - Jun 14", amount: "EGP 9,200", status: "Pending", avatar: "/dashboard-avatar-lina.png" },
  ];

  return (
    <div className="h-[171px] self-start rounded-lg border border-[#e6e9f1] bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold leading-4">Booking requests</h3>
        <a className="text-[#7c4dff]" href="#" style={{ fontSize: 9, fontWeight: 600, lineHeight: "12px" }}>View all</a>
      </div>
      <div className="mt-4 space-y-[14px]">
        {requests.map((request) => (
          <div className="flex items-center justify-between gap-2" key={request.name}>
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="relative size-6 shrink-0 overflow-hidden rounded-full bg-[#f1f2f6]">
                <Image src={request.avatar} alt="" fill sizes="24px" className="object-cover" />
              </span>
              <span className="min-w-0">
                <b className="block text-[10px] font-bold leading-[13px] text-[#09122b]">{request.name}</b>
                <small className="block text-[9px] font-medium leading-[13px] text-[#68728a]">{request.date}</small>
              </span>
            </span>
            <span className="min-w-[58px] text-right">
              <b className="block text-[10px] font-bold leading-[13px] text-[#09122b]">{request.amount}</b>
              <small className={`block text-[9px] font-semibold leading-[12px] ${request.status === "Confirmed" ? "text-[#16a34a]" : "text-[#f7a20b]"}`}>{request.status}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <div className="rounded-lg border border-[#e6e9f1] p-4"><h3 className="text-xs font-bold">{title}</h3><p className="mt-3 text-sm font-bold">{value}</p><p className="mt-1 text-xs text-[#52607a]">{detail}</p></div>;
}

function CalendarCard() {
  return <div className="rounded-lg border border-[#e6e9f1] p-4"><h3 className="text-xs font-bold">Calendar</h3><div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px]">{Array.from({ length: 35 }).map((_, i) => <span className={`rounded p-1 ${[17,18,23,24].includes(i) ? "bg-[#6d35ee] text-white" : [20,27].includes(i) ? "bg-[#f7a20b] text-white" : "bg-[#f5f6fa]"}`} key={i}>{i + 1}</span>)}</div></div>;
}

function MessagesCard() {
  const messages = [
    { name: "Sara Ali", preview: "Check-in details please.", time: "10:30 AM", avatar: "/dashboard-avatar-sara.png" },
    { name: "DAR Support", preview: "Your payment is verified.", time: "Yesterday", avatar: "/dashboard-avatar-support.png" },
    { name: "Omar Nabil", preview: "Thank you! See you soon.", time: "2 days ago", avatar: "/dashboard-avatar-omar.png" },
  ];

  return (
    <div className="h-[132px] self-start rounded-lg border border-[#e6e9f1] bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold leading-4">Recent messages</h3>
        <a className="text-[#7c4dff]" href="#" style={{ fontSize: 9, fontWeight: 600, lineHeight: "12px" }}>View all</a>
      </div>
      <div className="mt-4 space-y-[9px]">
        {messages.map((message) => (
          <div className="grid grid-cols-[24px_1fr_auto] items-center gap-2.5" key={message.name}>
            <span className="relative size-6 overflow-hidden rounded-full bg-[#f1f2f6]">
              <Image src={message.avatar} alt="" fill sizes="24px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <b className="block text-[10px] font-bold leading-[12px] text-[#09122b]">{message.name}</b>
              <small className="block truncate text-[9px] font-medium leading-[12px] text-[#68728a]">{message.preview}</small>
            </span>
            <time className="self-start whitespace-nowrap pt-0.5 text-[8px] font-medium leading-[12px] text-[#8a91a6]">{message.time}</time>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyTypes() {
  return (
    <div id="stays">
      <h2 className="text-[17px] font-bold leading-5 tracking-0 text-[#08122b]">What you can list</h2>
      <div className="mt-4 flex border-b border-[#e7eaf1] text-[9px] font-semibold leading-3 text-[#52607a]">
        {["Studios", "Furnished apartments", "Serviced apartments", "Hotels"].map((tab, index) => (
          <span className={`mr-[58px] pb-2.5 ${index === 0 ? "border-b-2 border-[#8d63ff] text-[#6d35ee]" : ""}`} key={tab}>{tab}</span>
        ))}
      </div>
      <div className="relative mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {listings.map(([title, city, rating, price, image]) => (
          <article className="h-[187px] overflow-hidden rounded-lg border border-[#e3e6ee] bg-white shadow-[0_10px_24px_rgba(8,18,43,0.035)]" key={title}>
            <div className="relative h-[112px] overflow-hidden rounded-t-lg">
              <Image src={image} alt={title} fill sizes="130px" className="object-cover" />
            </div>
            <div className="px-2.5 pb-2 pt-2.5 text-[8px] leading-[10px]">
              <h3 className="font-bold leading-[10px] text-[#08122b]">{title}</h3>
              <p className="mt-1 text-[#68728a]">{city}<span className="float-right inline-flex items-center gap-1 text-[#f7a20b]"><Icon name="star" className="size-[12px] fill-current"/>{rating}</span></p>
              <p className="mt-3 text-[10px] font-bold leading-3 text-[#08122b]">{price} <span className="font-medium text-[#68728a]">/ night</span></p>
            </div>
          </article>
        ))}
        <button className="absolute -right-7 top-[47px] hidden size-10 items-center justify-center rounded-full border border-[#e4e7ef] bg-white text-[#52607a] shadow-[0_8px_22px_rgba(8,18,43,0.08)] xl:flex" aria-label="Next property type">
          <Icon name="chevron" className="size-4 -rotate-90" />
        </button>
      </div>
    </div>
  );
}

function PaymentsSection() {
  return (
    <div>
      <h2 className="text-[17px] font-bold leading-5 tracking-0 text-[#08122b]">Payments made for Egypt</h2>
      <p className="mt-2 max-w-[285px] text-[10px] font-medium leading-4 text-[#52607a]">DAR tracks payment status, owner payouts and booking confirmation.</p>
      <div className="mt-3 grid gap-5 lg:grid-cols-[250px_150px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {paymentMethods.map(([name, logo, size, color]) => <div className="grid h-[88px] place-items-center rounded-lg border border-[#e4e7ef] bg-white px-2 py-3 text-center text-[8px] font-bold leading-[10px] shadow-[0_10px_24px_rgba(8,18,43,0.025)]" key={name}><span className="flex h-8 items-center justify-center"><Image src={logo} alt="" width={name==="InstaPay"?768:80} height={name==="InstaPay"?156:50} className={`${size} object-contain`} /></span><span className={`whitespace-pre-line ${color}`}>{name}</span></div>)}
        </div>
        <div className="h-[188px] rounded-lg border border-[#e4e7ef] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(8,18,43,0.025)]">
          <p className="text-[10px] font-medium leading-3 text-[#52607a]">Next payout</p>
          <p className="mt-1.5 text-[18px] font-bold leading-6 text-[#08122b]">EGP 12,800</p>
          <p className="mt-0.5 text-[8px] font-medium leading-3 text-[#68728a]">Estimated on Jun 30, 2026</p>
          <p className="mt-5 text-[10px] font-medium leading-3 text-[#52607a]">Payout method</p>
          <div className="mt-2 flex items-center gap-2">
            <Image src="/brands/instapay-official.png" alt="" width={768} height={156} className="h-3.5 w-auto object-contain" />
            <p className="text-[15px] font-bold leading-5 text-[#292e7f]">InstaPay</p>
          </div>
          <ButtonLink href="#" variant="secondary" className="mt-4 w-full rounded-md px-4 whitespace-nowrap" style={{ height: 32, fontSize: 11, fontWeight: 700, lineHeight: "14px" }}>View payouts</ButtonLink>
        </div>
      </div>
    </div>
  );
}

function TrustSection() {
  return (
    <div className="grid grid-cols-[200px_160px] gap-5">
      <h2 className="col-span-2 text-[18px] font-bold leading-6 text-[#08122b]">Trust and verification</h2>
      <div>
        <ul className="mt-3 space-y-3 text-[10px] font-medium leading-3 text-[#52607a]">
          {["Owner ID verification", "Ownership or authorization document", "Property photo review", "Address verification", "Guest identity checks", "Booking risk review"].map((item) => <li className="flex items-center gap-2" key={item}><Icon name="check" className="size-4 text-[#18a957]" />{item}</li>)}
        </ul>
        <p className="mt-6 text-[11px] font-medium leading-5 text-[#52607a]">We keep DAR safe and trustworthy for owners and guests.</p>
      </div>
      <article className="relative mt-2 h-[246px] rounded-lg border border-[#e4e7ef] bg-white p-3 shadow-[0_10px_24px_rgba(8,18,43,0.035)]">
        <span className="absolute -top-3.5 left-1/2 grid size-7 -translate-x-1/2 place-items-center rounded-full bg-[#21b55a] text-white">
          <Icon name="check" className="size-[18px]" />
        </span>
        <p className="mt-5 text-center text-[10px] font-bold leading-3 text-[#28a95b]">Document approved</p>
        <div className="relative mt-4 h-[86px] overflow-hidden rounded-sm border border-[#eef0f5]">
          <Image src="/document-preview-reference.png" alt="" fill sizes="135px" className="object-cover" />
        </div>
        <p className="mt-3 text-[9px] font-bold leading-3 text-[#08122b]">Ownership contract</p>
        <p className="mt-1 text-[8px] font-medium leading-[10px] text-[#68728a]">Submitted on May 10, 2024</p>
        <p className="mt-1 text-[9px] font-bold leading-3 text-[#18a957]">Approved</p>
        <ButtonLink href="#" variant="secondary" className="mt-3.5 w-full rounded px-3" style={{ height: 30, fontSize: 10, fontWeight: 700, lineHeight: "12px" }}>View documents</ButtonLink>
      </article>
    </div>
  );
}

function PricingSection() {
  return (
    <div id="pricing">
      <h2 className="text-[18px] font-bold leading-6 text-[#08122b]">Pricing that grows with you</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {pricing.map(([tier, title, copy, cta], index) => (
          <article className={`h-[246px] rounded-lg border bg-white p-4 ${index === 1 ? "border-2 border-[#8b62ff] shadow-[0_12px_24px_rgba(109,53,238,0.13)]" : "border-[#e4e7ef]"}`} key={tier}>
            <p className="text-[11px] font-bold leading-3 text-[#08122b]">{tier}</p>
            <h3 className="mt-3 text-[17px] font-bold leading-6 text-[#08122b]">{title}</h3>
            <p className="mt-2 min-h-[55px] text-[10px] font-medium leading-4 text-[#52607a]">{copy}</p>
            <ul className="mt-4 space-y-2.5 text-[9px] font-medium leading-3 text-[#52607a]">
              {(index === 2 ? ["Custom terms", "Dedicated account manager"] : index === 0 ? ["Low launch commission", "Standard support"] : ["Lower commission", "Priority support"]).map((item) => (
                <li className="flex items-start gap-2" key={item}><Icon name="check" className="mt-0.5 size-3.5 text-[#18a957]" />{item}</li>
              ))}
            </ul>
            <ButtonLink href="#" variant={index === 1 ? "primary" : "secondary"} className="mt-8 w-full rounded px-3" style={{ height: 31, fontSize: 10, fontWeight: 700, lineHeight: "12px" }}>{cta}</ButtonLink>
          </article>
        ))}
      </div>
    </div>
  );
}

function FaqSection() {
  return (
    <div id="faq">
      <h2 className="text-[18px] font-bold leading-6 text-[#08122b]">FAQ</h2>
      <div className="mt-4 space-y-2.5">
        {faqs.map((question) => <button className="flex h-[39px] w-full items-center justify-between rounded-md border border-[#e4e7ef] px-3.5 text-left text-[#52607a]" style={{ fontSize: 11, fontWeight: 600, lineHeight: "13px" }} key={question}>{question}<Icon name="chevron" className="size-3.5" /></button>)}
      </div>
    </div>
  );
}

function CtaFooter() {
  return (
    <footer className="mx-auto mt-8 max-w-[1250px] overflow-hidden rounded-xl bg-[#040b16] text-white sm:mb-5">
      <div className="relative px-5 py-8 sm:px-9">
        <div className="absolute inset-y-0 left-[45%] right-0">
          <Image src="/dar-host-cta.png" alt="" fill sizes="60vw" className="object-cover object-right opacity-75" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050b16_0%,#050b16_42%,rgba(5,11,22,0.52)_72%,rgba(5,11,22,0.24)_100%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="text-[30px] font-bold leading-9">Ready to host with DAR?</h2>
            <p className="mt-2 text-[13px] leading-5 text-white/78">Join thousands of verified property owners across Egypt.</p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row"><ButtonLink href="/dashboard" className="w-[172px] rounded-md px-6" style={{ height: 46, fontSize: 13, fontWeight: 700, lineHeight: "16px" }}>Start hosting</ButtonLink><ButtonLink href="/dashboard" variant="ghost" className="w-[182px] rounded-md px-5" style={{ height: 46, fontSize: 13, fontWeight: 700, lineHeight: "16px" }}><Icon name="headset" className="size-5" />Talk to DAR team</ButtonLink></div>
          </div>
          <div className="grid grid-cols-3 gap-9 text-[11px]">
            {["Verified owners|5,000+", "Active listings|8,000+", "Happy guests|50,000+"].map((item) => { const [label, value] = item.split("|"); return <div key={label}><Icon name="star" className="mb-1.5 size-6 text-[#f7a20b]" /><p className="leading-4 text-white/70">{label}</p><b className="text-lg leading-6">{value}</b></div>; })}
          </div>
        </div>
      </div>
      <div className="grid gap-8 border-t border-white/10 px-5 py-4 sm:px-9 lg:grid-cols-[1.35fr_repeat(4,1fr)_1.7fr]">
        <div className="text-[12px] leading-5"><DarLogo surface="dark" width={102} height={36} className="h-auto w-[102px] object-contain" /><p className="mt-3 max-w-[190px] text-white/70">Premium stays in Egypt. Studios, apartments and hotels in the best locations.</p><div className="mt-4 flex gap-5 text-[14px] font-bold leading-4 text-white/80">{["f", "ig", "x", "in", "yt"].map((social) => <a href="#" key={social}>{social}</a>)}</div></div>
        {["Explore|Stays|Hotels|Experiences|Destinations", "Host|Become a host|Host resources|Pricing|Success stories", "Company|About us|Careers|Press|Partners", "Support|Help center|Cancellation options|Contact us|Trust & safety"].map((group) => {
          const [title, ...links] = group.split("|");
          return <div className="text-[12px] leading-4" key={title}><h3 className="font-bold">{title}</h3>{links.map((link) => <a className="mt-3 block text-white/70" href="#" key={link}>{link}</a>)}</div>;
        })}
        <div className="text-[12px] leading-4"><h3 className="font-bold">Stay updated</h3><p className="mt-3 text-white/70">Get tips and news for hosts.</p><div className="mt-5 flex h-9 overflow-hidden rounded-md border border-white/15"><input aria-label="Email address" placeholder="Enter your email" className="min-w-0 flex-1 bg-transparent px-4 outline-none" /><button className="bg-[#6d35ee] px-5 font-bold">Subscribe</button></div><button className="mt-4 flex h-9 w-[150px] items-center justify-between rounded-md border border-white/15 px-3 text-white/80"><span className="flex items-center gap-2"><Icon name="globe" className="size-4" />English (EGP)</span><Icon name="chevron" className="size-4" /></button></div>
      </div>
      <div className="border-t border-white/10 px-5 py-3 text-center text-[10px] text-white/65 sm:px-9">© 2024 DAR. All rights reserved. <span className="ml-10">Terms</span> <span className="ml-10">Privacy</span> <span className="ml-10">Cookies</span></div>
    </footer>
  );
}
