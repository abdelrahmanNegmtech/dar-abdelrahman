"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { filterGroups } from "../data";
import { ChevronDownIcon } from "../icons";

type FilterSidebarProps = {
  compact?: boolean;
};

export function FilterSidebar({ compact = false }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(() => readSelections(searchParams));
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") ?? "Any");
  const [rating, setRating] = useState(searchParams.get("rating") ? `${searchParams.get("rating")}+` : "Any");
  const [showAllAmenities, setShowAllAmenities] = useState(() =>
    filterGroups.amenities.slice(4).some(([label]) => selected.has(String(label))),
  );

  function toggle(label: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function clearAll() {
    setSelected(new Set());
    setBedrooms("Any");
    setRating("Any");
    const params = new URLSearchParams(searchParams.toString());
    ["propertyTypes", "amenities", "bedrooms", "rating", "instant", "freeCancellation", "verified", "page"].forEach((key) => params.delete(key));
    router.push(`/search?${params.toString()}`, { scroll: false });
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    const propertyTypes = filterGroups.property.map(([label]) => String(label)).filter((label) => selected.has(label));
    const amenities = filterGroups.amenities.map(([label]) => String(label)).filter((label) => selected.has(label));
    setOrDelete(params, "propertyTypes", propertyTypes.join(","));
    setOrDelete(params, "amenities", amenities.join(","));
    setOrDelete(params, "bedrooms", bedrooms === "Any" ? "" : bedrooms);
    setOrDelete(params, "rating", rating === "Any" ? "" : rating.replace("+", ""));
    setBoolean(params, "instant", selected.has("Instant booking"));
    setBoolean(params, "freeCancellation", selected.has("Free cancellation"));
    setBoolean(params, "verified", selected.has("Verified only"));
    params.delete("page");
    router.push(`/search?${params.toString()}`, { scroll: false });
  }

  return (
    <aside
      className={`sticky top-[176px] max-h-[calc(100dvh-196px)] min-w-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.04)] ${
        compact ? "hidden lg:block" : "hidden lg:block"
      }`}
    >
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
        <h2 className="text-[20px] font-bold">Filters</h2>
        <button className="text-[13px] font-semibold text-[#5A30E8]" onClick={clearAll} type="button">
          Clear all
        </button>
      </div>

      <div className="max-h-[calc(100dvh-265px)] space-y-4 overflow-y-auto px-5 py-4">
        <FilterGroup title="Property type">
          {filterGroups.property.map(([label, count]) => (
            <CheckboxRow
              count={String(count)}
              key={String(label)}
              label={String(label)}
              onToggle={toggle}
              selected={selected.has(String(label))}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Price range" subtitle="(per night)">
          <div className="mt-4 flex items-center justify-between text-[13px] text-[#334155]">
            <span>EGP 600</span>
            <span>EGP 2,500+</span>
          </div>
          <div className="relative mt-4 h-2 rounded-full bg-[#E9E5FF]">
            <div className="absolute inset-y-0 left-[4%] right-[10%] rounded-full bg-[#5A30E8]" />
            <span className="absolute left-[3%] top-1/2 size-4 -translate-y-1/2 rounded-full bg-[#5A30E8] ring-4 ring-white" />
            <span className="absolute right-[8%] top-1/2 size-4 -translate-y-1/2 rounded-full bg-[#5A30E8] ring-4 ring-white" />
          </div>
          <p className="mt-4 text-center text-[13px] text-[#64748B]">
            EGP 600 - EGP 2,500+
          </p>
        </FilterGroup>

        <FilterGroup title="Bedrooms">
          <div className="mt-3 grid grid-cols-5 gap-2">
            {["Any", "1", "2", "3", "4+"].map((item) => (
              <button
                className={`h-9 rounded-md border text-[13px] font-semibold ${
                  bedrooms === item
                    ? "border-[#5A30E8] bg-[#5A30E8] text-white"
                    : "border-[#E5E7EB] bg-white text-[#0F172A]"
                }`}
                key={item}
                onClick={() => setBedrooms(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup action={showAllAmenities ? "Show less" : "View all"} onAction={() => setShowAllAmenities((current) => !current)} title="Amenities">
          {filterGroups.amenities.slice(0, showAllAmenities ? undefined : 4).map(([label, count]) => (
            <CheckboxRow
              count={String(count)}
              key={String(label)}
              label={String(label)}
              onToggle={toggle}
              selected={selected.has(String(label))}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Booking options">
          {filterGroups.booking.map(([label, count]) => (
            <CheckboxRow
              count={String(count)}
              key={String(label)}
              label={String(label)}
              onToggle={toggle}
              selected={selected.has(String(label))}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Guest rating">
          {["4.5+", "4.0+", "Any"].map((label, index) => (
            <div className="relative flex items-center justify-between py-1.5" key={label}>
              <span className="flex items-center gap-3 text-[14px]">
                <span
                  className={`size-4 rounded-full border ${
                    rating === label
                      ? "border-[#5A30E8] bg-[#5A30E8] shadow-[inset_0_0_0_4px_white]"
                      : "border-[#94A3B8]"
                  }`}
                />
                {label}
              </span>
              <span className="text-[13px] text-[#64748B]">
                {index === 0 ? "7" : index === 1 ? "7" : "7"}
              </span>
              <button className="absolute inset-0" aria-label={`Select rating ${label}`} onClick={() => setRating(label)} type="button" />
            </div>
          ))}
        </FilterGroup>

        <button
          className="h-12 w-full rounded-lg bg-[linear-gradient(180deg,#6C3DFF_0%,#5527D8_100%)] text-[16px] font-bold text-white"
          onClick={applyFilters}
          type="button"
        >
          Apply filters
        </button>
      </div>
    </aside>
  );
}

function FilterGroup({
  action,
  children,
  onAction,
  subtitle,
  title,
}: {
  action?: string;
  children: React.ReactNode;
  onAction?: () => void;
  subtitle?: string;
  title: string;
}) {
  return (
    <section className="border-b border-[#E5E7EB] pb-4 last:border-b-0">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold">
          {title} {subtitle ? <span className="font-normal">{subtitle}</span> : null}
        </h3>
        {action ? (
          <button className="text-[13px] font-semibold text-[#5A30E8]" onClick={onAction} type="button">
            {action}
          </button>
        ) : (
          <ChevronDownIcon aria-hidden="true" className="size-4" />
        )}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function readSelections(searchParams: Pick<URLSearchParams, "get">) {
  const values = [
    ...(searchParams.get("propertyTypes") ?? "").split(","),
    ...(searchParams.get("amenities") ?? "").split(","),
  ].filter(Boolean);
  if (searchParams.get("instant") === "true") values.push("Instant booking");
  if (searchParams.get("freeCancellation") === "true") values.push("Free cancellation");
  if (searchParams.get("verified") === "true") values.push("Verified only");
  return new Set(values);
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value); else params.delete(key);
}

function setBoolean(params: URLSearchParams, key: string, value: boolean) {
  if (value) params.set(key, "true"); else params.delete(key);
}

function CheckboxRow({
  count,
  label,
  onToggle,
  selected,
}: {
  count: string;
  label: string;
  onToggle: (label: string) => void;
  selected: boolean;
}) {
  return (
    <label className="flex items-center justify-between py-1.5 text-[14px]">
      <span className="flex items-center gap-3">
        <input checked={selected} className="sr-only" onChange={() => onToggle(label)} type="checkbox" />
        <span
          className={`flex size-4 items-center justify-center rounded border ${
            selected ? "border-[#5A30E8] bg-[#5A30E8]" : "border-[#94A3B8] bg-white"
          }`}
        >
          {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
        </span>
        {label}
      </span>
      <span className="text-[13px] text-[#64748B]">{count}</span>
    </label>
  );
}
