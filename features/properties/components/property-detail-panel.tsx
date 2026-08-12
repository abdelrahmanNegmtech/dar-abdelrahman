import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Building2,
  CheckCircle2,
  FileText,
  Flag,
  Lock,
  MapPin,
  Pencil,
  Phone,
  Star,
  Sparkles,
  UserCircle2,
} from "lucide-react";

import { Badge, Button, RightPanel, Separator, Textarea } from "@/features/design-system";
import { moderatePropertyAction } from "@/features/admin/actions";

import type { PropertyChecklistItem, PropertyRecord } from "../types";

export function PropertyDetailPanel({
  property,
  checklist,
  adminNote,
  onAdminNoteChange,
  bookmarked,
  onToggleBookmark,
}: {
  property: PropertyRecord;
  checklist: PropertyChecklistItem[];
  adminNote: string;
  onAdminNoteChange: (value: string) => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  function runModerationAction(status: "approved" | "rejected" | "suspended") {
    startTransition(async () => {
      const result = await moderatePropertyAction({
        note: adminNote,
        propertyId: property.id,
        status,
      });

      setActionMessage(result.message);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <RightPanel className="rounded-[0.65rem] !p-4">
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[0.6rem] border border-border/80">
          <div className="h-[148px] bg-[linear-gradient(135deg,#7c6753_0%,#d7b18b_30%,#efdfca_55%,#59697a_100%)]" />
          <button
            type="button"
            onClick={onToggleBookmark}
            className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-[0.45rem] bg-white/90 text-foreground shadow-sm"
          >
            <Bookmark className={`size-4 ${bookmarked ? "fill-brand text-brand" : ""}`} />
          </button>
          <span className="absolute bottom-3 right-3 rounded-[0.4rem] bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">
            1 / 24
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-[15px] font-semibold text-foreground">{property.title}</h2>
          <div className="flex items-center gap-2 text-[12px] text-foreground-muted">
            <span>{property.id}</span>
            <span className="text-warning">•</span>
            <span className="text-warning">{property.statusLabel}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
            <UserCircle2 className="size-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-foreground">{property.ownerName}</p>
              {property.badgeLabel ? (
                <Badge tone="brand" className="px-2 py-0.5 text-[10px] shadow-none">
                  {property.badgeLabel}
                </Badge>
              ) : null}
            </div>
            <p className="text-[11px] text-foreground-muted">{property.phone}</p>
            <p className="text-[11px] text-foreground-muted">{property.email}</p>
            <div className="flex flex-wrap gap-3 text-[11px] text-success">
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Verified</span>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Verified</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <InfoItem icon={<Building2 className="size-4" />} label="Type" value={property.type} />
          <InfoItem icon={<MapPin className="size-4" />} label="City / Area" value="New Capital - R7" />
          <InfoItem icon={<Phone className="size-4" />} label="Price" value={property.price} />
          <InfoItem icon={<Star className="size-4 text-warning" />} label="Quality score" value={`${property.qualityScore} / 100`} />
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-[13px] font-semibold text-foreground">Verification checklist</h3>
          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-[12px]">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">
                    {item.state === "verified" ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : item.state === "pending" ? (
                      <Flag className="size-4 text-warning" />
                    ) : (
                      <Flag className="size-4 text-danger" />
                    )}
                  </span>
                  <span className="text-foreground">{item.label}</span>
                </div>
                {item.detail ? <span className="text-[11px] text-foreground-muted">{item.detail}</span> : null}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-foreground">Admin actions</h3>
          <div className="grid gap-2">
            <ActionButton
              variant="outline"
              icon={<CheckCircle2 className="size-4" />}
              className="!border-[#22C55E] !text-[#16A34A] shadow-none hover:!border-[#22C55E] hover:!bg-[rgba(34,197,94,0.06)]"
              disabled={isPending || property.status === "live"}
              onClick={() => runModerationAction("approved")}
            >
              Approve listing
            </ActionButton>
            <ActionButton
              variant="danger-outline"
              icon={<FileText className="size-4" />}
              className="!border-[#EF4444] !text-[#EF4444] shadow-none hover:!border-[#EF4444] hover:!bg-[rgba(239,68,68,0.06)]"
              disabled={isPending || property.status === "reported"}
              onClick={() => runModerationAction("rejected")}
            >
              Reject listing
            </ActionButton>
            <ActionButton
              variant="warning-outline"
              icon={<FileText className="size-4" />}
              className="!border-[#F59E0B] !text-[#D97706] shadow-none hover:!border-[#F59E0B] hover:!bg-[rgba(245,158,11,0.06)]"
              disabled
            >
              Request documents (Deferred)
            </ActionButton>
            <ActionButton
              variant="outline"
              icon={<Pencil className="size-4" />}
              className="!border-[#CBD5E1] !text-[#334155] shadow-none hover:!border-[#CBD5E1] hover:!bg-[#F8FAFC]"
              disabled
            >
              Edit property (Owner flow)
            </ActionButton>
            <ActionButton
              variant="danger-outline"
              icon={<Lock className="size-4" />}
              className="!border-[#EF4444] !text-[#EF4444] shadow-none hover:!border-[#EF4444] hover:!bg-[rgba(239,68,68,0.06)]"
              disabled={isPending || property.status !== "live"}
              onClick={() => runModerationAction("suspended")}
            >
              Suspend property
            </ActionButton>
            <ActionButton
              variant="outline"
              icon={<Sparkles className="size-4" />}
              className="!border-[#6C4CF1] !text-[#6C4CF1] shadow-none hover:!border-[#6C4CF1] hover:!bg-[rgba(108,76,241,0.06)]"
              disabled
            >
              Feature listing (Deferred)
            </ActionButton>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Textarea
            label="Admin notes"
            value={adminNote}
            onChange={(event) => onAdminNoteChange(event.target.value)}
            placeholder="Write internal notes about this property..."
            rows={3}
            className="min-h-20 resize-none rounded-[6px] text-sm"
          />
          <div className="text-[11px] text-foreground-muted">
            <p>Last updated by Admin Team</p>
            <p>{actionMessage ?? "Awaiting admin action."}</p>
          </div>
        </div>
      </div>
    </RightPanel>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-foreground-muted">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="text-[12px] text-foreground">{value}</p>
    </div>
  );
}

function ActionButton({
  children,
  variant,
  icon,
  className,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  variant: "outline" | "warning-outline" | "danger-outline";
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      variant={variant}
      size="sm"
      leadingIcon={icon}
      disabled={disabled}
      onClick={onClick}
      className={`h-8 justify-center rounded-[0.4rem] text-[11px] ${className ?? ""}`}
    >
      {children}
    </Button>
  );
}
