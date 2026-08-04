import { BrainCircuit } from "lucide-react";

import { Button, Card } from "@/features/design-system";

export function AiInsightsCard() {
  const insights = [
    "Madinaty demand peaks on weekends.",
    "InstaPay payments verify fastest.",
    "Listings with 8+ photos convert 23% better.",
    "Properties under EGP 1,500/night get higher search clicks.",
  ];

  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground">10. AI business insights</h3>
        <p className="mt-1 text-[10px] text-foreground-muted">Based on last 30 days of data</p>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div key={insight} className="flex items-start gap-2 rounded-[0.55rem] bg-brand-soft/30 px-2.5 py-2 text-[11px] text-foreground">
            <BrainCircuit className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>{insight}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="h-8 rounded-[0.45rem] text-[11px] text-brand border-brand/25 hover:bg-brand-soft/15">
          Generate report
        </Button>
        <Button variant="primary" size="sm" className="h-8 rounded-[0.45rem] text-[11px]">
          Create action plan
        </Button>
      </div>
    </Card>
  );
}
