import { Card } from "@/features/design-system";

export function ReviewsQualityCard() {
  const tags = ["Clean", "Location", "Wi-Fi", "Check-in", "Value"];

  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <h3 className="text-[14px] font-semibold text-foreground">9. Reviews &amp; quality analytics</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[0.55rem] border border-border/80 p-3">
          <p className="text-[10px] text-foreground-muted">Average rating</p>
          <p className="mt-2 text-[30px] font-semibold leading-none text-foreground">4.7</p>
          <p className="mt-1 text-[11px] text-warning">★ ★ ★ ★ ☆</p>
        </div>
        <div className="rounded-[0.55rem] border border-border/80 p-3">
          <p className="text-[10px] text-foreground-muted">Review volume</p>
          <p className="mt-2 text-[30px] font-semibold leading-none text-foreground">1,280</p>
          <p className="mt-1 text-[11px] text-success">▲ 14%</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-foreground-muted">Common positive mentions</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-[0.4rem] border border-border/80 bg-surface-muted px-2 py-1 text-[10px] text-foreground-muted">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[0.55rem] border border-border/80 p-3">
          <p className="text-[10px] text-foreground-muted">Low quality listings</p>
          <p className="mt-2 text-[26px] font-semibold text-foreground">42</p>
          <p className="text-[11px] text-success">▼ -8%</p>
        </div>
        <div className="rounded-[0.55rem] border border-border/80 p-3">
          <p className="text-[10px] text-foreground-muted">Photo quality average</p>
          <p className="mt-2 text-[26px] font-semibold text-foreground">8.1 / 10</p>
          <p className="text-[11px] text-success">▲ 0.3</p>
        </div>
      </div>
    </Card>
  );
}
