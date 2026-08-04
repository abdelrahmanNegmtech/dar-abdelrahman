"use client";

import { MoreVertical, FileText } from "lucide-react";

import { Card } from "@/features/design-system";

import type { SavedReportRow } from "../types";

export function SavedReportsCard({ rows }: { rows: SavedReportRow[] }) {
  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-foreground">Saved reports</h3>
        <a href="#" className="text-[11px] font-semibold text-foreground-muted">View all</a>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.title} className="flex items-start gap-3 rounded-[0.55rem] border border-border/80 p-3">
            <span className="mt-0.5 flex size-7 items-center justify-center rounded-[0.4rem] bg-brand-soft text-brand">
              <FileText className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-foreground">{row.title}</p>
              <p className="mt-1 text-[10px] text-foreground-muted">
                {row.cadence} · {row.lastRun}
              </p>
            </div>
            <button type="button" aria-label={`Actions for ${row.title}`} className="text-foreground-subtle">
              <MoreVertical className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
