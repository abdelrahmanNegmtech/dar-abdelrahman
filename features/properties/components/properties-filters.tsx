import { Bookmark, CalendarDays } from "lucide-react";

import { Button, Input, SearchInput, Select } from "@/features/design-system";

import type { PropertyFilters } from "../types";

type PropertiesFiltersProps = {
  filters: PropertyFilters;
  onFilterChange: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  onClear: () => void;
  saveView: boolean;
  onToggleSaveView: () => void;
  options: {
    status: Array<{ label: string; value: string }>;
    type: Array<{ label: string; value: string }>;
    city: Array<{ label: string; value: string }>;
    ownerType: Array<{ label: string; value: string }>;
    qualityScore: Array<{ label: string; value: string }>;
  };
};

export function PropertiesFilters({
  filters,
  onFilterChange,
  onClear,
  saveView,
  onToggleSaveView,
  options,
}: PropertiesFiltersProps) {
  return (
    <section className="rounded-[0.65rem] border border-border/90 bg-white p-4 shadow-[0_1px_4px_rgba(16,25,58,0.03)]">
      <div className="space-y-3">
        <div className="max-w-[560px]">
          <label className="mb-1 block text-[10px] font-medium leading-none text-foreground-muted">
            Search
          </label>
          <SearchInput
            aria-label="Search properties"
            placeholder="Search by property ID, title, owner, city, compound..."
            value={filters.search}
            onChange={(event) => onFilterChange("search", event.target.value)}
            containerClassName="h-9 rounded-[0.4rem] px-3 shadow-none [&_svg]:size-4"
            className="h-9 text-[11px]"
          />
        </div>

        <div className="grid gap-x-3 gap-y-2.5 lg:grid-cols-4 lg:items-end">
          <FilterSelect label="Status" value={filters.status} onChange={(value) => onFilterChange("status", value)} options={options.status} />
          <FilterSelect label="Type" value={filters.type} onChange={(value) => onFilterChange("type", value)} options={options.type} />
          <FilterSelect label="City" value={filters.city} onChange={(value) => onFilterChange("city", value)} options={options.city} />
          <FilterSelect label="Owner type" value={filters.ownerType} onChange={(value) => onFilterChange("ownerType", value)} options={options.ownerType} />
        </div>

        <div className="grid gap-x-3 gap-y-2.5 lg:grid-cols-[120px_minmax(0,1.25fr)_minmax(0,1.1fr)_auto] lg:items-end">
          <FilterSelect label="Quality score" value={filters.qualityScore} onChange={(value) => onFilterChange("qualityScore", value)} options={options.qualityScore} />

          <div className="min-w-0">
            <label className="mb-1 block text-[10px] font-medium leading-none text-foreground-muted">
              Price range (EGP / night)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                aria-label="Minimum price"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(event) => onFilterChange("minPrice", event.target.value)}
                className="h-9 rounded-[0.4rem] text-[11px]"
              />
              <Input
                aria-label="Maximum price"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(event) => onFilterChange("maxPrice", event.target.value)}
                className="h-9 rounded-[0.4rem] text-[11px]"
              />
            </div>
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-[10px] font-medium leading-none text-foreground-muted">
              Date submitted
            </label>
            <div className="grid grid-cols-2 gap-2">
              <DateInput
                ariaLabel="Start date"
                placeholder="Start date"
                value={filters.startDate}
                onChange={(value) => onFilterChange("startDate", value)}
              />
              <DateInput
                ariaLabel="End date"
                placeholder="End date"
                value={filters.endDate}
                onChange={(value) => onFilterChange("endDate", value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" className="h-9 rounded-[0.4rem] px-3.5 text-[11px]">
              Apply filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-[0.4rem] px-3.5 text-[11px]"
              onClick={onClear}
            >
              Clear all
            </Button>
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<Bookmark className="size-4" />}
              className={`h-9 rounded-[0.4rem] px-3.5 text-[11px] ${saveView ? "border-brand/40 text-brand" : ""}`}
              onClick={onToggleSaveView}
            >
              Save view
            </Button>
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
    <div className="min-w-0">
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

function DateInput({
  ariaLabel,
  placeholder,
  value,
  onChange,
}: {
  ariaLabel: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-foreground-subtle" />
      <Input
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-[0.4rem] pl-8 text-[11px]"
      />
    </div>
  );
}
