import {
  ArrowRightIcon,
  CalendarIcon,
  CreditCardIcon,
  SearchIcon,
  SmileIcon,
} from "@/components/ui";
import { ProcessStepCard } from "./ProcessStepCard";

const steps = [
  {
    description: "Select whether you want studios, apartments, or hotels.",
    icon: SearchIcon,
    title: "Choose",
  },
  {
    description: "Pick your destination, dates, and guests.",
    icon: CalendarIcon,
    title: "Search",
  },
  {
    description: "Confirm your reservation securely online.",
    icon: CreditCardIcon,
    title: "Book",
  },
  {
    description: "Check in and enjoy your stay.",
    icon: SmileIcon,
    title: "Enjoy",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-white px-5 pb-10 sm:px-8 lg:px-12 xl:px-8 xl:pb-9 2xl:px-9">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 text-center">
          <h2 className="text-[26px] font-bold leading-tight text-[#0F172A]">
            How it works
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
            Simple steps to book your perfect stay
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {steps.map((step, index) => (
            <div className="relative" key={step.title}>
              <ProcessStepCard step={`${index + 1}`} {...step} />
              {index < steps.length - 1 ? (
                <div className="pointer-events-none absolute left-full top-1/2 z-10 hidden -translate-x-[10px] -translate-y-1/2 items-center justify-center text-[#0F172A] xl:flex">
                  <ArrowRightIcon className="size-6" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
