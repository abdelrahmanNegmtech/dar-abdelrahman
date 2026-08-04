import { privacyHighlights } from "../data";

export function PrivacyHighlights() {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <h2 className="text-[16px] font-black text-[#0F172A]">Privacy highlights</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {privacyHighlights.map((item) => {
          const Icon = item.icon;

          return (
            <article className="rounded-lg border border-[#E5E7EB] p-4" key={item.title}>
              <Icon className="size-8 text-[#5E2FE5]" />
              <h3 className="mt-3 text-[13px] font-extrabold text-[#0F172A]">{item.title}</h3>
              <p className="mt-1 text-[12px] font-medium leading-5 text-[#334155]">{item.description}</p>
            </article>
          );
        })}
      </div>
      <a
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#8B5CF6] text-[13px] font-extrabold text-[#5E2FE5] transition hover:bg-[#F7F3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
        href="#privacy"
      >
        View full privacy policy
      </a>
    </section>
  );
}
