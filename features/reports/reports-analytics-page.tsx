"use client";

import { useState } from "react";

import { AdminBrand, AppShell, PageContainer, Sidebar, SidebarSupportCard } from "@/features/design-system";

import { reportsAnalyticsData } from "./data/reports-analytics.data";
import type { ReportsFilters, ReportsPageData } from "./types";
import { AiInsightsCard } from "./components/ai-insights-card";
import { BookingFunnelCard } from "./components/booking-funnel-card";
import { CityPerformanceCard } from "./components/city-performance-card";
import { DataFreshnessCard } from "./components/data-freshness-card";
import { OwnerPerformanceCard } from "./components/owner-performance-card";
import { OperationalHealthCard } from "./components/operational-health-card";
import { PaymentMethodsCard } from "./components/payment-methods-card";
import { PropertyTypeBreakdownCard } from "./components/property-type-breakdown-card";
import { QuickAnalyticsLinksCard } from "./components/quick-analytics-links-card";
import { ReportsFilters as FiltersToolbar } from "./components/reports-filters";
import { ReportsHeader } from "./components/reports-header";
import { ReportsMetrics } from "./components/reports-metrics";
import { RevenueCommissionChart } from "./components/revenue-commission-chart";
import { ReviewsQualityCard } from "./components/reviews-quality-card";
import { SavedReportsCard } from "./components/saved-reports-card";
import { ScheduleReportCard } from "./components/schedule-report-card";
import { TopPropertiesReportCard } from "./components/top-properties-report-card";

export function ReportsAnalyticsPage({ pageData = reportsAnalyticsData }: { pageData?: ReportsPageData }) {
  const [filters, setFilters] = useState<ReportsFilters>({
    range: "30",
    city: "all",
    propertyType: "all",
    ownerType: "all",
    paymentMethod: "all",
    comparePrevious: true,
  });

  function updateFilter<K extends keyof ReportsFilters>(key: K, value: ReportsFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <AppShell
      mainClassName="bg-white py-3 md:py-4"
      sidebar={
        <Sidebar
          brand={<AdminBrand />}
          groups={pageData.sidebarGroups}
          footer={<SidebarSupportCard />}
          theme="dark"
        />
      }
      topbar={<ReportsHeader />}
    >
      <PageContainer className="space-y-4 pt-1 md:pt-2">
        <FiltersToolbar
          filters={filters}
          onChange={updateFilter}
          options={pageData.filterOptions}
        />

        <ReportsMetrics metrics={pageData.metrics} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[1.22fr_0.95fr_1.08fr]">
              <RevenueCommissionChart points={pageData.revenueTrend} />
              <BookingFunnelCard steps={pageData.funnel} />
              <CityPerformanceCard rows={pageData.cityPerformance} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr_1.22fr]">
              <PropertyTypeBreakdownCard items={pageData.propertyTypeBreakdown} />
              <PaymentMethodsCard rows={pageData.paymentMethods} />
              <TopPropertiesReportCard rows={pageData.topProperties} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.25fr_1.05fr_0.95fr_0.95fr]">
              <OwnerPerformanceCard rows={pageData.ownerPerformance} />
              <OperationalHealthCard />
              <ReviewsQualityCard />
              <AiInsightsCard />
            </div>

            <p className="text-[11px] text-foreground-muted">
              All values are in EGP (Egyptian Pound) unless otherwise noted.
            </p>
          </div>

          <div className="min-w-0 space-y-4">
            <SavedReportsCard rows={pageData.savedReports} />
            <ScheduleReportCard />
            <QuickAnalyticsLinksCard links={pageData.quickLinks} />
            <DataFreshnessCard />
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
