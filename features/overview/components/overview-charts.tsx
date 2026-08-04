"use client";

import { ChevronDown } from "lucide-react";

import { Badge, Card } from "@/features/design-system";

import type { OverviewLinePoint, OverviewRevenuePoint } from "../types";
import { BarChart } from "./bar-chart";
import { LineChart } from "./line-chart";

type OverviewChartsProps = {
  bookingPoints: OverviewLinePoint[];
  bookingTotal: string;
  bookingComparison: string;
  revenuePoints: OverviewRevenuePoint[];
  revenueTotal: string;
  revenueComparison: string;
  currency: string;
  onCurrencyChange: (value: string) => void;
};

export function OverviewCharts({
  bookingPoints,
  bookingTotal,
  bookingComparison,
  revenuePoints,
  revenueTotal,
  revenueComparison,
  currency,
  onCurrencyChange,
}: OverviewChartsProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
      <Card padding="md" className="space-y-4 rounded-[0.85rem] border-border/85 shadow-[0_4px_14px_rgba(16,25,58,0.035)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[14px] font-semibold text-foreground">
            Bookings overview
          </h2>
          <div className="flex items-center gap-5 text-[12px] text-foreground-muted">
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-5 rounded-full bg-brand" />
              This week
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-5 rounded-full border-t-2 border-dashed border-[#AAB4D6]" />
              Last week
            </span>
          </div>
        </div>

        <LineChart points={bookingPoints} />

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[12px] text-foreground-muted">Total this week</p>
            <p className="text-[17px] font-semibold text-foreground">{bookingTotal}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="success" className="px-2 py-0.5 text-[11px] shadow-none">
              {bookingComparison}
            </Badge>
            <span className="text-[12px] text-foreground-muted">vs last week</span>
          </div>
        </div>
      </Card>

      <Card padding="md" className="space-y-4 rounded-[0.85rem] border-border/85 shadow-[0_4px_14px_rgba(16,25,58,0.035)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[14px] font-semibold text-foreground">
            Revenue overview
          </h2>
          <label className="relative inline-flex">
            <select
              aria-label="Revenue currency"
              value={currency}
              onChange={(event) => onCurrencyChange(event.target.value)}
              className="h-8 appearance-none rounded-[0.55rem] border border-border/90 bg-white pl-3 pr-8 text-[12px] font-medium text-foreground outline-none"
            >
              <option value="egp">EGP</option>
              <option value="usd">USD</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
          </label>
        </div>

        <BarChart points={revenuePoints} />

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[12px] text-foreground-muted">Total this week</p>
            <p className="text-[17px] font-semibold text-foreground">{revenueTotal}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="success" className="px-2 py-0.5 text-[11px] shadow-none">
              {revenueComparison}
            </Badge>
            <span className="text-[12px] text-foreground-muted">vs last week</span>
          </div>
        </div>
      </Card>
    </section>
  );
}
