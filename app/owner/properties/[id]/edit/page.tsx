import Link from "next/link";
import { notFound } from "next/navigation";
import {
  OwnerDeferredNotice,
  OwnerInfoGrid,
  OwnerPropertyPageShell,
  OwnerPropertySummaryCard,
  OwnerPropertyTabs,
} from "@/features/properties/components/owner-property-dashboard";
import {
  saveOwnerPropertyEdit,
  submitOwnerPropertyForReview,
} from "@/features/properties/data/owner-property-actions";
import { getOwnerPropertyById, getOwnerPropertySummary, mapPropertyTypeToOwnerLabel } from "@/features/properties/data/owner-property-queries";

function readCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
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
      locationPrecision: String(formData.get("locationPrecision") ?? "approximate") as "approximate" | "exact_private" | "exact_public",
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
        <form action={submitAction}>
          <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">
            Submit for review
          </button>
        </form>
      )}
      description="Edit the supported owner-controlled listing fields. Unsupported UI-only fields remain preserved visually but are not written to the database in this phase."
      title="Edit property"
    >
      <OwnerPropertyTabs propertyId={id} />
      <OwnerPropertySummaryCard summary={summary} />
      <form action={saveAction} className="space-y-5">
        <section className="grid gap-4 rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm md:grid-cols-2">
          <label className="owner-label">
            Title
            <input name="title" defaultValue={property.title} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" />
          </label>
          <label className="owner-label">
            Property type
            <select name="type" defaultValue={mapPropertyTypeToOwnerLabel(property.property_type)} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3">
              {["Apartment", "Studio", "Villa", "Duplex", "Hotel"].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="owner-label md:col-span-2">
            Description
            <textarea name="description" defaultValue={property.description ?? ""} className="owner-input-text mt-2 min-h-32 w-full rounded-lg border border-[#d9e0ea] px-3 py-3" />
          </label>
        </section>

        <section className="grid gap-4 rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
          <label className="owner-label">Guests<input name="guests" defaultValue={property.max_guests} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Bedrooms<input name="bedrooms" defaultValue={property.bedrooms_count} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Beds<input name="beds" defaultValue={property.beds_count} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Bathrooms<input name="bathrooms" defaultValue={property.bathrooms_count} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Nightly price (EGP)<input name="nightlyPrice" defaultValue={property.base_nightly_amount / 100} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Minimum nights<input name="minimumNights" defaultValue={property.minimum_nights} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Maximum nights<input name="maximumNights" defaultValue={property.maximum_nights ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Area (sqm)<input name="areaSizeSqm" defaultValue={property.area_size_sqm ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
        </section>

        <section className="grid gap-4 rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-3">
          <label className="owner-label">Address line 1<input name="addressLine1" defaultValue={property.address_line_1} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Address line 2<input name="addressLine2" defaultValue={property.address_line_2 ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Building name<input name="buildingName" defaultValue={property.building_name ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Area<input name="area" defaultValue={property.area ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">City<input name="city" defaultValue={property.city} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Country name<input name="countryName" defaultValue={property.country_name} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Country code<input name="countryCode" defaultValue={property.country_code} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Latitude<input name="latitude" defaultValue={property.latitude ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Longitude<input name="longitude" defaultValue={property.longitude ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Location precision
            <select name="locationPrecision" defaultValue={property.location_precision} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3">
              <option value="approximate">Approximate</option>
              <option value="exact_private">Exact private</option>
              <option value="exact_public">Exact public</option>
            </select>
          </label>
          <label className="owner-label flex items-center gap-3 pt-8">
            <input type="checkbox" name="instantBookEnabled" defaultChecked={property.instant_book_enabled} />
            Instant book enabled
          </label>
        </section>

        <OwnerDeferredNotice>
          Amenities, cancellation policy, and other mock-only form fields remain UI-preserved but deferred because the current Phase 10 schema does not provide canonical columns for them.
        </OwnerDeferredNotice>

        <OwnerInfoGrid
          items={[
            { label: "Moderation status", value: property.moderation_status },
            { label: "Publication status", value: property.publication_status },
            { label: "Submitted for review", value: property.submitted_for_review_at ?? "Not submitted" },
            { label: "Approved at", value: property.approved_at ?? "Not approved" },
            { label: "Rejected at", value: property.rejected_at ?? "Not rejected" },
            { label: "Public slug", value: property.public_slug },
          ]}
        />

        <div className="flex flex-wrap gap-3">
          <button className="owner-button-text rounded-lg bg-[#5824e6] px-5 py-3 text-white">
            Save changes
          </button>
          <Link href={`/owner/properties/${id}`} className="owner-button-text rounded-lg border border-[#dbe2ee] px-5 py-3">
            Cancel
          </Link>
        </div>
      </form>
    </OwnerPropertyPageShell>
  );
}
