import {
  BadgeAlert,
  CircleAlert,
  CircleCheckBig,
  Dot,
  FileClock,
  Hotel,
  Home,
} from "lucide-react";

import { MetricCard } from "@/features/design-system";

import type { PropertyMetric } from "../types";

const ICONS = {
  property: Home,
  live: CircleCheckBig,
  review: CircleAlert,
  draft: FileClock,
  rejected: CircleAlert,
  reported: BadgeAlert,
  hotel: Hotel,
} satisfies Record<PropertyMetric["icon"], typeof Home>;

const TILE_CLASSES = {
  brand: "bg-brand/12 text-brand",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  neutral: "bg-slate-500/14 text-slate-500",
  danger: "bg-danger/12 text-danger",
} satisfies Record<PropertyMetric["accent"], string>;

const DOT_CLASSES = {
  brand: "text-brand",
  success: "text-success",
  warning: "text-warning",
  neutral: "text-slate-400",
  danger: "text-danger",
} satisfies Record<PropertyMetric["accent"], string>;

export function PropertiesMetrics({ metrics }: { metrics: PropertyMetric[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {metrics.map((metric) => {
        const Icon = ICONS[metric.icon];

        return (
          <MetricCard
            key={metric.key}
            compact
            accent={metric.accent === "neutral" ? "info" : metric.accent}
            icon={<Icon className="size-4 text-current" />}
            label={metric.label}
            value={metric.value}
            className="min-h-[92px] rounded-[0.65rem] border-border/85 px-3.5 py-3 shadow-[0_3px_12px_rgba(16,25,58,0.03)]"
            iconContainerClassName={`size-9 rounded-[0.55rem] ${TILE_CLASSES[metric.accent]}`}
            footer={
              <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
                <Dot className={`size-4 ${DOT_CLASSES[metric.accent]}`} />
                <span>{metric.hint}</span>
              </div>
            }
          />
        );
      })}
    </section>
  );
}
