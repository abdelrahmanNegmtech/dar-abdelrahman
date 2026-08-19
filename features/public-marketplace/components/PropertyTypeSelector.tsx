import { BuildingIcon, HouseIcon } from "@/components/ui";

const propertyTypes = [
  {
    description: "For short or long stays",
    icon: HouseIcon,
    title: "Studios & Furnished Apartments",
  },
  {
    description: "Hotel rooms & suites",
    icon: BuildingIcon,
    title: "Hotels",
  },
];

type PropertyTypeSelectorProps = {
  activeType: string;
  onChange: (type: string) => void;
};

export function PropertyTypeSelector({ activeType, onChange }: PropertyTypeSelectorProps) {

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {propertyTypes.map((type) => {
        const Icon = type.icon;
        const active = activeType === type.title;

        return (
          <button
            aria-pressed={active}
            className={`flex min-h-[88px] items-center gap-4 rounded-2xl border px-4 text-left shadow-[0_12px_35px_rgba(2,6,23,0.16)] backdrop-blur-xl transition xl:min-h-[68px] xl:gap-3 xl:rounded-xl xl:px-3 2xl:min-h-[76px] ${
              active
                ? "border-white/34 bg-white text-[#0F172A]"
                : "border-white/18 bg-white/12 text-white hover:bg-white/16"
            }`}
            key={type.title}
            onClick={() => onChange(type.title)}
            type="button"
          >
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-full xl:size-9 2xl:size-10 ${
                active ? "bg-[#F2EEFF] text-[#6C3DFF]" : "bg-white/12 text-white"
              }`}
            >
              <Icon className="size-5 xl:size-4 2xl:size-5" />
            </span>
            <span>
              <span className="block text-[15px] font-bold leading-5 xl:text-[12px] xl:leading-4 2xl:text-[13px]">
                {type.title}
              </span>
              <span className={`mt-1 block text-[13px] xl:text-[11px] 2xl:text-[12px] ${active ? "text-[#64748B]" : "text-white/72"}`}>
                {type.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
