"use client";

import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/ui";
import {
  countries,
  defaultCountry,
  normalizeDialingCode,
  type CountryOption,
} from "../data/countries";

type CountrySelectProps = {
  className?: string;
  compact?: boolean;
  error?: string;
  hideLabel?: boolean;
  id?: string;
  label?: string;
  onChange: (country: CountryOption) => void;
  value: CountryOption | null;
};

export function CountrySelect({
  className = "",
  compact = false,
  error,
  hideLabel = false,
  id,
  label = "Country / Nationality",
  onChange,
  value,
}: CountrySelectProps) {
  const generatedId = useId();
  const buttonId = id ?? `country-select-${generatedId}`;
  const listboxId = `${buttonId}-listbox`;
  const searchId = `${buttonId}-search`;
  const selectedCountry = value ?? defaultCountry;
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const filteredCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return countries;
    }

    return countries.filter((country) => {
      const dialingCode = normalizeDialingCode(country.dialingCode);
      const queryDialingCode = normalizeDialingCode(normalizedQuery);

      return (
        country.name.toLowerCase().includes(normalizedQuery) ||
        country.code.toLowerCase().includes(normalizedQuery) ||
        country.dialingCode.toLowerCase().includes(normalizedQuery) ||
        (queryDialingCode ? dialingCode.includes(queryDialingCode) : false)
      );
    });
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      closeDropdown(true);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [isOpen]);

  function closeDropdown(restoreFocus = false) {
    setIsOpen(false);
    setQuery("");

    if (restoreFocus) {
      window.setTimeout(() => buttonRef.current?.focus(), 0);
    }
  }

  function selectCountry(country: CountryOption) {
    onChange(country);
    closeDropdown(true);
  }

  function openDropdown() {
    const selectedIndex = filteredCountries.findIndex((country) => country.code === selectedCountry.code);
    setActiveIndex(Math.max(selectedIndex, 0));
    setIsOpen(true);
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDropdown();
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filteredCountries.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" && filteredCountries[activeIndex]) {
      event.preventDefault();
      selectCountry(filteredCountries[activeIndex]);
    }
  }

  const heightClassName = compact ? "h-9 rounded-md px-3 text-[13px]" : "h-[44px] rounded-xl px-[18px] text-[14px]";
  const labelClassName = compact ? "text-[13px] font-medium text-[#334155]" : "text-[13px] font-semibold text-[#0F172A]";
  const activeOptionId = filteredCountries[activeIndex] ? `${listboxId}-${filteredCountries[activeIndex].code}` : undefined;

  return (
    <div className={`relative space-y-2 ${className}`} ref={rootRef}>
      <label className={`${hideLabel ? "sr-only" : "block"} ${labelClassName}`} htmlFor={buttonId}>
        {label}
      </label>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex w-full items-center gap-3 border bg-white text-left text-[#64748B] transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6C3DFF]/10 ${
          error ? "border-red-300" : "border-[#D8DEE8]"
        } ${heightClassName}`}
        id={buttonId}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleButtonKeyDown}
        ref={buttonRef}
        type="button"
      >
        <CountryFlag country={selectedCountry} />
        <span className="min-w-0 flex-1 truncate">
          {selectedCountry.name} ({selectedCountry.dialingCode})
        </span>
        <ChevronDownIcon className={`size-4 shrink-0 text-[#64748B] transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}

      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-full overflow-hidden rounded-xl border border-[#D8DEE8] bg-white shadow-[0_20px_48px_rgba(15,23,42,0.18)] sm:w-[320px]">
          <div className="border-b border-[#E5E7EB] p-2">
            <label className="sr-only" htmlFor={searchId}>
              Search countries
            </label>
            <input
              aria-activedescendant={activeOptionId}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded="true"
              className="h-10 w-full rounded-lg border border-[#D8DEE8] px-3 text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#6C3DFF] focus:ring-4 focus:ring-[#6C3DFF]/10"
              id={searchId}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search country, ISO code, or + code"
              ref={searchRef}
              role="combobox"
              value={query}
            />
          </div>

          <div className="max-h-[260px] overflow-y-auto p-1" id={listboxId} role="listbox">
            {filteredCountries.length ? (
              filteredCountries.map((country, index) => {
                const isActive = index === activeIndex;
                const isSelected = country.code === selectedCountry.code;

                return (
                  <button
                    aria-selected={isSelected}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] ${
                      isActive ? "bg-[#F7F3FF] text-[#4C1D95]" : "text-[#0F172A] hover:bg-slate-50"
                    }`}
                    id={`${listboxId}-${country.code}`}
                    key={country.code}
                    onClick={() => selectCountry(country)}
                    onMouseEnter={() => setActiveIndex(index)}
                    role="option"
                    type="button"
                  >
                    <CountryFlag country={country} />
                    <span className="min-w-0 flex-1 truncate">{country.name}</span>
                    <span className="shrink-0 font-semibold text-[#64748B]">{country.dialingCode}</span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-center text-[13px] font-medium text-[#64748B]">No countries found.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CountryFlag({ country }: { country: CountryOption }) {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-6 shrink-0 overflow-hidden rounded-[2px] bg-slate-100 bg-cover bg-center shadow-sm ring-1 ring-black/10"
      style={{ backgroundImage: `url("https://flagcdn.com/w40/${country.code.toLowerCase()}.png")` }}
    />
  );
}
