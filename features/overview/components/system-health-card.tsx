import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { Button, Card } from "@/features/design-system";

import type { SystemStatusItem } from "../types";

export function SystemHealthCard({ items }: { items: SystemStatusItem[] }) {
  return (
    <Card padding="md" className="rounded-[0.85rem] border-border/85 shadow-[0_4px_14px_rgba(16,25,58,0.035)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between xl:gap-8">
        <div className="flex items-center gap-3.5 xl:min-w-[280px]">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-success-soft text-success">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">System health</h2>
            <p className="text-[12px] text-foreground-muted">
              All systems are running smoothly.
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-x-10 gap-y-4 xl:justify-center">
          {items.map((item) => (
            <div key={item.label} className="min-w-[140px] space-y-1">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-success" aria-hidden="true" />
                <span className="text-[12px] font-medium text-foreground">{item.label}</span>
              </div>
              <p className="pl-4 text-[12px] text-success">{item.value}</p>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          trailingIcon={<ArrowUpRight className="size-4" />}
          className="h-10 shrink-0 rounded-[0.6rem] border-brand/40 px-4 text-[12px] font-semibold text-brand hover:border-brand hover:bg-brand-soft/20"
        >
          View status page
        </Button>
      </div>
    </Card>
  );
}
