import { ChevronDownIcon, GlobeIcon } from "@/components/ui";

export function LanguageSelector() {
  return (
    <button
      aria-label="Select language"
      className="inline-flex h-12 items-center gap-2 rounded-full bg-white/14 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition duration-200 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      type="button"
    >
      <GlobeIcon className="size-4" />
      <span>English</span>
      <ChevronDownIcon className="size-4" />
    </button>
  );
}
