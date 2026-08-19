import { ChevronDownIcon, GlobeIcon } from "@/components/ui";

export function LanguageSelector() {
  return (
    <button
      aria-label="English language; additional languages are not available yet"
      className="inline-flex h-12 cursor-not-allowed items-center gap-2 rounded-full bg-white/14 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur-md"
      disabled
      title="Additional languages are not available yet"
      type="button"
    >
      <GlobeIcon className="size-4" />
      <span>English</span>
      <ChevronDownIcon className="size-4" />
    </button>
  );
}
