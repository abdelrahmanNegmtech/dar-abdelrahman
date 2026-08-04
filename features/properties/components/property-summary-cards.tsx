import { ArrowRight, BadgeAlert, Camera, FileWarning, ListTodo, Lightbulb } from "lucide-react";

import { Card } from "@/features/design-system";

import type { PropertySummaryCard, QualityDistributionItem } from "../types";
import { QualityDistributionChart } from "./quality-distribution-chart";

const ICON_MAP = {
  brand: ListTodo,
  danger: BadgeAlert,
  warning: FileWarning,
  info: Camera,
} satisfies Record<PropertySummaryCard["tone"], typeof ListTodo>;

const TONE_CLASSES = {
  brand: "bg-brand-soft text-brand",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
} satisfies Record<PropertySummaryCard["tone"], string>;

export function PropertySummaryCards({
  summaries,
  qualityDistribution,
}: {
  summaries: {
    reviewQueue: PropertySummaryCard;
    reportedListings: PropertySummaryCard;
    missingDocuments: PropertySummaryCard;
    lowQualityPhotos: PropertySummaryCard;
  };
  qualityDistribution: QualityDistributionItem[];
}) {
  const summaryList = Object.values(summaries);

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(320px,1.25fr)]">
      <div className="space-y-3">
        {summaryList.slice(0, 2).map((summary) => (
          <SummaryMetricCard key={summary.title} summary={summary} />
        ))}
      </div>

      <div className="space-y-3">
        {summaryList.slice(2, 4).map((summary) => (
          <SummaryMetricCard key={summary.title} summary={summary} />
        ))}
      </div>

      <Card padding="md" className="flex h-full flex-col rounded-[0.65rem] border-border/90 shadow-[0_1px_4px_rgba(16,25,58,0.03)]">
        <h3 className="text-[13px] font-semibold text-foreground">Quality distribution</h3>
        <div className="flex flex-1 items-center gap-5">
          <div className="flex min-h-[180px] flex-[0_0_50%] items-center justify-center">
            <QualityDistributionChart items={qualityDistribution} />
          </div>
          <div className="flex-1 space-y-3">
            {qualityDistribution.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-foreground-muted">{item.label}</span>
                </div>
                <span className="font-medium text-foreground">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <a href="#" className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-brand">
          View analytics
          <ArrowRight className="size-3.5" />
        </a>
      </Card>
    </div>
  );
}

function SummaryMetricCard({ summary }: { summary: PropertySummaryCard }) {
  const Icon = ICON_MAP[summary.tone];

  return (
    <Card padding="md" className="space-y-3 rounded-[0.65rem] border-border/90 shadow-[0_1px_4px_rgba(16,25,58,0.03)]">
      <div className="flex items-start gap-6">
        <span className={`flex size-16 shrink-0 items-center justify-center rounded-[0.7rem] ${TONE_CLASSES[summary.tone]}`}>
          <Icon className="size-7" />
        </span>
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-foreground">{summary.title}</p>
          <p className="text-[30px] font-semibold leading-none text-foreground">{summary.value}</p>
          <p className="text-[12px] text-foreground-muted">{summary.subtitle}</p>
        </div>
      </div>
      <a href="#" className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand">
        {summary.linkLabel}
        <ArrowRight className="size-3.5" />
      </a>
    </Card>
  );
}

export function PropertyTipsCard() {
  return (
    <Card
      padding="none"
      className="w-full rounded-[12px] border px-4 py-4"
      style={{
        background:
          "linear-gradient(180deg, #FFF7E6 0%, #FFFBEF 55%, #FFFDF7 100%)",
        borderColor: "#F6DEAF",
        boxShadow: "0 4px 14px rgba(245, 158, 11, 0.08)",
      }}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[linear-gradient(180deg,#FFF7E8_0%,#FFF2D6_100%)] text-[#F59E0B]">
            <Lightbulb className="size-4" />
          </span>
          <div className="flex-1 space-y-1.5">
            <p className="mb-1.5 text-[15px] font-semibold text-[#0F172A]">Tips</p>
            <p className="text-[13px] leading-[1.5] text-[#64748B]">
              Keep quality scores high to improve search ranking and guest conversion.
            </p>
          </div>
        </div>
        <a href="#" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6C4CF1]">
          Learn more
          <ArrowRight className="size-3.5 text-[#6C4CF1]" />
        </a>
      </div>
    </Card>
  );
}
