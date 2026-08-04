import { galleryHighlights } from "../data";

export function GalleryHighlights() {
  return (
    <section className="border-b border-[#E5E7EB] py-7">
      <h3 className="text-[16px] font-bold text-[#0B1020]">Gallery highlights</h3>
      <div className="mt-5 space-y-5">
        {galleryHighlights.map(({ icon: Icon, label }) => (
          <div className="flex items-center gap-4 text-[13px] font-medium text-[#1F2937]" key={label}>
            <Icon className="size-5 shrink-0 text-[#5E2FE5]" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
