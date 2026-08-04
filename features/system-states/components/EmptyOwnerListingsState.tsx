import { EmptyStateCard } from "./EmptyStateCard";
import { OwnerEmptyIllustration } from "./StateIllustrations";

const steps = ["Add details", "Upload photos", "Submit for review"];

export function EmptyOwnerListingsState() {
  return (
    <EmptyStateCard
      actions={[{ label: "Add new property" }]}
      description="Add your first studio, furnished apartment or hotel room and submit it for DAR approval."
      illustration={<OwnerEmptyIllustration />}
      title="You have not listed any properties yet."
    >
      <ol className="mx-auto mt-6 flex max-w-[520px] flex-wrap items-center justify-center gap-3 text-[12px] font-bold text-[#475569]">
        {steps.map((step, index) => (
          <li className="flex items-center gap-2" key={step}>
            <span className="grid size-7 place-items-center rounded-full bg-[#6C3DFF] text-white">{index + 1}</span>
            {step}
            {index < steps.length - 1 ? <span className="hidden h-px w-8 border-t border-dashed border-[#A78BFA] sm:block" /> : null}
          </li>
        ))}
      </ol>
    </EmptyStateCard>
  );
}
