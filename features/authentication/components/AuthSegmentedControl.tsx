import { MailIcon, PhoneIcon } from "@/components/ui";

export function AuthSegmentedControl() {
  return (
    <div className="grid h-[44px] grid-cols-2 rounded-md border border-[#D8DEE8] bg-white p-0.5">
      <button
        aria-pressed="true"
        className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] text-sm font-bold text-white shadow-sm"
        type="button"
      >
        <MailIcon className="size-4" />
        Email
      </button>
      <button
        aria-pressed="false"
        className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-[5px] text-sm font-bold text-[#64748B] opacity-60"
        disabled
        title="Phone auth is not configured yet"
        type="button"
      >
        <PhoneIcon className="size-4 text-[#64748B]" />
        Phone
      </button>
    </div>
  );
}
