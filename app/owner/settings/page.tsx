import Link from "next/link";
import { BadgeCheck, CircleHelp } from "lucide-react";
import { OwnerShell } from "@/components/owner/owner-shell";
import { ownerRoutes } from "@/lib/owner-routes";

export default function OwnerSettingsPage() {
  return (
    <OwnerShell active="Settings">
      <div className="owner-dashboard-page">
        <h1 className="owner-page-title">Settings</h1>
        <p className="owner-page-description text-slate-500">Manage your owner account and support preferences.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link href={ownerRoutes.verification} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-violet-300"><BadgeCheck className="h-6 w-6 text-violet-600" /><h2 className="owner-card-title mt-3">Verification</h2></Link>
          <Link href={ownerRoutes.help} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-violet-300"><CircleHelp className="h-6 w-6 text-violet-600" /><h2 className="owner-card-title mt-3">Help center</h2></Link>
        </div>
      </div>
    </OwnerShell>
  );
}
