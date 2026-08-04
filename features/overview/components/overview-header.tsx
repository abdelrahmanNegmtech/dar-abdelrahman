"use client";

import { useState } from "react";

import {
  Bell,
  CalendarDays,
  ChevronDown,
  Plus,
  Search,
} from "lucide-react";

import { Button } from "@/features/design-system";

import type { OverviewDateRangeOption } from "../types";

type OverviewHeaderProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  dateRanges: OverviewDateRangeOption[];
  quickActions: string[];
};

export function OverviewHeader({
  searchValue,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  dateRanges,
  quickActions,
}: OverviewHeaderProps) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const activeDateLabel =
    dateRanges.find((option) => option.value === dateRange)?.label ?? dateRanges[0]?.label;

  return (
    <header className="bg-white px-5 py-4 md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-[12px] text-foreground-muted">
            Welcome back, Ahmed! Here&apos;s what&apos;s happening on DAR.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center xl:w-auto">
            <div className="flex h-[40px] w-full items-center rounded-[0.55rem] border border-border/90 bg-white px-3.5 shadow-[0_4px_14px_rgba(16,25,58,0.04)] sm:min-w-[300px] xl:w-[300px]">
              <Search className="size-4 text-foreground-subtle" />
              <input
                type="search"
                aria-label="Search anything"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search anything..."
                className="h-full w-full bg-transparent pl-2.5 text-[12px] text-foreground outline-none placeholder:text-foreground-subtle"
              />
              <span className="inline-flex items-center rounded-[0.4rem] border border-border bg-surface-muted px-1.5 py-1 text-[10px] font-semibold text-foreground-subtle">
                K
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Notifications"
                className="relative inline-flex size-10 items-center justify-center rounded-[0.55rem] bg-transparent text-foreground shadow-none"
              >
                <Bell className="size-4.5" />
                <span className="absolute right-1 top-1 inline-flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-semibold text-white">
                  3
                </span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setQuickActionOpen((current) => !current)}
                  className="inline-flex h-[40px] items-center gap-2 rounded-[0.6rem] bg-white px-2 shadow-none"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_20px_rgba(91,52,230,0.18)]">
                    <Plus className="size-4.5" />
                  </span>
                  <span className="text-[12px] font-semibold text-foreground">
                    Quick action
                  </span>
                  <ChevronDown className="size-4 text-foreground-subtle" />
                </button>

                {quickActionOpen ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[200px] rounded-[0.6rem] border border-border/90 bg-white p-1.5 shadow-[0_18px_40px_rgba(16,25,58,0.12)]">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => setQuickActionOpen(false)}
                        className="flex w-full items-center rounded-[0.45rem] px-3 py-2 text-left text-[12px] font-medium text-foreground hover:bg-surface-muted"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateMenuOpen((current) => !current)}
              leadingIcon={<CalendarDays className="size-4" />}
              trailingIcon={<ChevronDown className="size-4" />}
              className="h-[42px] rounded-[0.6rem] border-border/90 bg-white px-4 text-[12px] font-medium text-foreground shadow-[0_4px_14px_rgba(16,25,58,0.04)] hover:bg-white"
            >
              {activeDateLabel}
            </Button>

            {dateMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[210px] rounded-[0.6rem] border border-border/90 bg-white p-1.5 shadow-[0_18px_40px_rgba(16,25,58,0.12)]">
                {dateRanges.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onDateRangeChange(option.value);
                      setDateMenuOpen(false);
                    }}
                    className={`flex w-full items-center rounded-[0.45rem] px-3 py-2 text-left text-[12px] ${
                      option.value === dateRange
                        ? "bg-brand-soft text-brand"
                        : "text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
