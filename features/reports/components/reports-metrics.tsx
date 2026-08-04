import {
  BadgePercent,
  Building2,
  CircleDollarSign,
  CircleX,
  House,
  TicketCheck,
} from "lucide-react";

import { MetricCard } from "@/features/design-system";

import type { ReportsMetric } from "../types";
import { Sparkline } from "@/features/overview/components/sparkline";

const ICONS = {
  gbv: CircleDollarSign,
  bookings: TicketCheck,
  conversion: BadgePercent,
  commission: CircleDollarSign,
  properties: House,
  occupancy: Building2,
  refund: CircleX,
} satisfies Record<ReportsMetric["icon"], typeof CircleDollarSign>;

const SPARKLINE_COLORS = {
  brand: "#5B34E6",
  warning: "#F59E0B",
  danger: "#EF4444",
} satisfies Record<ReportsMetric["accent"], string>;

export function ReportsMetrics({ metrics }: { metrics: ReportsMetric[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {metrics.map((metric) => {
        const Icon = ICONS[metric.icon];
        return (
          <MetricCard
            key={metric.key}
            compact
            compactLayout="row-bottom"
            accent={metric.accent === "danger" ? "danger" : metric.accent === "warning" ? "warning" : "brand"}
            icon={<Icon className="size-[1rem]" />}
            label={metric.label}
            value={metric.value}
            className="min-h-[132px] rounded-[0.65rem] border-border/85 px-4 py-3 shadow-[0_3px_12px_rgba(16,25,58,0.03)]"
            iconContainerClassName="size-9 rounded-[0.55rem]"
            footer={
              <div className="space-y-2 pt-1">
                <div className="space-y-0.5 text-[10px]">
                  <div className={`font-semibold ${metric.accent === "danger" ? "text-danger" : "text-success"}`}>
                    {metric.delta}
                  </div>
                  <div className="text-foreground-muted">{metric.hint}</div>
                </div>
                <Sparkline
                  values={metric.sparkline}
                  color={SPARKLINE_COLORS[metric.accent]}
                  className="h-8 w-full"
                />
              </div>
            }
          />
        );
      })}
    </section>
  );
}
