import { amenities } from "../data";

export function AmenitiesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {amenities.map((amenity) => {
        const Icon = amenity.icon;

        return (
          <div className="flex items-center gap-3 text-[14px]" key={amenity.label}>
            <Icon className="size-5 text-[#0F172A]" />
            <span>{amenity.label}</span>
          </div>
        );
      })}
    </div>
  );
}
