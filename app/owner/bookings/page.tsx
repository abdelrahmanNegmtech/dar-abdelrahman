import Link from "next/link";
import { CalendarDays, ChevronRight, Users } from "lucide-react";
import { OwnerShell } from "@/components/owner/owner-shell";
import { ownerRoutes } from "@/lib/owner-routes";

export default function OwnerBookingsPage() {
  return (
    <OwnerShell active="Booking Requests">
      <div className="owner-dashboard-page">
        <h1 className="owner-page-title">Booking requests</h1>
        <p className="owner-page-description text-slate-500">Review pending requests and respond to guests.</p>
        <Link href={ownerRoutes.bookingDecision} className="mt-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-violet-300 hover:bg-violet-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
          <div className="rounded-full bg-violet-100 p-3 text-violet-700"><CalendarDays className="h-6 w-6" /></div>
          <div className="min-w-0 flex-1">
            <h2 className="owner-card-title">Modern Apartment in Zamalek</h2>
            <p className="owner-helper text-slate-500">20 May – 25 May 2025</p>
            <span className="owner-helper mt-1 inline-flex items-center gap-1 text-slate-600"><Users className="h-4 w-4" /> Omar Khaled · 2 guests</span>
          </div>
          <span className="owner-badge rounded-full bg-amber-100 px-3 py-1 text-amber-700">Pending</span>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </Link>
      </div>
    </OwnerShell>
  );
}
