import Link from "next/link";
import { notFound } from "next/navigation";
import {
  OwnerDeferredNotice,
  OwnerInfoGrid,
  OwnerPropertyPageShell,
  OwnerPropertyTabs,
  OwnerStatusBadge,
  formatOwnerDate,
} from "@/features/properties/components/owner-property-dashboard";
import {
  saveOwnerPropertyEdit,
  submitOwnerPropertyForReview,
} from "@/features/properties/data/owner-property-actions";
import {
  getOwnerPropertyById,
  getOwnerPropertySummary,
  mapPropertyTypeToOwnerLabel,
} from "@/features/properties/data/owner-property-queries";

function readCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function cardClassName(extra?: string) {
  return `rounded-[9px] border border-[#e8ebf2] bg-white p-4 md:p-5 ${extra ?? ""}`.trim();
}

function fieldClassName() {
  return "owner-input-text mt-2 h-10 w-full rounded-[9px] border border-[#d9e0ea] px-3 text-[#26344f] outline-none";
}

function textAreaClassName() {
  return "owner-input-text mt-2 min-h-32 w-full rounded-[9px] border border-[#d9e0ea] px-3 py-3 text-[#26344f] outline-none";
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property, summary] = await Promise.all([
    getOwnerPropertyById(id),
    getOwnerPropertySummary(id),
  ]);

  if (!property || !summary) {
    notFound();
  }

  async function saveAction(formData: FormData) {
    "use server";

    await saveOwnerPropertyEdit({
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? ""),
      area: String(formData.get("area") ?? ""),
      areaSizeSqm: String(formData.get("areaSizeSqm") ?? ""),
      bathrooms: String(formData.get("bathrooms") ?? ""),
      bedrooms: String(formData.get("bedrooms") ?? ""),
      beds: String(formData.get("beds") ?? ""),
      buildingName: String(formData.get("buildingName") ?? ""),
      city: String(formData.get("city") ?? ""),
      countryCode: String(formData.get("countryCode") ?? "EG"),
      countryName: String(formData.get("countryName") ?? "Egypt"),
      description: String(formData.get("description") ?? ""),
      guests: String(formData.get("guests") ?? ""),
      id,
      instantBookEnabled: readCheckbox(formData, "instantBookEnabled"),
      latitude: String(formData.get("latitude") ?? ""),
      locationPrecision: String(formData.get("locationPrecision") ?? "approximate") as
        | "approximate"
        | "exact_private"
        | "exact_public",
      longitude: String(formData.get("longitude") ?? ""),
      maximumNights: String(formData.get("maximumNights") ?? ""),
      minimumNights: String(formData.get("minimumNights") ?? ""),
      nightlyPrice: String(formData.get("nightlyPrice") ?? ""),
      title: String(formData.get("title") ?? ""),
      type: String(formData.get("type") ?? ""),
    });
  }

  async function submitAction() {
    "use server";

    await submitOwnerPropertyForReview(id);
  }

  return (
    <OwnerPropertyPageShell
      actions={(
        <OwnerStatusBadge
          statusGroup={summary.statusGroup}
          statusLabel={summary.statusLabel}
        />
      )}
      description="Update your property details and make changes to keep your listing accurate."
      title="Edit Property"
    >
      <OwnerPropertyTabs propertyId={id} />

      <section className={cardClassName()}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="owner-section-title">{summary.title}</h2>
              <span className="owner-badge rounded-full bg-[#f4f6fa] px-3 py-1 text-[#52607a]">
                {mapPropertyTypeToOwnerLabel(property.property_type)}
              </span>
            </div>
            <p className="owner-body text-[#52607a]">{summary.locationLabel}</p>
            <p className="owner-body text-[#52607a]">
              {summary.bedroomsCount} bedrooms / {summary.bathroomsCount} bathrooms /{" "}
              {summary.maxGuests} guests
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
            <div className="rounded-[9px] border border-[#eef1f6] bg-[#fbfcfe] p-3">
              <p className="owner-badge uppercase tracking-[0.08em] text-[#7b879c]">
                Moderation
              </p>
              <p className="owner-label mt-1 text-[#26344f]">{property.moderation_status}</p>
            </div>
            <div className="rounded-[9px] border border-[#eef1f6] bg-[#fbfcfe] p-3">
              <p className="owner-badge uppercase tracking-[0.08em] text-[#7b879c]">
                Publication
              </p>
              <p className="owner-label mt-1 text-[#26344f]">{property.publication_status}</p>
            </div>
          </div>
        </div>
      </section>

      <form action={saveAction} className="space-y-4">
        <section className={cardClassName()}>
          <div className="mb-4">
            <h2 className="owner-section-title">Basic Information</h2>
            <p className="owner-body text-[#52607a]">
              Update the listing name, category, and description shown to guests.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="owner-label text-[#26344f]">
              Property Title
              <input name="title" defaultValue={property.title} className={fieldClassName()} />
            </label>
            <label className="owner-label text-[#26344f]">
              Property Type
              <select
                name="type"
                defaultValue={mapPropertyTypeToOwnerLabel(property.property_type)}
                className={fieldClassName()}
              >
                {["Apartment", "Studio", "Villa", "Duplex", "Hotel"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="owner-label text-[#26344f] md:col-span-2">
              Description
              <textarea
                name="description"
                defaultValue={property.description ?? ""}
                className={textAreaClassName()}
              />
            </label>
          </div>
        </section>

        <section className={cardClassName()}>
          <div className="mb-4">
            <h2 className="owner-section-title">Capacity &amp; Pricing</h2>
            <p className="owner-body text-[#52607a]">
              Keep guest capacity, sleeping setup, and pricing details current.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="owner-label text-[#26344f]">
              Guests
              <input name="guests" defaultValue={property.max_guests} className={fieldClassName()} />
            </label>
            <label className="owner-label text-[#26344f]">
              Bedrooms
              <input
                name="bedrooms"
                defaultValue={property.bedrooms_count}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Beds
              <input name="beds" defaultValue={property.beds_count} className={fieldClassName()} />
            </label>
            <label className="owner-label text-[#26344f]">
              Bathrooms
              <input
                name="bathrooms"
                defaultValue={property.bathrooms_count}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Nightly price
              <input
                name="nightlyPrice"
                defaultValue={property.base_nightly_amount / 100}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Minimum nights
              <input
                name="minimumNights"
                defaultValue={property.minimum_nights}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Maximum nights
              <input
                name="maximumNights"
                defaultValue={property.maximum_nights ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Area size
              <input
                name="areaSizeSqm"
                defaultValue={property.area_size_sqm ?? ""}
                className={fieldClassName()}
              />
            </label>
          </div>
        </section>

        <section className={cardClassName()}>
          <div className="mb-4">
            <h2 className="owner-section-title">Location</h2>
            <p className="owner-body text-[#52607a]">
              Make sure the property address and map coordinates stay accurate.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="owner-label text-[#26344f]">
              Address line 1
              <input
                name="addressLine1"
                defaultValue={property.address_line_1}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Address line 2
              <input
                name="addressLine2"
                defaultValue={property.address_line_2 ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Building name
              <input
                name="buildingName"
                defaultValue={property.building_name ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Area
              <input name="area" defaultValue={property.area ?? ""} className={fieldClassName()} />
            </label>
            <label className="owner-label text-[#26344f]">
              City
              <input name="city" defaultValue={property.city} className={fieldClassName()} />
            </label>
            <label className="owner-label text-[#26344f]">
              Country
              <input
                name="countryName"
                defaultValue={property.country_name}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Country code
              <input
                name="countryCode"
                defaultValue={property.country_code}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Latitude
              <input
                name="latitude"
                defaultValue={property.latitude ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f]">
              Longitude
              <input
                name="longitude"
                defaultValue={property.longitude ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className="owner-label text-[#26344f] md:col-span-2 xl:col-span-1">
              Location precision
              <select
                name="locationPrecision"
                defaultValue={property.location_precision}
                className={fieldClassName()}
              >
                <option value="approximate">Approximate</option>
                <option value="exact_private">Exact private</option>
                <option value="exact_public">Exact public</option>
              </select>
            </label>
          </div>
        </section>

        <section className={cardClassName()}>
          <div className="mb-4">
            <h2 className="owner-section-title">Booking settings</h2>
            <p className="owner-body text-[#52607a]">
              Review how this listing behaves when a guest tries to book it.
            </p>
          </div>
          <label className="flex items-start gap-3 rounded-[9px] border border-[#eef1f6] bg-[#fbfcfe] p-4">
            <input
              type="checkbox"
              name="instantBookEnabled"
              defaultChecked={property.instant_book_enabled}
              className="mt-1 size-4 rounded border border-[#c7d0df]"
            />
            <span>
              <span className="owner-label block text-[#26344f]">Instant book enabled</span>
              <span className="owner-body block text-[#52607a]">
                Allow eligible guests to book without waiting for manual approval.
              </span>
            </span>
          </label>
        </section>

        <OwnerDeferredNotice>
          Amenities, cancellation policy, and other mock-only form fields remain
          UI-preserved but deferred because the current Phase 10 schema does not
          provide canonical columns for them.
        </OwnerDeferredNotice>

        <OwnerInfoGrid
          items={[
            { label: "Moderation status", value: property.moderation_status },
            { label: "Publication status", value: property.publication_status },
            {
              label: "Submitted for review",
              value: property.submitted_for_review_at
                ? formatOwnerDate(property.submitted_for_review_at)
                : "Not submitted",
            },
            {
              label: "Approved at",
              value: property.approved_at ? formatOwnerDate(property.approved_at) : "Not approved",
            },
            {
              label: "Rejected at",
              value: property.rejected_at ? formatOwnerDate(property.rejected_at) : "Not rejected",
            },
            { label: "Public slug", value: property.public_slug },
          ]}
        />

        <div className={cardClassName("sticky bottom-3")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <Link
              href={`/owner/properties/${id}`}
              className="owner-button-text inline-flex h-11 items-center justify-center rounded-[9px] border border-[#dbe2ee] px-5 text-[#26344f]"
            >
              Cancel
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                formAction={submitAction}
                className="owner-button-text inline-flex h-11 items-center justify-center rounded-[9px] border border-[#cdbdff] bg-white px-5 text-[#5824e6]"
              >
                Submit for review
              </button>
              <button className="owner-button-text inline-flex h-11 items-center justify-center rounded-[9px] bg-[#5824e6] px-5 text-white">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </OwnerPropertyPageShell>
  );
}
