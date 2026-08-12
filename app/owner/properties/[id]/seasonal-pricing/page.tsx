import { notFound } from "next/navigation";
import {
  OwnerPricingTable,
  OwnerPropertyPageShell,
  OwnerPropertySummaryCard,
  OwnerPropertyTabs,
} from "@/features/properties/components/owner-property-dashboard";
import {
  deleteOwnerPricingRule,
  saveOwnerPricingRule,
  saveOwnerSeasonalPricing,
  toggleOwnerPricingRule,
} from "@/features/properties/data/owner-property-actions";
import {
  getOwnerPropertyById,
  getOwnerPropertyPricingRules,
  type OwnerPricingRuleViewModel,
  getOwnerPropertySummary,
} from "@/features/properties/data/owner-property-queries";

function readCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value ? Number(value) : null;
}

function isSeasonalRule(
  rule: OwnerPricingRuleViewModel,
): rule is OwnerPricingRuleViewModel & {
  ruleType: "seasonal_override" | "weekend_override" | "date_range_discount" | "date_range_markup" | "custom";
} {
  return rule.ruleType !== "minimum_stay_override";
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property, summary, rules] = await Promise.all([
    getOwnerPropertyById(id),
    getOwnerPropertySummary(id),
    getOwnerPropertyPricingRules(id, {
      ruleTypes: [
        "seasonal_override",
        "weekend_override",
        "date_range_discount",
        "date_range_markup",
        "custom",
      ],
    }),
  ]);

  if (!property || !summary) {
    notFound();
  }

  async function basePriceAction(formData: FormData) {
    "use server";

    await saveOwnerSeasonalPricing(id, Number(formData.get("basePrice") ?? 0));
  }

  async function createRuleAction(formData: FormData) {
    "use server";

    await saveOwnerPricingRule({
      daysOfWeekMask: readOptionalNumber(formData, "daysOfWeekMask"),
      endsOn: String(formData.get("endsOn") ?? ""),
      isActive: readCheckbox(formData, "isActive"),
      label: String(formData.get("label") ?? ""),
      maximumNightsOverride: readOptionalNumber(formData, "maximumNightsOverride"),
      minimumNightsOverride: readOptionalNumber(formData, "minimumNightsOverride"),
      nightlyAmountOverride: readOptionalNumber(formData, "nightlyAmountOverride"),
      percentAdjustment: readOptionalNumber(formData, "percentAdjustment"),
      priority: Number(formData.get("priority") ?? 100),
      propertyId: id,
      ruleType: String(formData.get("ruleType") ?? "seasonal_override") as
        | "seasonal_override"
        | "weekend_override"
        | "date_range_discount"
        | "date_range_markup"
        | "custom",
      startsOn: String(formData.get("startsOn") ?? ""),
    });
  }

  return (
    <OwnerPropertyPageShell
      description="Manage owner-scoped seasonal and calendar-based pricing rules without exposing any broader pricing engine controls."
      title="Seasonal pricing"
    >
      <OwnerPropertyTabs propertyId={id} />
      <OwnerPropertySummaryCard summary={summary} />
      <section className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
        <h2 className="owner-section-title">Base nightly price</h2>
        <form action={basePriceAction} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="owner-label">
            Base price (EGP)
            <input name="basePrice" defaultValue={property.base_nightly_amount / 100} className="owner-input-text mt-2 h-10 w-48 rounded-lg border border-[#d9e0ea] px-3" />
          </label>
          <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">Save base price</button>
        </form>
      </section>
      <section className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
        <h2 className="owner-section-title">Add pricing rule</h2>
        <form action={createRuleAction} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="owner-label">Label<input name="label" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Rule type
            <select name="ruleType" defaultValue="seasonal_override" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3">
              {["seasonal_override", "weekend_override", "date_range_discount", "date_range_markup", "custom"].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="owner-label">Starts on<input type="date" name="startsOn" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Ends on<input type="date" name="endsOn" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Priority<input name="priority" defaultValue={100} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Nightly override (EGP)<input name="nightlyAmountOverride" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Percent adjustment<input name="percentAdjustment" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Min nights override<input name="minimumNightsOverride" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Max nights override<input name="maximumNightsOverride" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Days mask (0-127)<input name="daysOfWeekMask" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label flex items-center gap-3 pt-8">
            <input type="checkbox" name="isActive" defaultChecked />
            Active rule
          </label>
          <div className="md:col-span-2 xl:col-span-4 flex items-end">
            <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">Create pricing rule</button>
          </div>
        </form>
      </section>
      <OwnerPricingTable rows={rules} />
      <div className="space-y-4">
        {rules.filter(isSeasonalRule).map((rule) => {
          async function updateAction(formData: FormData) {
            "use server";

            await saveOwnerPricingRule({
              daysOfWeekMask: readOptionalNumber(formData, "daysOfWeekMask"),
              endsOn: String(formData.get("endsOn") ?? ""),
              isActive: readCheckbox(formData, "isActive"),
              label: String(formData.get("label") ?? ""),
              maximumNightsOverride: readOptionalNumber(formData, "maximumNightsOverride"),
              minimumNightsOverride: readOptionalNumber(formData, "minimumNightsOverride"),
              nightlyAmountOverride: readOptionalNumber(formData, "nightlyAmountOverride"),
              percentAdjustment: readOptionalNumber(formData, "percentAdjustment"),
              priority: Number(formData.get("priority") ?? 100),
              propertyId: id,
              ruleId: rule.id,
              ruleType: rule.ruleType,
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
                <label className="owner-label">Priority<input name="priority" defaultValue={rule.priority} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Nightly override (EGP)<input name="nightlyAmountOverride" defaultValue={rule.nightlyAmountOverride ? rule.nightlyAmountOverride / 100 : ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Percent adjustment<input name="percentAdjustment" defaultValue={rule.percentAdjustment ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Min nights override<input name="minimumNightsOverride" defaultValue={rule.minimumNightsOverride ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Max nights override<input name="maximumNightsOverride" defaultValue={rule.maximumNightsOverride ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Days mask<input name="daysOfWeekMask" defaultValue={rule.daysOfWeekMask ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label flex items-center gap-3 pt-8">
                  <input type="checkbox" name="isActive" defaultChecked={rule.isActive} />
                  Active rule
                </label>
                <div className="md:col-span-2 xl:col-span-5 flex flex-wrap gap-3">
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
