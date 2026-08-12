import { Card } from "@/features/design-system";

import type { SignupSegment } from "../types";
import { DonutChart } from "./donut-chart";

export function UserSignupsCard({ segments }: { segments: SignupSegment[] }) {
  const totalLabel = segments.reduce((sum, segment) => sum + segment.value, 0).toLocaleString("en-US");

  return (
    <Card padding="md" className="space-y-4 rounded-[0.85rem] border-border/85 shadow-[0_4px_14px_rgba(16,25,58,0.035)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold text-foreground">User signups</h2>
        <a href="#" className="text-[12px] font-semibold text-brand">
          View report
        </a>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(230px,1fr)] xl:items-center">
        <div className="flex justify-center xl:justify-start">
          <DonutChart segments={segments} totalLabel={totalLabel} />
        </div>

        <div className="w-full space-y-3">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center justify-between gap-3 text-[12px]">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                <span className="font-medium text-foreground-muted">{segment.label}</span>
              </div>
              <span className="font-medium text-foreground">
                {segment.value.toLocaleString()} ({segment.percentageLabel})
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
