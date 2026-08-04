import { galleryCategories } from "../data";

type GalleryCategoryTabsProps = {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

export function GalleryCategoryTabs({ activeCategory, onCategoryChange }: GalleryCategoryTabsProps) {
  return (
    <nav className="-mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Photo categories">
      <div className="flex min-w-max gap-3 pb-1">
        {galleryCategories.map(({ icon: Icon, label }) => (
          <button
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-[13px] font-semibold shadow-[0_4px_10px_rgba(15,23,42,0.03)] transition ${
              activeCategory === label
                ? "border-[#5E2FE5] bg-[#5E2FE5] text-white"
                : "border-[#E5E7EB] bg-white text-[#1F2937] hover:border-[#C4B5FD]"
            }`}
            key={label}
            onClick={() => onCategoryChange(label)}
            type="button"
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
