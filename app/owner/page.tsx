import Link from "next/link";
import { Building2, CalendarDays, Wallet, Shield, LifeBuoy, ArrowRight } from "lucide-react";
import { Card, OwnerShell } from "@/components/owner/owner-shell";

const quickLinks = [
  { label: "My Properties", href: "/owner/properties", icon: Building2, desc: "Manage your listings" },
  { label: "Booking Requests", href: "/owner/bookings/request-decision", icon: CalendarDays, desc: "Review & respond to bookings" },
  { label: "Payouts", href: "/owner/payouts", icon: Wallet, desc: "Track your earnings" },
  { label: "Verification", href: "/owner/verification", icon: Shield, desc: "Complete your profile" },
  { label: "Help Center", href: "/owner/help-center", icon: LifeBuoy, desc: "Get support" },
];

const stats = [
  { label: "Total Properties", value: "4", change: "+1 this month" },
  { label: "Active Bookings", value: "12", change: "3 pending response" },
  { label: "Total Earnings", value: "EGP 286,700", change: "+EGP 18,450 this month" },
  { label: "Reviews", value: "24", change: "4.8 ★ average rating" },
];

export default function OwnerDashboardPage() {
  return <OwnerShell active="Overview"><div className="owner-dashboard-content">
        <div className="px-7 pt-6">
          <h1 className="owner-page-title">Welcome back, Ahmed 👋</h1>
          <p className="owner-page-description mt-1 text-[#5d667d]">
            Here&apos;s what&apos;s happening with your properties today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-5 grid grid-cols-4 gap-4 px-7 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4">
              <p className="owner-helper text-[#68718a]">{stat.label}</p>
              <b className="owner-number-md mt-1 block">{stat.value}</b>
              <p className="owner-helper mt-1 text-[#2fa84f]">{stat.change}</p>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-6 px-7">
          <div className="flex items-center justify-between">
            <h2 className="owner-section-title">Quick Actions</h2>
            <Link href="/owner/properties" className="owner-button-text flex items-center gap-1 text-[var(--brand)]">
              View all <ArrowRight size={14} strokeWidth={1.8} />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-4 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2 max-[450px]:grid-cols-1">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="group p-5 transition-all duration-200 hover:border-[var(--brand)] hover:shadow-md">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-[#f0ebff] text-[var(--brand)] transition-colors group-hover:bg-[var(--brand)] group-hover:text-white">
                    <link.icon size={22} strokeWidth={1.8} />
                  </div>
                  <b className="owner-card-title mt-4 block">{link.label}</b>
                  <p className="owner-helper mt-1 text-[#68718a]">{link.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 px-7 pb-8">
          <Card className="p-5">
            <h2 className="owner-section-title">Recent Activity</h2>
            <div className="mt-4 space-y-4">
              {[
                { action: "New booking confirmed", detail: "Modern Apartment in Zamalek — May 25-28", time: "2 hours ago" },
                { action: "Payout received", detail: "EGP 3,640 — Payout ID: PAYOUT-7982", time: "1 day ago" },
                { action: "Property approved", detail: "Studio in New Capital is now live", time: "3 days ago" },
                { action: "Verification updated", detail: "Identity documents submitted for review", time: "5 days ago" },
              ].map((item) => (
                <div key={item.action} className="flex items-start gap-3 border-b border-[#edf0f4] pb-3 last:border-0 last:pb-0">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--brand)]" />
                  <div className="min-w-0">
                    <b className="owner-label block">{item.action}</b>
                    <p className="owner-helper text-[#68718a]">{item.detail}</p>
                    <p className="owner-helper mt-0.5 text-[#8f97a8]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
      </div>
    </div></OwnerShell>;
  
}
