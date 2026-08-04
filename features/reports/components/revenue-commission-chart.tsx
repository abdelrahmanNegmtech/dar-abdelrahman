"use client";

import { useState } from "react";

import { ChevronDown } from "lucide-react";

import { Card } from "@/features/design-system";

import type { CombinedChartMonth } from "../types";

export function RevenueCommissionChart({ points }: { points: CombinedChartMonth[] }) {
  const [period, setPeriod] = useState("Monthly");
  const width = 760;
  const height = 290;
  const paddingX = 40;
  const topPadding = 28;
  const bottomPadding = 34;
  const chartHeight = height - topPadding - bottomPadding;
  const chartWidth = width - paddingX * 2;
  const maxValue = 10;
  const barStep = chartWidth / points.length;
  const barWidth = 28;

  const linePath = (key: "commission" | "refunds") =>
    points
      .map((point, index) => {
        const x = paddingX + index * barStep + barStep / 2;
        const y = topPadding + chartHeight - ((point[key] as number) / maxValue) * chartHeight;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h3 className="text-[14px] font-semibold text-foreground">1. Revenue and commission trend</h3>
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-foreground-muted">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand" /> Gross Booking Value (EGP)</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" /> DAR Commission (EGP)</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-danger" /> Refunds (EGP)</span>
          </div>
        </div>
        <div className="relative">
          <select
            aria-label="Revenue chart period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-8 appearance-none rounded-[0.45rem] border border-border/90 bg-white pl-3 pr-8 text-[11px] text-foreground"
          >
            <option>Monthly</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[290px] w-full" role="img" aria-label="Revenue and commission trend">
        {[0, 2, 4, 6, 8, 10].map((tick) => {
          const y = topPadding + chartHeight - (tick / maxValue) * chartHeight;
          return (
            <g key={tick}>
              <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#E7ECF5" strokeDasharray="3 5" />
              <text x={paddingX - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#64748B">
                {tick === 0 ? "0" : `${tick}M`}
              </text>
            </g>
          );
        })}

        {points.map((point, index) => {
          const x = paddingX + index * barStep + (barStep - barWidth) / 2;
          const h = (point.gbv / maxValue) * chartHeight;
          const y = topPadding + chartHeight - h;

          return (
            <g key={point.label}>
              <rect x={x} y={y} width={barWidth} height={h} rx="4" fill="#5B34E6" opacity="0.95" />
              <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="#64748B">
                {point.label}
              </text>
            </g>
          );
        })}

        <path d={linePath("commission")} fill="none" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d={linePath("refunds")} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Card>
  );
}
