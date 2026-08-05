import Link from "next/link";
import { FilePenLine } from "lucide-react";
import { OwnerShell } from "@/components/owner/owner-shell";
import { ownerRoutes } from "@/lib/owner-routes";

export default function PropertyDraftsPage() {
  return (
    <OwnerShell active="My Properties">
      <div className="owner-dashboard-page">
        <h1 className="owner-page-title">Draft properties</h1>
        <p className="owner-page-description text-slate-500">Continue editing saved property listings.</p>
        <Link href={ownerRoutes.propertyEdit(1)} className="mt-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-violet-300">
          <FilePenLine className="h-7 w-7 text-violet-600" />
          <div><h2 className="owner-card-title">Modern Apartment in Zamalek</h2><p className="owner-helper text-slate-500">Draft · Last edited recently</p></div>
        </Link>
      </div>
    </OwnerShell>
  );
}
