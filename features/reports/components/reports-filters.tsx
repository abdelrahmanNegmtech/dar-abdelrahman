"use client";

import { CalendarDays } from "lucide-react";

import { Select } from "@/features/design-system";

import type { ReportsFilters } from "../types";

type ReportsFiltersProps = {
  filters: ReportsFilters;
  onChange: <K extends keyof ReportsFilters>(key: K, value: ReportsFilters[K]) => void;
  options: {
    cities: Array<{ label: string; value: string }>;
    propertyTypes: Array<{ label: string; value: string }>;
    ownerTypes: Array<{ label: string; value: string }>;
    paymentMethods: Array<{ label: string; value: string }>;
  };
};

export function ReportsFilters({ filters, onChange, options }: ReportsFiltersProps) {
  const rangeItems: Array<{ key: ReportsFilters["range"]; label: string; icon?: boolean }> = [
    { key: "7", label: "Last 7 days" },
    { key: "30", label: "30 days" },
    { key: "90", label: "90 days" },
    { key: "custom", label: "Custom", icon: true },
  ];

  return (
    <section className="rounded-[0.65rem] border border-border/90 bg-white p-4 shadow-[0_1px_4px_rgba(16,25,58,0.03)]">
      <div className="flex flex-wrap items-end gap-3 xl:flex-nowrap">
        <div className="min-w-[320px] flex-1">
          <label className="mb-1 block text-[10px] font-medium leading-none text-foreground-muted">
            Date range
          </label>
          <div className="inline-flex items-center rounded-[0.55rem] border border-border/90 bg-surface-muted/35 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            {rangeItems.map((item) => {
              const active = filters.range === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onChange("range", item.key)}
                  className={`inline-flex min-w-[58px] items-center justify-center gap-1 rounded-[0.45rem] px-3 py-2 text-[11px] font-medium leading-tight transition-[background-color,color,box-shadow] ${
                    active
                      ? "bg-brand text-white shadow-[0_8px_16px_rgba(91,52,230,0.18)]"
                      : "text-foreground-muted hover:bg-white hover:text-foreground"
                  }`}
                >
                  <span className="text-center">{item.label}</span>
                  {item.icon ? <CalendarDays className="size-3.5 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <FilterSelect label="City" value={filters.city} onChange={(value) => onChange("city", value)} options={options.cities} />
        <FilterSelect label="Property type" value={filters.propertyType} onChange={(value) => onChange("propertyType", value)} options={options.propertyTypes} />
        <FilterSelect label="Owner type" value={filters.ownerType} onChange={(value) => onChange("ownerType", value)} options={options.ownerTypes} />
        <FilterSelect label="Payment method" value={filters.paymentMethod} onChange={(value) => onChange("paymentMethod", value)} options={options.paymentMethods} />

        <div className="min-w-[160px] pb-0.5">
          <div className="flex items-center justify-between gap-3 rounded-[0.55rem] px-1 py-2">
            <span className="text-[12px] font-medium text-foreground-muted">Compare previous period</span>
            <button
              type="button"
              aria-pressed={filters.comparePrevious}
              onClick={() => onChange("comparePrevious", !filters.comparePrevious)}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                filters.comparePrevious ? "bg-brand" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                  filters.comparePrevious ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="min-w-[145px] flex-1">
      <label className="mb-1 block text-[10px] font-medium leading-none text-foreground-muted">
        {label}
      </label>
      <Select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        options={options}
        className="h-9 rounded-[0.4rem] px-3 text-[11px]"
      />
    </div>
  );
}
