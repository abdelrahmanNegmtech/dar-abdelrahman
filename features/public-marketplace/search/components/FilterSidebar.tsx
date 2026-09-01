"use client";

import { useRouter, useSearchParams } from "next/navigation";

type FilterSidebarProps = { compact?: boolean };

export function FilterSidebar({ compact = false }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function apply(formData: FormData) {
    const params = new URLSearchParams();
    for (const key of ["destination", "checkIn", "checkOut", "guests", "type", "minPrice", "maxPrice", "bedrooms", "beds", "bathrooms"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    if (formData.get("instant") === "true") params.set("instant", "true");
    router.push(`/search${params.size ? `?${params}` : ""}`);
  }

  return (
    <aside className={`sticky top-[176px] h-fit rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] ${compact ? "hidden min-[1700px]:block" : "hidden lg:block"}`}>
      <div className="flex items-center justify-between"><h2 className="text-[20px] font-bold">Filters</h2><button className="text-[13px] font-semibold text-[#5A30E8]" onClick={() => router.push("/search")} type="button">Clear all</button></div>
      <form action={apply} className="mt-5 space-y-4">
        <Field defaultValue={searchParams.get("destination") ?? ""} label="Location" name="destination" placeholder="City or area" />
        <div className="grid grid-cols-2 gap-3"><Field defaultValue={searchParams.get("checkIn") ?? ""} label="Check-in" name="checkIn" type="date" /><Field defaultValue={searchParams.get("checkOut") ?? ""} label="Check-out" name="checkOut" type="date" /></div>
        <Field defaultValue={searchParams.get("guests") ?? ""} label="Guests" min="1" name="guests" type="number" />
        <label className="block text-[13px] font-bold">Property type<select defaultValue={searchParams.get("type") ?? ""} name="type" className="mt-2 h-10 w-full rounded-lg border border-[#D8DEE8] bg-white px-3 text-[13px]"><option value="">Any type</option><option value="apartment">Apartment</option><option value="studio">Studio</option><option value="villa">Villa</option><option value="duplex">Duplex</option><option value="hotel">Hotel</option></select></label>
        <div className="grid grid-cols-2 gap-3"><Field defaultValue={searchParams.get("minPrice") ?? ""} label="Min price" min="0" name="minPrice" type="number" /><Field defaultValue={searchParams.get("maxPrice") ?? ""} label="Max price" min="0" name="maxPrice" type="number" /></div>
        <div className="grid grid-cols-3 gap-2"><Field defaultValue={searchParams.get("bedrooms") ?? ""} label="Bedrooms" min="0" name="bedrooms" type="number" /><Field defaultValue={searchParams.get("beds") ?? ""} label="Beds" min="0" name="beds" type="number" /><Field defaultValue={searchParams.get("bathrooms") ?? ""} label="Baths" min="0" name="bathrooms" type="number" /></div>
        <label className="flex items-center gap-2 text-[13px] font-semibold"><input defaultChecked={searchParams.get("instant") === "true"} name="instant" type="checkbox" value="true" /> Instant book</label>
        <button className="h-11 w-full rounded-lg bg-[#5A30E8] text-[14px] font-bold text-white" type="submit">Apply filters</button>
      </form>
    </aside>
  );
}

function Field({ label, name, type = "text", ...props }: { defaultValue?: string; label: string; min?: string; name: string; placeholder?: string; type?: string }) {
  return <label className="block text-[13px] font-bold">{label}<input className="mt-2 h-10 w-full rounded-lg border border-[#D8DEE8] px-3 text-[13px]" name={name} type={type} {...props} /></label>;
}
