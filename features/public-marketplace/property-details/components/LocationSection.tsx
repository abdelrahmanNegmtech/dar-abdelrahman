import { nearbyPlaces } from "../data";
import { MapPinIcon } from "../icons";

export function LocationSection() {
  return (
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_1fr]">
      <div>
        <h2 className="mb-3 text-[18px] font-bold">Where you&apos;ll be</h2>
        <div className="relative h-[145px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#EFF2EA]">
          <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(35deg,transparent_0_46%,rgba(226,176,75,0.45)_47%_49%,transparent_50%),linear-gradient(110deg,transparent_0_47%,rgba(148,163,184,0.55)_48%_50%,transparent_51%),linear-gradient(0deg,rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:220px_160px,260px_190px,38px_38px,38px_38px]" />
          <span className="absolute left-[56%] top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-[#6C3DFF] text-white shadow-[0_12px_30px_rgba(108,61,255,0.3)]">
              <MapPinIcon className="size-7" />
            </span>
            <strong className="mt-1 text-[18px]">B6</strong>
          </span>
          <span className="absolute left-[33%] top-5 text-[13px] text-[#64748B]">Madinaty Club</span>
          <span className="absolute right-9 bottom-6 text-[13px] text-[#64748B]">Madinaty Open Air Mall</span>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-[18px] font-bold">What&apos;s nearby</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {nearbyPlaces.map(({ distance, icon: Icon, label }) => (
            <article className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]" key={label}>
              <Icon className="size-6 text-[#5A30E8]" />
              <span>
                <strong className="block text-[13px]">{label}</strong>
                <span className="text-[12px] text-[#64748B]">{distance}</span>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
