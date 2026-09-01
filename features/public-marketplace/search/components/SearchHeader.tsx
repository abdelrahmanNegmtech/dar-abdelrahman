"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SearchHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function search(formData: FormData) {
    const params = new URLSearchParams();
    for (const key of ["destination", "checkIn", "checkOut", "guests", "type"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    router.push(`/search${params.size ? `?${params}` : ""}`);
  }

  return <section className="border-b border-[#E5E7EB] bg-white"><form action={search} className="mx-auto grid max-w-[1760px] gap-3 px-5 py-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_.7fr_1fr_auto] lg:px-11"><Field defaultValue={searchParams.get("destination") ?? ""} label="Destination" name="destination" placeholder="City or area" /><Field defaultValue={searchParams.get("checkIn") ?? ""} label="Check-in" name="checkIn" type="date" /><Field defaultValue={searchParams.get("checkOut") ?? ""} label="Check-out" name="checkOut" type="date" /><Field defaultValue={searchParams.get("guests") ?? ""} label="Guests" min="1" name="guests" type="number" /><label className="text-[12px] font-semibold text-[#64748B]">Type<select className="mt-1 h-11 w-full rounded-lg border border-[#D8DEE8] bg-white px-3 text-[14px] text-[#0F172A]" defaultValue={searchParams.get("type") ?? ""} name="type"><option value="">Any type</option><option value="apartment">Apartment</option><option value="studio">Studio</option><option value="villa">Villa</option><option value="duplex">Duplex</option><option value="hotel">Hotel</option></select></label><button className="mt-5 h-11 rounded-lg bg-[#5A30E8] px-6 text-[14px] font-bold text-white" type="submit">Search</button></form></section>;
}

function Field({ label, name, type = "text", ...props }: { defaultValue?: string; label: string; min?: string; name: string; placeholder?: string; type?: string }) {
  return <label className="text-[12px] font-semibold text-[#64748B]">{label}<input className="mt-1 h-11 w-full rounded-lg border border-[#D8DEE8] px-3 text-[14px] text-[#0F172A]" name={name} type={type} {...props} /></label>;
}
