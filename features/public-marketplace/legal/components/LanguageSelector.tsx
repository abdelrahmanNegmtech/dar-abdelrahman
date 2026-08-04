import { GlobeIcon } from "@/components/ui";

export function LanguageSelector() {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="inline-flex items-center gap-2 text-[16px] font-black text-[#0F172A]">
        <GlobeIcon className="size-5" />
        Language
      </h2>
      <fieldset className="mt-4 space-y-3">
        <legend className="sr-only">Select legal language</legend>
        <label className="flex items-center gap-3 text-[13px] font-semibold text-[#334155]">
          <input className="accent-[#5E2FE5]" defaultChecked name="legal-language" type="radio" />
          English
        </label>
        <label className="flex items-center gap-3 text-[13px] font-semibold text-[#334155]">
          <input className="accent-[#5E2FE5]" name="legal-language" type="radio" />
          العربية
        </label>
      </fieldset>
    </section>
  );
}
