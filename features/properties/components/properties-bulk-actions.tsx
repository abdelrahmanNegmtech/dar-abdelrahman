import { Ellipsis, FileText, ShieldCheck, UserRoundCheck, EyeOff } from "lucide-react";

import { Button, Checkbox } from "@/features/design-system";

export function PropertiesBulkActions({
  selectedCount,
}: {
  selectedCount: number;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[0.65rem] border border-border/90 bg-white px-4 py-3 shadow-[0_1px_4px_rgba(16,25,58,0.03)] xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-3">
        <Checkbox id="property-bulk-select" label="" aria-label="Bulk select" />
        <p className="text-[12px] font-medium text-foreground-muted">{selectedCount} selected</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="success" size="sm" leadingIcon={<ShieldCheck className="size-4" />} className="h-9 rounded-[0.4rem] px-3 text-[11px]">
          Approve selected
        </Button>
        <Button variant="warning-outline" size="sm" leadingIcon={<FileText className="size-4" />} className="h-9 rounded-[0.4rem] px-3 text-[11px]">
          Request documents
        </Button>
        <Button variant="danger-outline" size="sm" leadingIcon={<EyeOff className="size-4" />} className="h-9 rounded-[0.4rem] px-3 text-[11px]">
          Hide selected
        </Button>
        <Button variant="outline" size="sm" className="h-9 rounded-[0.4rem] px-3 text-[11px]">
          Export selected
        </Button>
        <Button variant="outline" size="sm" leadingIcon={<UserRoundCheck className="size-4" />} className="h-9 rounded-[0.4rem] px-3 text-[11px] text-brand border-brand/30 hover:border-brand/40 hover:bg-brand-soft/15">
          Assign reviewer
        </Button>
        <Button variant="outline" size="sm" className="h-9 w-9 rounded-[0.4rem] px-0">
          <Ellipsis className="size-4" />
        </Button>
      </div>
    </div>
  );
}
