import Link from "next/link";
import { OwnerShell } from "@/components/owner/owner-shell";
import { getOwnerProperties } from "@/features/properties/data/owner-property-queries";

export default async function OwnerPropertiesPage() {
  const properties = await getOwnerProperties();

  return (
    <OwnerShell active="My Properties">
      <div className="owner-dashboard-content">
        <div className="flex items-center justify-between gap-4 max-[600px]:items-start">
          <div>
            <h1 className="owner-page-title">My Properties</h1>
            <p className="owner-page-description mt-2">
              Manage your listings and review their current status.
            </p>
          </div>
          <Link href="/owner/properties/new/details" className="owner-button-text shrink-0 rounded-lg bg-[#5824e6] px-5 py-3 text-white">
            Add Property
          </Link>
        </div>
        <div className="mt-5 space-y-4">
          {properties.map((property) => (
            <article className="rounded-xl border border-[#e8ebf2] bg-white p-5 shadow-sm" key={property.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="owner-section-title">{property.title}</h2>
                  <p className="owner-body mt-1">{property.location}</p>
                </div>
                <span className={`owner-badge rounded-full px-3 py-1 ${property.statusBadgeClassName}`}>
                  {property.statusLabel}
                </span>
              </div>
              <p className="owner-helper mt-4 text-slate-500">
                {property.photoCount} photo{property.photoCount === 1 ? "" : "s"} · Updated {property.updatedAtLabel}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={property.primaryActionHref} className="owner-button-text rounded-lg border border-[#9d7cff] px-4 py-2">
                  {property.primaryActionLabel}
                </Link>
                <Link href={`/owner/properties/${property.id}/edit`} className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">
                  Make changes
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </OwnerShell>
  );
}
