import { Building2, Trees, Waves, Warehouse } from "lucide-react";

import type { RecentBooking } from "../types";

const THUMBNAIL_STYLES: Record<
  RecentBooking["thumbnailKey"],
  { icon: typeof Building2; className: string }
> = {
  zamalek: {
    icon: Building2,
    className: "from-stone-300 via-stone-200 to-zinc-100",
  },
  maadi: {
    icon: Warehouse,
    className: "from-amber-200 via-orange-100 to-stone-50",
  },
  sokhna: {
    icon: Waves,
    className: "from-sky-300 via-cyan-100 to-blue-50",
  },
  "new-cairo": {
    icon: Trees,
    className: "from-emerald-300 via-lime-100 to-stone-50",
  },
};

export function PropertyThumbnail({
  variant,
}: {
  variant: RecentBooking["thumbnailKey"];
}) {
  const style = THUMBNAIL_STYLES[variant];
  const Icon = style.icon;

  return (
    <div
      className={`flex size-11 shrink-0 items-center justify-center rounded-[0.45rem] bg-gradient-to-br ${style.className} ring-1 ring-black/5`}
    >
      <Icon className="size-4.5 text-slate-700/85" />
    </div>
  );
}
