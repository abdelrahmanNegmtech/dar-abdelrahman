import {
  Building2,
  CalendarCheck2,
  DollarSign,
  Users,
} from "lucide-react";

import { MetricCard } from "@/features/design-system";

import type { OverviewMetric } from "../types";
import { Sparkline } from "./sparkline";

const METRIC_ICON_MAP = {
  users: Users,
  property: Building2,
  bookings: CalendarCheck2,
  revenue: DollarSign,
} satisfies Record<OverviewMetric["icon"], typeof Users>;

const SPARKLINE_COLORS = {
  brand: "#6B42F2",
  info: "#3B82F6",
  success: "#16A34A",
  warning: "#F59E0B",
} satisfies Record<OverviewMetric["accent"], string>;

export function OverviewMetricGrid({ metrics }: { metrics: OverviewMetric[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = METRIC_ICON_MAP[metric.icon];

        return (
          <MetricCard
            key={metric.key}
            compact
            accent={metric.accent}
            icon={<Icon className="size-[1.2rem] text-white" />}
            label={metric.label}
            value={metric.value}
            trend={{
              value: metric.trendValue,
              direction: "up",
              label: metric.trendLabel,
            }}
            className="min-h-[124px] rounded-[0.75rem] border-border/85 px-5 py-4 shadow-[0_3px_14px_rgba(16,25,58,0.035)]"
            iconContainerClassName={
              metric.accent === "brand"
                ? "size-12 rounded-[0.65rem] bg-brand text-white ring-0"
                : metric.accent === "info"
                  ? "size-12 rounded-[0.65rem] bg-info text-white ring-0"
                  : metric.accent === "success"
                    ? "size-12 rounded-[0.65rem] bg-success text-white ring-0"
                    : "size-12 rounded-[0.65rem] bg-[#F59E0B] text-white ring-0"
            }
            trailing={
              <Sparkline
                values={metric.sparkline}
                color={SPARKLINE_COLORS[metric.accent]}
                className="h-10 w-[92px]"
              />
            }
          />
        );
      })}
    </section>
  );
}
