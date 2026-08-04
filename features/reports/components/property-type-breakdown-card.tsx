import { Card } from "@/features/design-system";

import type { PropertyTypeBreakdownItem } from "../types";

export function PropertyTypeBreakdownCard({
  items,
}: {
  items: PropertyTypeBreakdownItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.percentage, 0);
  const stops = items.reduce<string[]>((acc, item, index) => {
    const previous = items.slice(0, index).reduce((sum, entry) => sum + entry.percentage, 0);
    const start = (previous / total) * 100;
    const end = ((previous + item.percentage) / total) * 100;
    acc.push(`${item.color} ${start}% ${end}%`);
    return acc;
  }, []);

  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <h3 className="text-[14px] font-semibold text-foreground">4. Property type breakdown</h3>
      <div className="grid gap-4 xl:grid-cols-[180px_minmax(0,1fr)] xl:items-center">
        <div className="flex justify-center">
          <div
            className="relative size-[150px] rounded-full"
            style={{ background: `conic-gradient(${stops.join(", ")})` }}
          >
            <div className="absolute inset-[26px] rounded-full bg-white" />
          </div>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-3 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="mt-1 size-2 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-foreground-muted">{item.avgPrice}</p>
                </div>
              </div>
              <span className="font-semibold text-foreground">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
