import { notFound } from "next/navigation";
import {
  OwnerPricingTable,
  OwnerPropertyPageShell,
  OwnerPropertySummaryCard,
  OwnerPropertyTabs,
} from "@/features/properties/components/owner-property-dashboard";
import {
  deleteOwnerPricingRule,
  saveOwnerAvailabilitySettings,
  saveOwnerMinimumStayRule,
  toggleOwnerPricingRule,
} from "@/features/properties/data/owner-property-actions";
import {
  getOwnerPropertyById,
  getOwnerPropertyPricingRules,
  getOwnerPropertySummary,
} from "@/features/properties/data/owner-property-queries";

function readCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value ? Number(value) : null;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property, summary, rules] = await Promise.all([
    getOwnerPropertyById(id),
    getOwnerPropertySummary(id),
    getOwnerPropertyPricingRules(id, { ruleTypes: ["minimum_stay_override"] }),
  ]);

  if (!property || !summary) {
    notFound();
  }

  async function settingsAction(formData: FormData) {
    "use server";

    await saveOwnerAvailabilitySettings({
      instantBookEnabled: readCheckbox(formData, "instantBookEnabled"),
      maximumNights: readOptionalNumber(formData, "maximumNights"),
      minimumNights: Number(formData.get("minimumNights") ?? 1),
      propertyId: id,
    });
  }

  async function createRuleAction(formData: FormData) {
    "use server";

    await saveOwnerMinimumStayRule({
      endsOn: String(formData.get("endsOn") ?? ""),
      isActive: readCheckbox(formData, "isActive"),
      label: String(formData.get("label") ?? ""),
      maximumNightsOverride: readOptionalNumber(formData, "maximumNightsOverride"),
      minimumNightsOverride: Number(formData.get("minimumNightsOverride") ?? 1),
      priority: Number(formData.get("priority") ?? 100),
      propertyId: id,
      startsOn: String(formData.get("startsOn") ?? ""),
    });
  }

  return (
    <OwnerPropertyPageShell
      description="Manage real minimum-stay overrides and the owner-editable stay settings stored on the property record."
      title="Availability rules"
    >
      <OwnerPropertyTabs propertyId={id} />
      <OwnerPropertySummaryCard summary={summary} />
      <section className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
        <h2 className="owner-section-title">Base availability settings</h2>
        <form action={settingsAction} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="owner-label">Minimum nights<input name="minimumNights" defaultValue={property.minimum_nights} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Maximum nights<input name="maximumNights" defaultValue={property.maximum_nights ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label flex items-center gap-3 pt-8">
            <input type="checkbox" name="instantBookEnabled" defaultChecked={property.instant_book_enabled} />
            Instant book enabled
          </label>
          <div className="flex items-end">
            <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">Save settings</button>
          </div>
        </form>
      </section>
      <section className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
        <h2 className="owner-section-title">Add custom minimum-stay rule</h2>
        <form action={createRuleAction} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="owner-label">Label<input name="label" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Starts on<input type="date" name="startsOn" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Ends on<input type="date" name="endsOn" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Minimum nights<input name="minimumNightsOverride" defaultValue={2} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Maximum nights override<input name="maximumNightsOverride" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Priority<input name="priority" defaultValue={100} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label flex items-center gap-3 pt-8">
            <input type="checkbox" name="isActive" defaultChecked />
            Active rule
          </label>
          <div className="md:col-span-2 xl:col-span-3 flex items-end">
            <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">Create rule</button>
          </div>
        </form>
      </section>
      <OwnerPricingTable rows={rules} />
      <div className="space-y-4">
        {rules.map((rule) => {
          async function updateAction(formData: FormData) {
            "use server";

            await saveOwnerMinimumStayRule({
              endsOn: String(formData.get("endsOn") ?? ""),
              isActive: readCheckbox(formData, "isActive"),
              label: String(formData.get("label") ?? ""),
              maximumNightsOverride: readOptionalNumber(formData, "maximumNightsOverride"),
              minimumNightsOverride: Number(formData.get("minimumNightsOverride") ?? 1),
              priority: Number(formData.get("priority") ?? 100),
              propertyId: id,
              ruleId: rule.id,
              startsOn: String(formData.get("startsOn") ?? ""),
            });
          }

          async function toggleAction() {
            "use server";

            await toggleOwnerPricingRule({ isActive: !rule.isActive, propertyId: id, ruleId: rule.id });
          }

          async function deleteAction() {
            "use server";

            await deleteOwnerPricingRule(id, rule.id);
          }

          return (
            <section key={rule.id} className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
              <form action={updateAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <label className="owner-label">Label<input name="label" defaultValue={rule.label} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Starts on<input type="date" name="startsOn" defaultValue={rule.startsOn} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Ends on<input type="date" name="endsOn" defaultValue={rule.endsOn} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Minimum nights<input name="minimumNightsOverride" defaultValue={rule.minimumNightsOverride ?? 1} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Maximum nights override<input name="maximumNightsOverride" defaultValue={rule.maximumNightsOverride ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Priority<input name="priority" defaultValue={rule.priority} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label flex items-center gap-3 pt-8">
                  <input type="checkbox" name="isActive" defaultChecked={rule.isActive} />
                  Active rule
                </label>
                <div className="md:col-span-2 xl:col-span-3 flex flex-wrap items-end gap-3">
                  <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">Save rule</button>
                  <button formAction={toggleAction} className="owner-button-text rounded-lg border border-[#dbe2ee] px-4 py-2">
                    {rule.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button formAction={deleteAction} className="owner-button-text rounded-lg border border-[#dbe2ee] px-4 py-2">
                    Delete rule
                  </button>
                </div>
              </form>
            </section>
          );
        })}
      </div>
    </OwnerPropertyPageShell>
  );
}
