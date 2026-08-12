import Link from "next/link";
import { FilePenLine } from "lucide-react";
import { OwnerShell } from "@/components/owner/owner-shell";
import { getOwnerProperties } from "@/features/properties/data/owner-property-queries";

export default async function PropertyDraftsPage() {
  const properties = await getOwnerProperties();
  const drafts = properties.filter((property) => property.statusGroup === "draft");

  return (
    <OwnerShell active="My Properties">
      <div className="owner-dashboard-page">
        <h1 className="owner-page-title">Draft properties</h1>
        <p className="owner-page-description text-slate-500">Continue editing saved property listings.</p>
        <div className="mt-6 space-y-4">
          {drafts.map((property) => (
            <Link href={`/owner/properties/${property.id}/edit`} key={property.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-violet-300">
              <FilePenLine className="h-7 w-7 text-violet-600" />
              <div>
                <h2 className="owner-card-title">{property.title}</h2>
                <p className="owner-helper text-slate-500">Draft · Updated {property.updatedAtLabel}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </OwnerShell>
  );
}
