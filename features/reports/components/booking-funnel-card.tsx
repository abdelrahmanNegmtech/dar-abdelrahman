import { Card } from "@/features/design-system";

import type { FunnelStep } from "../types";

export function BookingFunnelCard({ steps }: { steps: FunnelStep[] }) {
  const widths = ["100%", "84%", "68%", "52%", "44%", "38%"];

  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <h3 className="text-[14px] font-semibold text-foreground">2. Booking funnel</h3>
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col items-center pt-2">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className="flex h-9 items-center justify-center bg-[linear-gradient(180deg,#5B34E6,#8B5CF6)] text-[10px] font-semibold text-white"
              style={{
                width: widths[index],
                clipPath: "polygon(8% 0, 92% 0, 84% 100%, 16% 100%)",
                opacity: 1 - index * 0.08,
              }}
            />
          ))}
        </div>
        <div className="space-y-2">
          {steps.map((step) => (
            <div key={step.label} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border/70 pb-2 text-[11px] last:border-b-0 last:pb-0">
              <span className="text-foreground-muted">{step.label}</span>
              <span className="font-medium text-foreground">{step.value}</span>
              <span className="w-[44px] text-right text-foreground-muted">{step.conversion ?? ""}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
