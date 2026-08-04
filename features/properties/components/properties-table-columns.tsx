import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flag,
  Image as ImageIcon,
} from "lucide-react";

import { Avatar, Badge } from "@/features/design-system";

import type { PropertyRecord } from "../types";
import { PropertyThumbnail } from "@/features/overview/components/property-thumbnail";

export function PropertyCell({ property }: { property: PropertyRecord }) {
  return (
    <div className="flex items-start gap-2.5">
      <PropertyThumbnail variant={mapThumbnail(property.thumbnailKey)} />
      <div className="space-y-0.5">
        <p className="text-[13px] font-semibold text-foreground">{property.id}</p>
        <p className="text-[11px] text-foreground">{property.title}</p>
        <span className="inline-flex size-1.5 rounded-full bg-warning" />
      </div>
    </div>
  );
}

export function OwnerCell({ property }: { property: PropertyRecord }) {
  return (
    <div className="flex items-start gap-2.5">
      <Avatar name={property.ownerName} size="sm" />
      <div className="space-y-0.5">
        <p className="text-[12px] font-medium text-foreground">{property.ownerName}</p>
        <p className="text-[11px] text-foreground-muted capitalize">{property.ownerType}</p>
      </div>
    </div>
  );
}

export function PriceCell({ price }: { price: string }) {
  const [primary, secondary] = price.split(" / ");
  return (
    <div className="space-y-0.5">
      <p className="text-[12px] text-foreground">{primary}</p>
      <p className="text-[11px] text-foreground-muted">/ {secondary}</p>
    </div>
  );
}

export function QualityScoreCell({ score }: { score: number }) {
  const color =
    score >= 85 ? "text-success border-success/30" : score >= 70 ? "text-warning border-warning/30" : "text-danger border-danger/30";

  return (
    <div className={`inline-flex size-10 items-center justify-center rounded-full border-2 text-[14px] font-semibold ${color}`}>
      {score}
    </div>
  );
}

export function VerificationCell({ property }: { property: PropertyRecord }) {
  const icon =
    property.verificationState === "docs-complete" || property.verificationState === "hotel-verified" ? (
      <CheckCircle2 className="size-3.5 text-success" />
    ) : property.verificationState === "authorization-missing" ? (
      <Clock3 className="size-3.5 text-warning" />
    ) : property.verificationState === "risk-flag" ? (
      <Flag className="size-3.5 text-danger" />
    ) : (
      <ImageIcon className="size-3.5 text-warning" />
    );

  return (
    <div className="flex items-start gap-1.5">
      <span className="mt-0.5">{icon}</span>
      <span className="text-[12px] text-foreground">{property.verificationLabel}</span>
    </div>
  );
}

export function StatusCell({ property }: { property: PropertyRecord }) {
  const tone =
    property.status === "live"
      ? "success"
      : property.status === "under-review"
        ? "warning"
        : property.status === "reported"
          ? "danger"
          : "brand";

  return (
    <Badge tone={tone} className="inline-flex min-w-[86px] justify-center whitespace-nowrap px-2.5 py-0.5 text-[10px] shadow-none">
      {property.statusLabel}
    </Badge>
  );
}

export function PerformanceCell({ property }: { property: PropertyRecord }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[12px] text-foreground">{property.performancePrimary}</p>
      <p className="text-[11px] text-foreground-muted">{property.performanceSecondary}</p>
    </div>
  );
}

export function ActionCell({ property }: { property: PropertyRecord }) {
  return (
    <button
      type="button"
      className="inline-flex h-7 min-w-[76px] items-center justify-center gap-1 rounded-[0.4rem] border border-border/90 bg-white px-2.5 text-[11px] font-medium text-foreground"
    >
      <span>{property.actionLabel}</span>
      <ChevronDown className="size-3 text-foreground-subtle" />
    </button>
  );
}

function mapThumbnail(key: PropertyRecord["thumbnailKey"]) {
  return key === "modern"
    ? "zamalek"
    : key === "hotel"
      ? "sokhna"
      : key === "serviced"
        ? "new-cairo"
        : key === "balcony"
          ? "maadi"
          : "maadi";
}
