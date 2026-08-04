import { HeadphonesIcon, ShieldIcon, CheckCircleIcon, LockIcon } from "@/components/ui";
import { trustStripItems } from "../data/systemStates";

const icons = [ShieldIcon, CheckCircleIcon, ShieldIcon, HeadphonesIcon];

export function TrustStrip() {
  return (
    <section className="rounded-2xl bg-[#06111F] p-4 text-white shadow-[0_18px_50px_rgba(2,6,23,0.22)]">
      <div className="grid gap-4 rounded-xl border border-dashed border-white/24 p-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_260px]">
        {trustStripItems.map((item, index) => {
          const Icon = icons[index] ?? ShieldIcon;

          return (
            <article className="flex gap-4" key={item.title}>
              <span className="grid size-12 shrink-0 place-items-center rounded-xl text-[#F6B733]">
                <Icon className="size-8" />
              </span>
              <span>
                <h2 className="text-[14px] font-black">{item.title}</h2>
                <p className="mt-1 text-[12px] font-medium leading-5 text-white/72">{item.description}</p>
              </span>
            </article>
          );
        })}
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white/8 p-4">
          <div>
            <p className="text-[13px] font-black">Need help?</p>
            <p className="mt-1 text-[12px] text-white/72">Contact our support team</p>
          </div>
          <a
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] px-4 text-[12px] font-black text-white"
            href="mailto:support@dar.example"
          >
            <LockIcon className="size-4" />
            Open support center
          </a>
        </div>
      </div>
    </section>
  );
}
