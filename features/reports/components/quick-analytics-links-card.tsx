import { ArrowRight } from "lucide-react";

import { Card } from "@/features/design-system";

export function QuickAnalyticsLinksCard({ links }: { links: string[] }) {
  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <h3 className="text-[14px] font-semibold text-foreground">Quick analytics links</h3>
      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link}
            href="#"
            className="flex items-center justify-between gap-3 rounded-[0.45rem] px-1 py-1.5 text-[11px] text-foreground hover:text-brand"
          >
            <span>{link}</span>
            <ArrowRight className="size-3.5" />
          </a>
        ))}
      </div>
    </Card>
  );
}
