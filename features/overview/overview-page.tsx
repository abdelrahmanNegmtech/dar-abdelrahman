"use client";

import { useState } from "react";

import { AdminBrand, AppShell, PageContainer, Sidebar, SidebarSupportCard } from "@/features/design-system";

import { overviewPageData } from "./data/overview.data";
import type { OverviewPageData } from "./types";
import { OverviewCharts } from "./components/overview-charts";
import { OverviewHeader } from "./components/overview-header";
import { OverviewMetricGrid } from "./components/overview-metric-grid";
import { RecentBookingsCard } from "./components/recent-bookings-card";
import { SystemHealthCard } from "./components/system-health-card";
import { TopPropertiesCard } from "./components/top-properties-card";
import { UserSignupsCard } from "./components/user-signups-card";

export function OverviewPage({ pageData = overviewPageData }: { pageData?: OverviewPageData }) {
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState(pageData.dateRanges[0]?.value ?? "");
  const [currency, setCurrency] = useState(pageData.currencyOptions[0]?.value ?? "egp");

  return (
    <AppShell
      mainClassName="bg-white py-4 md:py-5"
      sidebar={
        <Sidebar
          brand={<AdminBrand />}
          groups={pageData.sidebarGroups}
          footer={<SidebarSupportCard />}
          theme="dark"
        />
      }
      topbar={
        <OverviewHeader
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          dateRanges={pageData.dateRanges}
          quickActions={pageData.quickActions}
        />
      }
    >
      <PageContainer className="space-y-4">
        <OverviewMetricGrid metrics={pageData.metrics} />

        <OverviewCharts
          bookingPoints={pageData.bookingOverview.points}
          bookingTotal={pageData.bookingOverview.totalLabel}
          bookingComparison={pageData.bookingOverview.comparisonValue}
          revenuePoints={pageData.revenueOverview.points}
          revenueTotal={pageData.revenueOverview.totalLabel}
          revenueComparison={pageData.revenueOverview.comparisonValue}
          currency={currency}
          onCurrencyChange={setCurrency}
        />

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.88fr_0.9fr]">
          <RecentBookingsCard items={pageData.recentBookings} />
          <TopPropertiesCard items={pageData.topProperties} />
          <UserSignupsCard segments={pageData.signupSegments} />
        </section>

        <SystemHealthCard items={pageData.systemStatus} />
      </PageContainer>
    </AppShell>
  );
}
