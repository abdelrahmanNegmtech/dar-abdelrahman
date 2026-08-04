import { CheckCircleIcon, CameraIcon } from "@/components/ui";

const cards = [
  {
    body: "We ensure accuracy and quality so you can book with confidence.",
    title: "Photos are reviewed before listings go live on DAR.",
  },
  {
    body: "Real photos from the property taken by our team.",
    title: "What you see is what you get.",
  },
];

export function GalleryInfoBanner() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-[#E9D5FF] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF7FF_100%)] p-5 shadow-[0_8px_24px_rgba(92,47,229,0.06)]">
      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => (
          <article className="flex items-center gap-4" key={card.title}>
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#5E2FE5] text-white shadow-[0_0_0_8px_rgba(94,47,229,0.12)]">
              <CheckCircleIcon className="size-8" />
            </span>
            <div>
              <h3 className="text-[14px] font-bold text-[#0B1020]">{card.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#64748B]">{card.body}</p>
            </div>
          </article>
        ))}
      </div>
      <CameraIcon className="pointer-events-none absolute -bottom-6 right-10 hidden size-32 rotate-[-8deg] text-[#A78BFA]/20 lg:block" />
    </section>
  );
}
