import { notFound } from "next/navigation";
import {
  OwnerAvailabilityTable,
  OwnerPropertyPageShell,
  OwnerPropertySummaryCard,
  OwnerPropertyTabs,
} from "@/features/properties/components/owner-property-dashboard";
import {
  deleteOwnerAvailabilityEntry,
  saveOwnerAvailabilityRange,
  updateOwnerAvailabilityEntry,
} from "@/features/properties/data/owner-property-actions";
import { getOwnerPropertyAvailability, getOwnerPropertySummary } from "@/features/properties/data/owner-property-queries";

function readEnum(value: FormDataEntryValue | null) {
  return value === "maintenance" ? "maintenance" : "owner_blocked";
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [summary, availability] = await Promise.all([
    getOwnerPropertySummary(id),
    getOwnerPropertyAvailability(id),
  ]);

  if (!summary) {
    notFound();
  }

  async function rangeAction(formData: FormData) {
    "use server";

    await saveOwnerAvailabilityRange({
      dateFrom: String(formData.get("dateFrom") ?? ""),
      dateTo: String(formData.get("dateTo") ?? ""),
      note: String(formData.get("note") ?? ""),
      propertyId: id,
      reason: formData.get("status") === "blocked" ? readEnum(formData.get("reason")) : undefined,
      status: String(formData.get("status") ?? "blocked") as "available" | "blocked",
    });
  }

  return (
    <OwnerPropertyPageShell
      description="Manual calendar management is now backed by the real property_availability table. Booking-generated rows stay read-only, and owner edits are limited to manual rows only."
      title="Calendar management"
    >
      <OwnerPropertyTabs propertyId={id} />
      <OwnerPropertySummaryCard summary={summary} />
      <section className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
        <h2 className="owner-section-title">Apply a manual date range</h2>
        <form action={rangeAction} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="owner-label">From<input type="date" name="dateFrom" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">To<input type="date" name="dateTo" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Status
            <select name="status" defaultValue="blocked" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3">
              <option value="blocked">Blocked</option>
              <option value="available">Mark available</option>
            </select>
          </label>
          <label className="owner-label">Reason
            <select name="reason" defaultValue="owner_blocked" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3">
              <option value="owner_blocked">Owner blocked</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>
          <label className="owner-label">Note<input name="note" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <div className="md:col-span-2 xl:col-span-5">
            <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">
              Save date range
            </button>
          </div>
        </form>
      </section>
      <OwnerAvailabilityTable rows={availability} />
      <div className="space-y-4">
        {availability.filter((row) => row.isManual).map((row) => {
          async function updateAction(formData: FormData) {
            "use server";

            await updateOwnerAvailabilityEntry({
              availabilityId: row.id,
              note: String(formData.get("note") ?? ""),
              propertyId: id,
              reason: String(formData.get("status") ?? "blocked") === "blocked"
                ? readEnum(formData.get("reason"))
                : null,
              status: String(formData.get("status") ?? "blocked") as "available" | "blocked",
            });
          }

          async function deleteAction() {
            "use server";

            await deleteOwnerAvailabilityEntry({ availabilityId: row.id, propertyId: id });
          }

          return (
            <section key={row.id} className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
              <h2 className="owner-section-title">{row.date}</h2>
              <form action={updateAction} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="owner-label">Status
                  <select name="status" defaultValue={row.status} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3">
                    <option value="blocked">Blocked</option>
                    <option value="available">Available</option>
                  </select>
                </label>
                <label className="owner-label">Reason
                  <select name="reason" defaultValue={row.reason ?? "owner_blocked"} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3">
                    <option value="owner_blocked">Owner blocked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </label>
                <label className="owner-label xl:col-span-2">Note
                  <input name="note" defaultValue={row.note ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" />
                </label>
                <div className="xl:col-span-4 flex flex-wrap gap-3">
                  <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">Update row</button>
                  <button formAction={deleteAction} className="owner-button-text rounded-lg border border-[#dbe2ee] px-4 py-2">Delete row</button>
                </div>
              </form>
            </section>
          );
        })}
      </div>
    </OwnerPropertyPageShell>
  );
}
