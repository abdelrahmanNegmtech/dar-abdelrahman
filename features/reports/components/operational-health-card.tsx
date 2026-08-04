import { Card } from "@/features/design-system";

export function OperationalHealthCard() {
  const top = [
    { label: "Pending approvals", value: "184", tone: "High", toneClass: "text-danger" },
    { label: "Payment reviews", value: "48", tone: "Medium", toneClass: "text-warning" },
    { label: "Open disputes", value: "47", tone: "High", toneClass: "text-danger" },
    { label: "Support tickets", value: "112", tone: "Medium", toneClass: "text-warning" },
  ];

  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <h3 className="text-[14px] font-semibold text-foreground">8. Operational health</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {top.map((item) => (
          <div key={item.label} className="rounded-[0.55rem] border border-border/80 bg-white p-3">
            <p className="text-[10px] text-foreground-muted">{item.label}</p>
            <p className="mt-2 text-[26px] font-semibold leading-none text-foreground">{item.value}</p>
            <p className={`mt-2 text-[11px] font-medium ${item.toneClass}`}>{item.tone}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[0.55rem] border border-border/80 p-3">
          <p className="text-[10px] text-foreground-muted">Avg. owner response time</p>
          <p className="mt-2 text-[26px] font-semibold text-foreground">22 min</p>
          <p className="mt-1 text-[11px] text-success">▼ -3 min</p>
          <p className="text-[10px] text-foreground-muted">vs prev. 30 days</p>
        </div>
        <div className="rounded-[0.55rem] border border-border/80 p-3">
          <p className="text-[10px] text-foreground-muted">Avg. admin approval time</p>
          <p className="mt-2 text-[26px] font-semibold text-foreground">3h 24m</p>
          <p className="mt-1 text-[11px] text-success">▼ -45m</p>
          <p className="text-[10px] text-foreground-muted">vs prev. 30 days</p>
        </div>
      </div>
    </Card>
  );
}
